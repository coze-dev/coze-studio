/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package httprequester

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/crypto"
)

var extractBracesRegexp = regexp.MustCompile(`\{\{(.*?)}}`)

func extractBracesContent(s string) []string {
	matches := extractBracesRegexp.FindAllStringSubmatch(s, -1)
	var result []string
	for _, match := range matches {
		if len(match) >= 2 {
			result = append(result, match[1])
		}
	}
	return result
}

type ImplicitNodeDependency struct {
	NodeID    string
	FieldPath compose.FieldPath
	TypeInfo  *vo.TypeInfo
}

func extractImplicitDependency(node *vo.Node, canvas *vo.Canvas) ([]*ImplicitNodeDependency, error) {
	dependencies := make([]*ImplicitNodeDependency, 0, len(canvas.Nodes))
	url := node.Data.Inputs.APIInfo.URL
	urlVars := extractBracesContent(url)
	hasReferred := make(map[string]bool)
	extractDependenciesFromVars := func(vars []string) error {
		for _, v := range vars {
			if strings.HasPrefix(v, "block_output_") {
				paths := strings.Split(strings.TrimPrefix(v, "block_output_"), ".")
				if len(paths) < 2 {
					return fmt.Errorf("invalid block_output_ variable: %s", v)
				}
				if hasReferred[v] {
					continue
				}
				hasReferred[v] = true
				dependencies = append(dependencies, &ImplicitNodeDependency{
					NodeID:    paths[0],
					FieldPath: paths[1:],
				})
			}
		}
		return nil
	}

	err := extractDependenciesFromVars(urlVars)
	if err != nil {
		return nil, err
	}
	if node.Data.Inputs.Body.BodyType == string(BodyTypeJSON) {
		jsonVars := extractBracesContent(node.Data.Inputs.Body.BodyData.Json)
		err = extractDependenciesFromVars(jsonVars)
		if err != nil {
			return nil, err
		}
	}
	if node.Data.Inputs.Body.BodyType == string(BodyTypeRawText) {
		rawTextVars := extractBracesContent(node.Data.Inputs.Body.BodyData.Json)
		err = extractDependenciesFromVars(rawTextVars)
		if err != nil {
			return nil, err
		}
	}

	var nodeFinder func(nodes []*vo.Node, nodeID string) *vo.Node
	nodeFinder = func(nodes []*vo.Node, nodeID string) *vo.Node {
		for i := range nodes {
			if nodes[i].ID == nodeID {
				return nodes[i]
			}
			if len(nodes[i].Blocks) > 0 {
				if n := nodeFinder(nodes[i].Blocks, nodeID); n != nil {
					return n
				}
			}
		}
		return nil
	}
	for _, ds := range dependencies {
		fNode := nodeFinder(canvas.Nodes, ds.NodeID)
		if fNode == nil {
			continue
		}
		tInfoMap := make(map[string]*vo.TypeInfo, len(node.Data.Outputs))
		for _, vAny := range fNode.Data.Outputs {
			v, err := vo.ParseVariable(vAny)
			if err != nil {
				return nil, err
			}
			tInfo, err := convert.CanvasVariableToTypeInfo(v)
			if err != nil {
				return nil, err
			}
			tInfoMap[v.Name] = tInfo
		}
		tInfo, ok := getTypeInfoByPath(ds.FieldPath[0], ds.FieldPath[1:], tInfoMap)
		if !ok {
			return nil, fmt.Errorf("cannot find type info for dependency: %s", ds.FieldPath)
		}
		ds.TypeInfo = tInfo
	}

	return dependencies, nil
}

func getTypeInfoByPath(root string, properties []string, tInfoMap map[string]*vo.TypeInfo) (*vo.TypeInfo, bool) {
	if len(properties) == 0 {
		if tInfo, ok := tInfoMap[root]; ok {
			return tInfo, true
		}
		return nil, false
	}
	tInfo, ok := tInfoMap[root]
	if !ok {
		return nil, false
	}
	return getTypeInfoByPath(properties[0], properties[1:], tInfo.Properties)
}

var globalVariableRegex = regexp.MustCompile(`global_variable_\w+\s*\["(.*?)"]`)

func setHttpRequesterInputsForNodeSchema(n *vo.Node, ns *schema.NodeSchema, implicitNodeDependencies []*ImplicitNodeDependency) (err error) {
	inputs := n.Data.Inputs
	implicitPathVars := make(map[string]bool)
	addImplicitVarsSources := func(prefix string, vars []string) error {
		for _, v := range vars {
			if strings.HasPrefix(v, "block_output_") {
				paths := strings.Split(strings.TrimPrefix(v, "block_output_"), ".")
				if len(paths) < 2 {
					return fmt.Errorf("invalid implicit var : %s", v)
				}
				for _, dep := range implicitNodeDependencies {
					if dep.NodeID == paths[0] && strings.Join(dep.FieldPath, ".") == strings.Join(paths[1:], ".") {
						pathValue := prefix + crypto.MD5HexValue(v)
						if _, visited := implicitPathVars[pathValue]; visited {
							continue
						}
						implicitPathVars[pathValue] = true
						ns.SetInputType(pathValue, dep.TypeInfo)
						ns.AddInputSource(&vo.FieldInfo{
							Path: []string{pathValue},
							Source: vo.FieldSource{
								Ref: &vo.Reference{
									FromNodeKey: vo.NodeKey(dep.NodeID),
									FromPath:    dep.FieldPath,
								},
							},
						})
					}
				}
			}
			if strings.HasPrefix(v, "global_variable_") {
				matches := globalVariableRegex.FindStringSubmatch(v)
				if len(matches) < 2 {
					continue
				}

				var varType vo.GlobalVarType
				if strings.HasPrefix(v, string(vo.RefSourceTypeGlobalApp)) {
					varType = vo.GlobalAPP
				} else if strings.HasPrefix(v, string(vo.RefSourceTypeGlobalUser)) {
					varType = vo.GlobalUser
				} else if strings.HasPrefix(v, string(vo.RefSourceTypeGlobalSystem)) {
					varType = vo.GlobalSystem
				} else {
					return fmt.Errorf("invalid global variable type: %s", v)
				}

				source := vo.FieldSource{
					Ref: &vo.Reference{
						VariableType: &varType,
						FromPath:     []string{matches[1]},
					},
				}

				ns.AddInputSource(&vo.FieldInfo{
					Path:   []string{prefix + crypto.MD5HexValue(v)},
					Source: source,
				})

			}
		}

		return nil
	}

	urlVars := extractBracesContent(inputs.APIInfo.URL)
	err = addImplicitVarsSources("__apiInfo_url_", urlVars)
	if err != nil {
		return err
	}

	err = applyParamsToSchema(ns, "__headers_", inputs.Headers, n.Parent())
	if err != nil {
		return err
	}

	err = applyParamsToSchema(ns, "__params_", inputs.Params, n.Parent())
	if err != nil {
		return err
	}

	if inputs.Auth != nil && inputs.Auth.AuthOpen {
		authData := inputs.Auth.AuthData
		const bearerTokenKey = "__auth_authData_bearerTokenData_token"
		if inputs.Auth.AuthType == "BEARER_AUTH" {
			bearTokenParam := authData.BearerTokenData[0]
			tInfo, err := convert.CanvasBlockInputToTypeInfo(bearTokenParam.Input)
			if err != nil {
				return err
			}
			ns.SetInputType(bearerTokenKey, tInfo)
			sources, err := convert.CanvasBlockInputToFieldInfo(bearTokenParam.Input, compose.FieldPath{bearerTokenKey}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

		}

		if inputs.Auth.AuthType == "CUSTOM_AUTH" {
			const (
				customDataDataKey   = "__auth_authData_customData_data_Key"
				customDataDataValue = "__auth_authData_customData_data_Value"
			)
			dataParams := authData.CustomData.Data
			keyParam := dataParams[0]
			keyTypeInfo, err := convert.CanvasBlockInputToTypeInfo(keyParam.Input)
			if err != nil {
				return err
			}
			ns.SetInputType(customDataDataKey, keyTypeInfo)
			sources, err := convert.CanvasBlockInputToFieldInfo(keyParam.Input, compose.FieldPath{customDataDataKey}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

			valueParam := dataParams[1]
			valueTypeInfo, err := convert.CanvasBlockInputToTypeInfo(valueParam.Input)
			if err != nil {
				return err
			}
			ns.SetInputType(customDataDataValue, valueTypeInfo)
			sources, err = convert.CanvasBlockInputToFieldInfo(valueParam.Input, compose.FieldPath{customDataDataValue}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)
		}
	}

	switch BodyType(inputs.Body.BodyType) {
	case BodyTypeFormData:
		err = applyParamsToSchema(ns, "__body_bodyData_formData_", inputs.Body.BodyData.FormData.Data, n.Parent())
		if err != nil {
			return err
		}
	case BodyTypeFormURLEncoded:
		err = applyParamsToSchema(ns, "__body_bodyData_formURLEncoded_", inputs.Body.BodyData.FormURLEncoded, n.Parent())
		if err != nil {
			return err
		}
	case BodyTypeBinary:
		const fileURLName = "__body_bodyData_binary_fileURL"
		fileURLInput := inputs.Body.BodyData.Binary.FileURL
		ns.SetInputType(fileURLName, &vo.TypeInfo{
			Type: vo.DataTypeString,
		})
		sources, err := convert.CanvasBlockInputToFieldInfo(fileURLInput, compose.FieldPath{fileURLName}, n.Parent())
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	case BodyTypeJSON:
		jsonVars := extractBracesContent(inputs.Body.BodyData.Json)
		err = addImplicitVarsSources("__body_bodyData_json_", jsonVars)
		if err != nil {
			return err
		}
	case BodyTypeRawText:
		rawTextVars := extractBracesContent(inputs.Body.BodyData.RawText)
		err = addImplicitVarsSources("__body_bodyData_rawText_", rawTextVars)
		if err != nil {
			return err
		}
	}

	return nil
}

func applyParamsToSchema(ns *schema.NodeSchema, prefix string, params []*vo.Param, parentNode *vo.Node) error {
	for i := range params {
		param := params[i]
		name := param.Name
		tInfo, err := convert.CanvasBlockInputToTypeInfo(param.Input)
		if err != nil {
			return err
		}

		fieldName := prefix + crypto.MD5HexValue(name)
		ns.SetInputType(fieldName, tInfo)
		sources, err := convert.CanvasBlockInputToFieldInfo(param.Input, compose.FieldPath{fieldName}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}
	return nil
}
