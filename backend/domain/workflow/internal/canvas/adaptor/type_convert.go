package adaptor

import (
	"fmt"

	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/spf13/cast"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/code"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/model"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
)

func CanvasVariableToTypeInfo(v *vo.Variable) (*vo.TypeInfo, error) {
	tInfo := &vo.TypeInfo{
		Required: v.Required,
	}

	switch v.Type {
	case vo.VariableTypeString:
		switch v.AssistType {
		case vo.AssistTypeTime:
			tInfo.Type = vo.DataTypeTime
		case vo.AssistTypeNotSet:
			tInfo.Type = vo.DataTypeString
		default:
			fileType, ok := assistTypeToFileType(v.AssistType)
			if ok {
				tInfo.Type = vo.DataTypeFile
				tInfo.FileType = &fileType
			} else {
				return nil, fmt.Errorf("unsupported assist type: %v", v.AssistType)
			}
		}
	case vo.VariableTypeInteger:
		tInfo.Type = vo.DataTypeInteger
	case vo.VariableTypeFloat:
		tInfo.Type = vo.DataTypeNumber
	case vo.VariableTypeBoolean:
		tInfo.Type = vo.DataTypeBoolean
	case vo.VariableTypeObject:
		tInfo.Type = vo.DataTypeObject
		tInfo.Properties = make(map[string]*vo.TypeInfo)
		for _, subVAny := range v.Schema.([]any) {
			subV, err := parseVariable(subVAny)
			if err != nil {
				return nil, err
			}
			subTInfo, err := CanvasVariableToTypeInfo(subV)
			if err != nil {
				return nil, err
			}
			tInfo.Properties[subV.Name] = subTInfo
		}
	case vo.VariableTypeList:
		tInfo.Type = vo.DataTypeArray
		subVAny := v.Schema
		subV, err := parseVariable(subVAny)
		if err != nil {
			return nil, err
		}
		subTInfo, err := CanvasVariableToTypeInfo(subV)
		if err != nil {
			return nil, err
		}
		tInfo.ElemTypeInfo = subTInfo

	default:
		return nil, fmt.Errorf("unsupported variable type: %s", v.Type)
	}

	return tInfo, nil
}

func CanvasBlockInputToTypeInfo(b *vo.BlockInput) (*vo.TypeInfo, error) {
	tInfo := &vo.TypeInfo{}

	if b == nil {
		return tInfo, nil
	}

	switch b.Type {
	case vo.VariableTypeString:
		switch b.AssistType {
		case vo.AssistTypeTime:
			tInfo.Type = vo.DataTypeTime
		case vo.AssistTypeNotSet:
			tInfo.Type = vo.DataTypeString
		default:
			fileType, ok := assistTypeToFileType(b.AssistType)
			if ok {
				tInfo.Type = vo.DataTypeFile
				tInfo.FileType = &fileType
			} else {
				return nil, fmt.Errorf("unsupported assist type: %v", b.AssistType)
			}
		}
	case vo.VariableTypeInteger:
		tInfo.Type = vo.DataTypeInteger
	case vo.VariableTypeFloat:
		tInfo.Type = vo.DataTypeNumber
	case vo.VariableTypeBoolean:
		tInfo.Type = vo.DataTypeBoolean
	case vo.VariableTypeObject:
		tInfo.Type = vo.DataTypeObject
		tInfo.Properties = make(map[string]*vo.TypeInfo)
		for _, subVAny := range b.Schema.([]any) {
			if b.Value.Type == vo.BlockInputValueTypeRef {
				subV, err := parseVariable(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := CanvasVariableToTypeInfo(subV)
				if err != nil {
					return nil, err
				}
				tInfo.Properties[subV.Name] = subTInfo
			} else if b.Value.Type == vo.BlockInputValueTypeObjectRef {
				subV, err := parseParam(subVAny)
				if err != nil {
					return nil, err
				}
				subTInfo, err := CanvasBlockInputToTypeInfo(subV.Input)
				if err != nil {
					return nil, err
				}
				tInfo.Properties[subV.Name] = subTInfo
			}
		}
	case vo.VariableTypeList:
		tInfo.Type = vo.DataTypeArray
		subVAny := b.Schema
		subV, err := parseVariable(subVAny)
		if err != nil {
			return nil, err
		}
		subTInfo, err := CanvasVariableToTypeInfo(subV)
		if err != nil {
			return nil, err
		}
		tInfo.ElemTypeInfo = subTInfo
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", b.Type)
	}

	return tInfo, nil
}

func CanvasBlockInputToFieldInfo(b *vo.BlockInput, path einoCompose.FieldPath, parentNode *vo.Node) (sources []*vo.FieldInfo, err error) {
	value := b.Value
	if value == nil {
		return nil, fmt.Errorf("input %v has no value, type= %s", path, b.Type)
	}

	switch value.Type {
	case vo.BlockInputValueTypeObjectRef:
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
			subFieldInfo, err := CanvasBlockInputToFieldInfo(param.Input, append(copied, param.Name), parentNode)
			if err != nil {
				return nil, err
			}
			sources = append(sources, subFieldInfo...)
		}
		return sources, nil
	case vo.BlockInputValueTypeLiteral:
		content := value.Content
		if content == nil {
			return nil, fmt.Errorf("input %v is literal but has no value, type= %s", path, b.Type)
		}

		switch b.Type {
		case vo.VariableTypeObject:
			m := make(map[string]any)
			if err = sonic.UnmarshalString(content.(string), &m); err != nil {
				return nil, err
			}
			content = m
		case vo.VariableTypeList:
			l := make([]any, 0)
			if err = sonic.UnmarshalString(content.(string), &l); err != nil {
				return nil, err
			}
			content = l
		}
		return []*vo.FieldInfo{
			{
				Path: path,
				Source: vo.FieldSource{
					Val: content,
				},
			},
		}, nil
	case vo.BlockInputValueTypeRef:
		content := value.Content
		if content == nil {
			return nil, fmt.Errorf("input %v is literal but has no value, type= %s", path, b.Type)
		}

		ref, err := parseBlockInputRef(content)
		if err != nil {
			return nil, err
		}

		fieldSource, err := CanvasBlockInputRefToFieldSource(ref)
		if err != nil {
			return nil, err
		}

		if parentNode != nil {
			if fieldSource.Ref != nil && len(fieldSource.Ref.FromNodeKey) > 0 && fieldSource.Ref.FromNodeKey == vo.NodeKey(parentNode.ID) {
				varRoot := fieldSource.Ref.FromPath[0]
				for _, p := range parentNode.Data.Inputs.VariableParameters {
					if p.Name == varRoot {
						fieldSource.Ref.FromNodeKey = ""
						pi := variable.ParentIntermediate
						fieldSource.Ref.VariableType = &pi
					}
				}
			}
		}

		return []*vo.FieldInfo{
			{
				Path:   path,
				Source: *fieldSource,
			},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported value type: %s for blockInput type= %s", value.Type, b.Type)
	}
}

func parseBlockInputRef(content any) (*vo.BlockInputReference, error) {
	m, ok := content.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse BlockInputRef", content)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &vo.BlockInputReference{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func parseParam(v any) (*vo.Param, error) {
	m, ok := v.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse Param", v)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &vo.Param{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func parseVariable(v any) (*vo.Variable, error) {
	m, ok := v.(map[string]any)
	if !ok {
		return nil, fmt.Errorf("invalid content type: %T when parse Variable", v)
	}

	marshaled, err := sonic.Marshal(m)
	if err != nil {
		return nil, err
	}

	p := &vo.Variable{}
	if err := sonic.Unmarshal(marshaled, p); err != nil {
		return nil, err
	}

	return p, nil
}

func CanvasBlockInputRefToFieldSource(r *vo.BlockInputReference) (*vo.FieldSource, error) {
	switch r.Source {
	case vo.RefSourceTypeBlockOutput:
		if len(r.BlockID) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, BlockID is empty when source is block output", r)
		}
		if len(r.Name) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Name is empty when source is block output", r)
		}
		parts := strings.Split(r.Name, ".")
		return &vo.FieldSource{
			Ref: &vo.Reference{
				FromNodeKey: vo.NodeKey(r.BlockID),
				FromPath:    parts,
			},
		}, nil
	case vo.RefSourceTypeGlobalApp, vo.RefSourceTypeGlobalSystem, vo.RefSourceTypeGlobalUser:
		if len(r.Path) == 0 {
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Path is empty when source is variables", r)
		}

		var varType variable.Type
		switch r.Source {
		case vo.RefSourceTypeGlobalApp:
			varType = variable.GlobalAPP
		case vo.RefSourceTypeGlobalSystem:
			varType = variable.GlobalSystem
		case vo.RefSourceTypeGlobalUser:
			varType = variable.GlobalUser
		default:
			return nil, fmt.Errorf("invalid BlockInputReference = %+v, Source is invalid", r)
		}

		return &vo.FieldSource{
			Ref: &vo.Reference{
				VariableType: &varType,
				FromPath:     r.Path,
			},
		}, nil
	default:
		return nil, fmt.Errorf("unsupported ref source type: %s", r.Source)
	}
}

func assistTypeToFileType(a vo.AssistType) (vo.FileSubType, bool) {
	switch a {
	case vo.AssistTypeNotSet:
		return "", false
	case vo.AssistTypeTime:
		return "", false
	case vo.AssistTypeImage:
		return vo.FileTypeImage, true
	case vo.AssistTypeAudio:
		return vo.FileTypeAudio, true
	case vo.AssistTypeVideo:
		return vo.FileTypeVideo, true
	case vo.AssistTypeDefault:
		return vo.FileTypeDefault, true
	case vo.AssistTypeDoc:
		return vo.FileTypeDocument, true
	case vo.AssistTypeExcel:
		return vo.FileTypeExcel, true
	case vo.AssistTypeCode:
		return vo.FileTypeCode, true
	case vo.AssistTypePPT:
		return vo.FileTypePPT, true
	case vo.AssistTypeTXT:
		return vo.FileTypeTxt, true
	case vo.AssistTypeSvg:
		return vo.FileTypeSVG, true
	case vo.AssistTypeVoice:
		return vo.FileTypeVoice, true
	case vo.AssistTypeZip:
		return vo.FileTypeZip, true
	default:
		panic("impossible")
	}
}

func LLMParamsToLLMParam(params vo.LLMParam) (*model.LLMParams, error) {
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

func IntentDetectorParamsToLLMParam(params vo.IntentDetectorLLMParam) (*model.LLMParams, error) {

	var (
		err error
		p   = &model.LLMParams{}
	)
	for key, value := range params {
		if value == nil {
			continue
		}
		switch key {
		case "temperature":
			p.Temperature, err = cast.ToFloat64E(value)
			if err != nil {
				return nil, err
			}
		case "topP":
			p.TopP, err = cast.ToFloat64E(value)
			if err != nil {
				return nil, err
			}
		case "maxTokens":
			p.MaxTokens, err = cast.ToIntE(value)
			if err != nil {
				return nil, err
			}
		case "responseFormat":
			int64Val, err := cast.ToInt64E(value)
			if err != nil {
				return nil, err
			}
			p.ResponseFormat = model.ResponseFormat(int64Val)
		case "modelName":
			p.ModelName = value.(string)
		case "modelType":
			p.ModelType, err = cast.ToIntE(value)
			if err != nil {
				return nil, err
			}
		case "systemPrompt":
			input := &vo.BlockInput{}
			bs, _ := sonic.Marshal(value)
			err = sonic.Unmarshal(bs, input)
			if err != nil {
				return nil, err
			}
			if input.Value != nil {
				p.SystemPrompt = input.Value.Content.(string)
			}
		case "prompt", "generationDiversity", "enableChatHistory", "chatHistoryRound":
			// pass
		default:
			return nil, fmt.Errorf("invalid LLMParam name: %s", key)
		}
	}

	return p, nil

}

func SetInputsForNodeSchema(n *vo.Node, ns *compose.NodeSchema) error {
	inputParams := n.Data.Inputs.InputParameters
	if len(inputParams) == 0 {
		return nil
	}

	for _, param := range inputParams {
		name := param.Name
		tInfo, err := CanvasBlockInputToTypeInfo(param.Input)
		if err != nil {
			return err
		}

		ns.SetInputType(name, tInfo)

		sources, err := CanvasBlockInputToFieldInfo(param.Input, einoCompose.FieldPath{name}, n.Parent())
		if err != nil {
			return err
		}

		ns.AddInputSource(sources...)
	}

	return nil
}

func SetDatabaseInputsForNodeSchema(n *vo.Node, ns *compose.NodeSchema) (err error) {

	selectParam := n.Data.Inputs.SelectParam
	if selectParam != nil {
		err = applyDBConditionToSchema(ns, selectParam.Condition, n.Parent())
		if err != nil {
			return err
		}
	}

	insertParam := n.Data.Inputs.InsertParam
	if insertParam != nil {
		err = applyInsetFieldInfoToSchema(ns, insertParam.FieldInfo, n.Parent())
		if err != nil {
			return err
		}
	}

	deleteParam := n.Data.Inputs.DeleteParam
	if deleteParam != nil {
		err = applyDBConditionToSchema(ns, &deleteParam.Condition, n.Parent())
		if err != nil {
			return err
		}
	}

	updateParam := n.Data.Inputs.UpdateParam
	if updateParam != nil {
		err = applyDBConditionToSchema(ns, &updateParam.Condition, n.Parent())
		if err != nil {
			return err
		}
		err = applyInsetFieldInfoToSchema(ns, updateParam.FieldInfo, n.Parent())
		if err != nil {
			return err
		}
	}
	return nil
}
func SetHttpRequesterInputsForNodeSchema(n *vo.Node, ns *compose.NodeSchema) (err error) {
	inputs := n.Data.Inputs

	err = applyParamsToSchema(ns, "Headers", inputs.Headers, n.Parent())
	if err != nil {
		return err
	}

	err = applyParamsToSchema(ns, "Params", inputs.Params, n.Parent())
	if err != nil {
		return err
	}

	if inputs.Auth != nil && inputs.Auth.AuthOpen {
		authTypeInfo := &vo.TypeInfo{
			Type:       vo.DataTypeObject,
			Properties: make(map[string]*vo.TypeInfo),
		}
		authFieldsName := "Authentication"
		ns.SetInputType(authFieldsName, authTypeInfo)
		authData := inputs.Auth.AuthData
		if inputs.Auth.AuthType == "BEARER_AUTH" {
			bearTokenParam := authData.BearerTokenData[0]
			authTypeInfo.Properties["Token"] = &vo.TypeInfo{
				Type: vo.DataTypeString,
			}
			sources, err := CanvasBlockInputToFieldInfo(bearTokenParam.Input, einoCompose.FieldPath{authFieldsName, "Token"}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)
		}
		if inputs.Auth.AuthType == "CUSTOM_AUTH" {
			dataParams := authData.CustomData.Data
			keyParam := dataParams[0]
			valueParam := dataParams[1]
			authTypeInfo.Properties["Key"] = &vo.TypeInfo{
				Type: vo.DataTypeString,
			}
			authTypeInfo.Properties["Value"] = &vo.TypeInfo{
				Type: vo.DataTypeString,
			}
			sources, err := CanvasBlockInputToFieldInfo(keyParam.Input, einoCompose.FieldPath{authFieldsName, "Key"}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)
			sources, err = CanvasBlockInputToFieldInfo(valueParam.Input, einoCompose.FieldPath{authFieldsName, "Value"}, n.Parent())
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

		}

	}

	switch httprequester.BodyType(inputs.Body.BodyType) {
	case httprequester.BodyTypeFormData:
		formDataParams := inputs.Body.BodyData.FormData.Data
		err = applyParamsToSchema(ns, "FormDataVars", formDataParams, n.Parent())
		if err != nil {
			return err
		}

	case httprequester.BodyTypeFormURLEncoded:
		formURLEncodedParams := inputs.Body.BodyData.FormURLEncoded
		err = applyParamsToSchema(ns, "FormURLEncodedVars", formURLEncodedParams, n.Parent())
		if err != nil {
			return err
		}

	case httprequester.BodyTypeBinary:
		fileURLName := "FileURL"
		fileURLInput := inputs.Body.BodyData.Binary.FileURL
		ns.SetInputType(fileURLName, &vo.TypeInfo{
			Type: vo.DataTypeString,
		})
		sources, err := CanvasBlockInputToFieldInfo(fileURLInput, einoCompose.FieldPath{fileURLName}, n.Parent())
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}

	return nil
}

func applyDBConditionToSchema(ns *compose.NodeSchema, condition *vo.DBCondition, parentNode *vo.Node) error {
	if condition.ConditionList == nil {
		return nil
	}
	if len(condition.ConditionList) > 0 {
		if len(condition.ConditionList) == 1 {
			params := condition.ConditionList[0]
			var right *vo.Param
			for _, param := range params {
				if param.Name == "right" {
					right = param
					break
				}
			}
			if right == nil {
				return fmt.Errorf("db conditon not found right param")
			}
			name := "SingleRight"
			tInfo, err := CanvasBlockInputToTypeInfo(right.Input)
			if err != nil {
				return err
			}
			ns.SetInputType(name, tInfo)

			sources, err := CanvasBlockInputToFieldInfo(right.Input, einoCompose.FieldPath{name}, parentNode)
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

		} else {
			for idx, params := range condition.ConditionList {
				var right *vo.Param
				for _, param := range params {
					if param.Name == "right" {
						right = param
						break
					}
				}
				if right == nil {
					return fmt.Errorf("db conditon not found right param")
				}
				name := fmt.Sprintf("Multi_%d_Right", idx)
				tInfo, err := CanvasBlockInputToTypeInfo(right.Input)
				if err != nil {
					return err
				}
				ns.SetInputType(name, tInfo)

				sources, err := CanvasBlockInputToFieldInfo(right.Input, einoCompose.FieldPath{name}, parentNode)
				if err != nil {
					return err
				}
				ns.AddInputSource(sources...)
			}

		}

	}
	return nil

}

func applyInsetFieldInfoToSchema(ns *compose.NodeSchema, fieldInfo [][]*vo.Param, parentNode *vo.Node) error {
	if len(fieldInfo) == 0 {
		return nil
	}
	fieldsName := "Fields"
	FieldsTypeInfo := &vo.TypeInfo{
		Type:       vo.DataTypeObject,
		Properties: make(map[string]*vo.TypeInfo, len(fieldInfo)),
	}
	ns.SetInputType(fieldsName, FieldsTypeInfo)
	for _, params := range fieldInfo {
		// Each FieldInfo is list params, containing two elements.
		// The first is to set the name of the field and the second is the corresponding value.
		p0 := params[0]
		p1 := params[1]

		name := p0.Input.Value.Content.(string) // must string type
		tInfo, err := CanvasBlockInputToTypeInfo(p1.Input)
		if err != nil {
			return err
		}

		FieldsTypeInfo.Properties[name] = tInfo
		sources, err := CanvasBlockInputToFieldInfo(p1.Input, einoCompose.FieldPath{fieldsName, name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}
	return nil

}

func applyParamsToSchema(ns *compose.NodeSchema, fieldName string, params []*vo.Param, parentNode *vo.Node) error {

	typeInfo := &vo.TypeInfo{
		Type:       vo.DataTypeObject,
		Properties: make(map[string]*vo.TypeInfo, len(params)),
	}
	ns.SetInputType(fieldName, typeInfo)
	for i := range params {
		param := params[i]
		name := param.Name
		tInfo, err := CanvasBlockInputToTypeInfo(param.Input)
		if err != nil {
			return err
		}
		typeInfo.Properties[name] = tInfo
		sources, err := CanvasBlockInputToFieldInfo(param.Input, einoCompose.FieldPath{fieldName, name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)

	}
	return nil
}

func SetOutputTypesForNodeSchema(n *vo.Node, ns *compose.NodeSchema) error {
	for _, vAny := range n.Data.Outputs {
		v, err := parseVariable(vAny)
		if err != nil {
			return err
		}

		tInfo, err := CanvasVariableToTypeInfo(v)
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

func SetOutputsForNodeSchema(n *vo.Node, ns *compose.NodeSchema) error {
	for _, vAny := range n.Data.Outputs {
		param, err := parseParam(vAny)
		if err != nil {
			return err
		}
		name := param.Name
		tInfo, err := CanvasBlockInputToTypeInfo(param.Input)
		if err != nil {
			return err
		}

		ns.SetOutputType(name, tInfo)

		sources, err := CanvasBlockInputToFieldInfo(param.Input, einoCompose.FieldPath{name}, n.Parent())
		if err != nil {
			return err
		}

		ns.AddOutputSource(sources...)
	}

	return nil
}

func ToSelectorOperator(o vo.OperatorType) (selector.Operator, error) {
	switch o {
	case vo.Equal:
		return selector.OperatorEqual, nil
	case vo.NotEqual:
		return selector.OperatorNotEqual, nil
	case vo.LengthGreaterThan:
		return selector.OperatorLengthGreater, nil
	case vo.LengthGreaterThanEqual:
		return selector.OperatorLengthGreaterOrEqual, nil
	case vo.LengthLessThan:
		return selector.OperatorLengthLesser, nil
	case vo.LengthLessThanEqual:
		return selector.OperatorLengthLesserOrEqual, nil
	case vo.Contain:
		return selector.OperatorContain, nil
	case vo.NotContain:
		return selector.OperatorNotContain, nil
	case vo.Empty:
		return selector.OperatorEmpty, nil
	case vo.NotEmpty:
		return selector.OperatorNotEmpty, nil
	case vo.True:
		return selector.OperatorIsTrue, nil
	case vo.False:
		return selector.OperatorIsFalse, nil
	case vo.GreaterThan:
		return selector.OperatorGreater, nil
	case vo.GreaterThanEqual:
		return selector.OperatorGreaterOrEqual, nil
	case vo.LessThan:
		return selector.OperatorLesser, nil
	case vo.LessThanEqual:
		return selector.OperatorLesserOrEqual, nil
	default:
		return "", fmt.Errorf("unsupported operator type: %d", o)
	}
}

func ToLoopType(l vo.LoopType) (loop.Type, error) {
	switch l {
	case vo.LoopTypeArray:
		return loop.ByArray, nil
	case vo.LoopTypeCount:
		return loop.ByIteration, nil
	case vo.LoopTypeInfinite:
		return loop.Infinite, nil
	default:
		return "", fmt.Errorf("unsupported loop type: %s", l)
	}
}

func ConvertLogicTypeToRelation(logicType vo.DatabaseLogicType) (database.ClauseRelation, error) {
	switch logicType {
	case vo.DatabaseLogicAnd:
		return database.ClauseRelationAND, nil
	case vo.DatabaseLogicOr:
		return database.ClauseRelationOR, nil
	default:
		return "", fmt.Errorf("logic type %v is invalid", logicType)

	}
}

func OperationToOperator(s string) (database.Operator, error) {
	switch s {
	case "EQUAL":
		return database.OperatorEqual, nil
	case "NOT_EQUAL":
		return database.OperatorNotEqual, nil
	case "GREATER_THAN":
		return database.OperatorGreater, nil
	case "LESS_THAN":
		return database.OperatorLesser, nil
	case "GREATER_EQUAL":
		return database.OperatorGreaterOrEqual, nil
	case "LESS_EQUAL":
		return database.OperatorLesserOrEqual, nil
	case "IN":
		return database.OperatorIn, nil
	case "NOT_IN":
		return database.OperatorNotIn, nil
	case "IS_NULL":
		return database.OperatorIsNull, nil
	case "IS_NOT_NULL":
		return database.OperatorIsNotNull, nil
	case "LIKE":
		return database.OperatorLike, nil
	case "NOT_LIKE":
		return database.OperatorNotLike, nil
	}
	return "", fmt.Errorf("not a valid Operation string")
}

func ConvertAuthType(auth string) (httprequester.AuthType, error) {
	switch auth {
	case "CUSTOM_AUTH":
		return httprequester.Custom, nil
	case "BEARER_AUTH":
		return httprequester.BearToken, nil
	default:
		return httprequester.BearToken, fmt.Errorf("invalid auth type")
	}
}

func ConvertLocation(l string) (httprequester.Location, error) {
	switch l {
	case "header":
		return httprequester.Header, nil
	case "query":
		return httprequester.QueryParam, nil
	default:
		return 0, fmt.Errorf("invalid location")

	}

}

func ConvertParsingType(p string) (knowledge.ParseMode, error) {
	switch p {
	case "fast":
		return knowledge.FastParseMode, nil
	case "accurate":
		return knowledge.AccurateParseMode, nil
	default:
		return "", fmt.Errorf("invalid parsingType: %s", p)
	}
}

func ConvertChunkType(p string) (knowledge.ChunkType, error) {
	switch p {
	case "custom":
		return knowledge.ChunkTypeCustom, nil
	case "default":
		return knowledge.ChunkTypeDefault, nil
	default:
		return "", fmt.Errorf("invalid ChunkType: %s", p)
	}
}
func ConvertRetrievalSearchType(s int64) (knowledge.SearchType, error) {
	switch s {
	case 0:
		return knowledge.SearchTypeSemantic, nil
	case 1:
		return knowledge.SearchTypeHybrid, nil
	case 20:
		return knowledge.SearchTypeFullText, nil
	default:
		return "", fmt.Errorf("invalid RetrievalSearchType %v", s)
	}
}

func ConvertCodeLanguage(l int64) (code.Language, error) {
	switch l {
	case 5:
		return code.JavaScript, nil
	case 3:
		return code.Python, nil
	default:
		return "", fmt.Errorf("invalid language: %d", l)

	}
}
