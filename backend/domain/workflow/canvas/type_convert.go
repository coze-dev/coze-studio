package canvas

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/schema"
)

func (v *Variable) ToTypeInfo() (*nodes.TypeInfo, error) {
	tInfo := &nodes.TypeInfo{
		Required: v.Required,
	}

	switch v.Type {
	case VariableTypeString:
		switch v.AssistType {
		case AssistTypeTime:
			tInfo.Type = nodes.DataTypeTime
		case AssistTypeNotSet:
			tInfo.Type = nodes.DataTypeString
		default:
			fileType, ok := assistTypeToFileType(v.AssistType)
			if ok {
				tInfo.Type = nodes.DataTypeFile
				tInfo.FileType = &fileType
			} else {
				return nil, fmt.Errorf("unsupported assist type: %v", v.AssistType)
			}
		}
	case VariableTypeInteger:
		tInfo.Type = nodes.DataTypeInteger
	case VariableTypeFloat:
		tInfo.Type = nodes.DataTypeNumber
	case VariableTypeBoolean:
		tInfo.Type = nodes.DataTypeBoolean
	case VariableTypeObject:
		tInfo.Type = nodes.DataTypeObject
		tInfo.Properties = make(map[string]*nodes.TypeInfo)
		for _, subVAny := range v.Schema.([]any) {
			subV, err := parseVariable(subVAny)
			if err != nil {
				return nil, err
			}
			subTInfo, err := subV.ToTypeInfo()
			if err != nil {
				return nil, err
			}
			tInfo.Properties[subV.Name] = subTInfo
		}
	case VariableTypeList:
		tInfo.Type = nodes.DataTypeArray
		subVAny := v.Schema
		subV, err := parseVariable(subVAny)
		if err != nil {
			return nil, err
		}
		subTInfo, err := subV.ToTypeInfo()
		if err != nil {
			return nil, err
		}
		tInfo.ElemType = &subTInfo.Type
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", v.Type)
	}

	return tInfo, nil
}

func (b *BlockInput) ToTypeInfo() (*nodes.TypeInfo, error) {
	tInfo := &nodes.TypeInfo{}

	if b == nil {
		return tInfo, nil
	}

	switch b.Type {
	case VariableTypeString:
		switch b.AssistType {
		case AssistTypeTime:
			tInfo.Type = nodes.DataTypeTime
		case AssistTypeNotSet:
			tInfo.Type = nodes.DataTypeString
		default:
			fileType, ok := assistTypeToFileType(b.AssistType)
			if ok {
				tInfo.Type = nodes.DataTypeFile
				tInfo.FileType = &fileType
			} else {
				return nil, fmt.Errorf("unsupported assist type: %v", b.AssistType)
			}
		}
	case VariableTypeInteger:
		tInfo.Type = nodes.DataTypeInteger
	case VariableTypeFloat:
		tInfo.Type = nodes.DataTypeNumber
	case VariableTypeBoolean:
		tInfo.Type = nodes.DataTypeBoolean
	case VariableTypeObject:
		tInfo.Type = nodes.DataTypeObject
		tInfo.Properties = make(map[string]*nodes.TypeInfo)
		for _, subVAny := range b.Schema.([]any) {
			if b.Value.Type == BlockInputValueTypeRef {
				subV, err := parseVariable(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := subV.ToTypeInfo()
				if err != nil {
					return nil, err
				}
				tInfo.Properties[subV.Name] = subTInfo
			} else if b.Value.Type == BlockInputValueTypeObjectRef {
				subV, err := parseParam(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := subV.Input.ToTypeInfo()
				if err != nil {
					return nil, err
				}
				tInfo.Properties[subV.Name] = subTInfo
			}
		}
	case VariableTypeList:
		tInfo.Type = nodes.DataTypeArray
		subVAny := b.Schema
		subV, err := parseVariable(subVAny)
		if err != nil {
			return nil, err
		}
		subTInfo, err := subV.ToTypeInfo()
		if err != nil {
			return nil, err
		}
		tInfo.ElemType = &subTInfo.Type
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", b.Type)
	}

	return tInfo, nil
}

func (b *BlockInput) ToInputSource(path compose.FieldPath, parentNodeID string) (sources []*nodes.FieldInfo, err error) {
	value := b.Value
	if value == nil {
		return nil, fmt.Errorf("input %v has no value, type= %s", path, b.Type)
	}

	switch value.Type {
	case BlockInputValueTypeObjectRef:
		sc := b.Schema
		if sc == nil {
			return nil, fmt.Errorf("input %v has no schema, type= %s", path, b.Type)
		}

		paramList, ok := sc.([]any)
		if !ok {
			return nil, fmt.Errorf("input %v schema not []any, type= %T", path, sc)
		}

		for i := range paramList {
			paramAny := paramList[i]
			param, err := parseParam(paramAny)
			if err != nil {
				return nil, err
			}

			copied := make([]string, len(path))
			copy(copied, path)
			subFieldInfo, err := param.Input.ToInputSource(append(copied, param.Name), parentNodeID)
			if err != nil {
				return nil, err
			}
			sources = append(sources, subFieldInfo...)
		}
		return sources, nil
	case BlockInputValueTypeLiteral:
		content := value.Content
		if content == nil {
			return nil, fmt.Errorf("input %v is literal but has no value, type= %s", path, b.Type)
		}

		switch b.Type {
		case VariableTypeObject:
			m := make(map[string]any)
			if err = sonic.UnmarshalString(content.(string), &m); err != nil {
				return nil, err
			}
			content = m
		case VariableTypeList:
			l := make([]any, 0)
			if err = sonic.UnmarshalString(content.(string), &l); err != nil {
				return nil, err
			}
			content = l
		}

		return []*nodes.FieldInfo{
			{
				Path: path,
				Source: nodes.FieldSource{
					Val: content,
				},
			},
		}, nil
	case BlockInputValueTypeRef:
		content := value.Content
		if content == nil {
			return nil, fmt.Errorf("input %v is literal but has no value, type= %s", path, b.Type)
		}

		ref, err := parseBlockInputRef(content)
		if err != nil {
			return nil, err
		}

		fieldSource, err := ref.ToFieldSource()
		if err != nil {
			return nil, err
		}

		if fieldSource.Ref != nil && len(fieldSource.Ref.FromNodeKey) > 0 && fieldSource.Ref.FromNodeKey == nodes.NodeKey(parentNodeID) {
			fieldSource.Ref.FromNodeKey = ""
			pi := variable.ParentIntermediate
			fieldSource.Ref.VariableType = &pi
		}

		return []*nodes.FieldInfo{
			{
				Path:   path,
				Source: *fieldSource,
			},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported value type: %s for blockInput type= %s", value.Type, b.Type)
	}
}

func parseBlockInputRef(content any) (*BlockInputReference, error) {
	m, ok := content.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse BlockInputRef", content)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &BlockInputReference{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func parseParam(v any) (*Param, error) {
	m, ok := v.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse Param", v)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &Param{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func parseVariable(v any) (*Variable, error) {
	m, ok := v.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse Variable", v)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &Variable{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func (r *BlockInputReference) ToFieldSource() (*nodes.FieldSource, error) {
	switch r.Source {
	case RefSourceTypeBlockOutput:
		if len(r.BlockID) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, BlockID is empty when source is block output", r)
		}
		if len(r.Name) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Name is empty when source is block output", r)
		}
		parts := strings.Split(r.Name, ".")
		return &nodes.FieldSource{
			Ref: &nodes.Reference{
				FromNodeKey: nodes.NodeKey(r.BlockID),
				FromPath:    parts,
			},
		}, nil
	case RefSourceTypeGlobalApp, RefSourceTypeGlobalSystem, RefSourceTypeGlobalUser:
		if len(r.Path) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Path is empty when source is variables", r)
		}

		var varType variable.Type
		switch r.Source {
		case RefSourceTypeGlobalApp:
			varType = variable.GlobalAPP
		case RefSourceTypeGlobalSystem:
			varType = variable.GlobalSystem
		case RefSourceTypeGlobalUser:
			varType = variable.GlobalUser
		default:
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Source is invalid", r)
		}

		return &nodes.FieldSource{
			Ref: &nodes.Reference{
				VariableType: &varType,
				FromPath:     r.Path,
			},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported ref source type: %s", r.Source)
	}
}

func assistTypeToFileType(a AssistType) (nodes.FileSubType, bool) {
	switch a {
	case AssistTypeNotSet:
		return "", false
	case AssistTypeTime:
		return "", false
	case AssistTypeImage:
		return nodes.FileTypeImage, true
	case AssistTypeAudio:
		return nodes.FileTypeAudio, true
	case AssistTypeVideo:
		return nodes.FileTypeVideo, true
	case AssistTypeDefault:
		return nodes.FileTypeDefault, true
	case AssistTypeDoc:
		return nodes.FileTypeDocument, true
	case AssistTypeExcel:
		return nodes.FileTypeExcel, true
	case AssistTypeCode:
		return nodes.FileTypeCode, true
	case AssistTypePPT:
		return nodes.FileTypePPT, true
	case AssistTypeTXT:
		return nodes.FileTypeTxt, true
	case AssistTypeSvg:
		return nodes.FileTypeSVG, true
	case AssistTypeVoice:
		return nodes.FileTypeVoice, true
	case AssistTypeZip:
		return nodes.FileTypeZip, true
	default:
		panic("impossible")
	}
}

func paramsToLLMParam(params []*Param) (*model.LLMParams, error) {
	p := &model.LLMParams{}
	for _, param := range params {
		switch param.Name {
		case "temperature":
			strVal := param.Input.Value.Content.(string)
			floatVal, err := strconv.ParseFloat(strVal, 64)
			if err != nil {
				return nil, err
			}
			p.Temperature = floatVal
		case "maxTokens":
			strVal := param.Input.Value.Content.(string)
			intVal, err := strconv.Atoi(strVal)
			if err != nil {
				return nil, err
			}
			p.MaxTokens = intVal
		case "responseFormat":
			strVal := param.Input.Value.Content.(string)
			int64Val, err := strconv.ParseInt(strVal, 10, 64)
			if err != nil {
				return nil, err
			}
			p.ResponseFormat = model.ResponseFormat(int64Val)
		case "modleName":
			strVal := param.Input.Value.Content.(string)
			p.ModelName = strVal
		case "modelType":
			strVal := param.Input.Value.Content.(string)
			intVal, err := strconv.Atoi(strVal)
			if err != nil {
				return nil, err
			}
			p.ModelType = intVal
		case "prompt":
			strVal := param.Input.Value.Content.(string)
			p.Prompt = strVal
		case "enableChatHistory":
			boolVar := param.Input.Value.Content.(bool)
			p.EnableChatHistory = boolVar
		case "systemPrompt":
			strVal := param.Input.Value.Content.(string)
			p.SystemPrompt = strVal
		case "chatHistoryRound", "generationDiversity":
			// do nothing
		default:
			return nil, fmt.Errorf("invalid LLMParam name: %s", param.Name)
		}
	}

	return p, nil
}

func (n *Node) setInputsForNodeSchema(ns *schema.NodeSchema) error {
	inputParams := n.Data.Inputs.InputParameters
	if len(inputParams) == 0 {
		return nil
	}

	for _, param := range inputParams {
		name := param.Name
		tInfo, err := param.Input.ToTypeInfo()
		if err != nil {
			return err
		}

		ns.SetInputType(name, tInfo)

		sources, err := param.Input.ToInputSource(compose.FieldPath{name}, n.parentID)
		if err != nil {
			return err
		}

		ns.AddInputSource(sources...)
	}

	return nil
}

func (n *Node) setOutputTypesForNodeSchema(ns *schema.NodeSchema) error {
	for _, v := range n.Data.Outputs {
		tInfo, err := v.ToTypeInfo()
		if err != nil {
			return err
		}
		if v.Name == "errorBody" {
			continue
		}
		ns.SetOutputType(v.Name, tInfo)
	}

	return nil
}
