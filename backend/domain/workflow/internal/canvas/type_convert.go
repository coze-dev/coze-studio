package canvas

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
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/compose"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/loop"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
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
		tInfo.ElemTypeInfo = subTInfo

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
		tInfo.ElemTypeInfo = subTInfo
	default:
		return nil, fmt.Errorf("unsupported variable type: %s", b.Type)
	}

	return tInfo, nil
}

func (b *BlockInput) ToFieldInfo(path einoCompose.FieldPath, parentNode *Node) (sources []*nodes.FieldInfo, err error) {
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
			subFieldInfo, err := param.Input.ToFieldInfo(append(copied, param.Name), parentNode)
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

		if parentNode != nil {
			if fieldSource.Ref != nil && len(fieldSource.Ref.FromNodeKey) > 0 && fieldSource.Ref.FromNodeKey == nodes.NodeKey(parentNode.ID) {
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

func LLMParamsToLLMParam(params LLMParam) (*model.LLMParams, error) {
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

func IntentDetectorParamsToLLMParam(params IntentDetectorLLMParam) (*model.LLMParams, error) {

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
			input := &BlockInput{}
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

func (n *Node) SetInputsForNodeSchema(ns *compose.NodeSchema) error {
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

		sources, err := param.Input.ToFieldInfo(einoCompose.FieldPath{name}, n.parent)
		if err != nil {
			return err
		}

		ns.AddInputSource(sources...)
	}

	return nil
}

func (n *Node) SetDatabaseInputsForNodeSchema(ns *compose.NodeSchema) (err error) {

	selectParam := n.Data.Inputs.SelectParam
	if selectParam != nil {
		err = applyDBConditionToSchema(ns, selectParam.Condition, n.parent)
		if err != nil {
			return err
		}
	}

	insertParam := n.Data.Inputs.InsertParam
	if insertParam != nil {
		err = applyInsetFieldInfoToSchema(ns, insertParam.FieldInfo, n.parent)
		if err != nil {
			return err
		}
	}

	deleteParam := n.Data.Inputs.DeleteParam
	if deleteParam != nil {
		err = applyDBConditionToSchema(ns, &deleteParam.Condition, n.parent)
		if err != nil {
			return err
		}
	}

	updateParam := n.Data.Inputs.UpdateParam
	if updateParam != nil {
		err = applyDBConditionToSchema(ns, &updateParam.Condition, n.parent)
		if err != nil {
			return err
		}
		err = applyInsetFieldInfoToSchema(ns, updateParam.FieldInfo, n.parent)
		if err != nil {
			return err
		}
	}
	return nil
}
func (n *Node) SetHttpRequesterInputsForNodeSchema(ns *compose.NodeSchema) (err error) {
	inputs := n.Data.Inputs

	err = applyParamsToSchema(ns, "Headers", inputs.Headers, n.parent)
	if err != nil {
		return err
	}

	err = applyParamsToSchema(ns, "Params", inputs.Params, n.parent)
	if err != nil {
		return err
	}

	if inputs.Auth != nil && inputs.Auth.AuthOpen {
		authTypeInfo := &nodes.TypeInfo{
			Type:       nodes.DataTypeObject,
			Properties: make(map[string]*nodes.TypeInfo),
		}
		authFieldsName := "Authentication"
		ns.SetInputType(authFieldsName, authTypeInfo)
		authData := inputs.Auth.AuthData
		if inputs.Auth.AuthType == "BEARER_AUTH" {
			bearTokenParam := authData.BearerTokenData[0]
			authTypeInfo.Properties["Token"] = &nodes.TypeInfo{
				Type: nodes.DataTypeString,
			}
			sources, err := bearTokenParam.Input.ToFieldInfo(einoCompose.FieldPath{authFieldsName, "Token"}, n.parent)
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)
		}
		if inputs.Auth.AuthType == "CUSTOM_AUTH" {
			dataParams := authData.CustomData.Data
			keyParam := dataParams[0]
			valueParam := dataParams[1]
			authTypeInfo.Properties["Key"] = &nodes.TypeInfo{
				Type: nodes.DataTypeString,
			}
			authTypeInfo.Properties["Value"] = &nodes.TypeInfo{
				Type: nodes.DataTypeString,
			}
			sources, err := keyParam.Input.ToFieldInfo(einoCompose.FieldPath{authFieldsName, "Key"}, n.parent)
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)
			sources, err = valueParam.Input.ToFieldInfo(einoCompose.FieldPath{authFieldsName, "Value"}, n.parent)
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

		}

	}

	switch httprequester.BodyType(inputs.Body.BodyType) {
	case httprequester.BodyTypeFormData:
		formDataParams := inputs.Body.BodyData.FormData.Data
		err = applyParamsToSchema(ns, "FormDataVars", formDataParams, n.parent)
		if err != nil {
			return err
		}

	case httprequester.BodyTypeFormURLEncoded:
		formURLEncodedParams := inputs.Body.BodyData.FormURLEncoded
		err = applyParamsToSchema(ns, "FormURLEncodedVars", formURLEncodedParams, n.parent)
		if err != nil {
			return err
		}

	case httprequester.BodyTypeBinary:
		fileURLName := "FileURL"
		fileURLInput := inputs.Body.BodyData.Binary.FileURL
		ns.SetInputType(fileURLName, &nodes.TypeInfo{
			Type: nodes.DataTypeString,
		})
		sources, err := fileURLInput.ToFieldInfo(einoCompose.FieldPath{fileURLName}, n.parent)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}

	return nil
}

func applyDBConditionToSchema(ns *compose.NodeSchema, condition *DBCondition, parentNode *Node) error {
	if condition.ConditionList == nil {
		return nil
	}
	if len(condition.ConditionList) > 0 {
		if len(condition.ConditionList) == 1 {
			params := condition.ConditionList[0]
			var right *Param
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
			tInfo, err := right.Input.ToTypeInfo()
			if err != nil {
				return err
			}
			ns.SetInputType(name, tInfo)

			sources, err := right.Input.ToFieldInfo(einoCompose.FieldPath{name}, parentNode)
			if err != nil {
				return err
			}
			ns.AddInputSource(sources...)

		} else {
			for idx, params := range condition.ConditionList {
				var right *Param
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
				tInfo, err := right.Input.ToTypeInfo()
				if err != nil {
					return err
				}
				ns.SetInputType(name, tInfo)

				sources, err := right.Input.ToFieldInfo(einoCompose.FieldPath{name}, parentNode)
				if err != nil {
					return err
				}
				ns.AddInputSource(sources...)
			}

		}

	}
	return nil

}

func applyInsetFieldInfoToSchema(ns *compose.NodeSchema, fieldInfo [][]*Param, parentNode *Node) error {
	if len(fieldInfo) == 0 {
		return nil
	}
	fieldsName := "Fields"
	FieldsTypeInfo := &nodes.TypeInfo{
		Type:       nodes.DataTypeObject,
		Properties: make(map[string]*nodes.TypeInfo, len(fieldInfo)),
	}
	ns.SetInputType(fieldsName, FieldsTypeInfo)
	for _, params := range fieldInfo {
		// Each FieldInfo is list params, containing two elements.
		// The first is to set the name of the field and the second is the corresponding value.
		p0 := params[0]
		p1 := params[1]

		name := p0.Input.Value.Content.(string) // must string type
		tInfo, err := p1.Input.ToTypeInfo()
		if err != nil {
			return err
		}

		FieldsTypeInfo.Properties[name] = tInfo
		sources, err := p1.Input.ToFieldInfo(einoCompose.FieldPath{fieldsName, name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}
	return nil

}

func applyParamsToSchema(ns *compose.NodeSchema, fieldName string, params []*Param, parentNode *Node) error {

	typeInfo := &nodes.TypeInfo{
		Type:       nodes.DataTypeObject,
		Properties: make(map[string]*nodes.TypeInfo, len(params)),
	}
	ns.SetInputType(fieldName, typeInfo)
	for i := range params {
		param := params[i]
		name := param.Name
		tInfo, err := param.Input.ToTypeInfo()
		if err != nil {
			return err
		}
		typeInfo.Properties[name] = tInfo
		sources, err := param.Input.ToFieldInfo(einoCompose.FieldPath{fieldName, name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)

	}
	return nil
}

func (n *Node) SetOutputTypesForNodeSchema(ns *compose.NodeSchema) error {
	for _, vAny := range n.Data.Outputs {
		v, err := parseVariable(vAny)
		if err != nil {
			return err
		}

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

func (n *Node) SetOutputsForNodeSchema(ns *compose.NodeSchema) error {
	for _, vAny := range n.Data.Outputs {
		param, err := parseParam(vAny)
		if err != nil {
			return err
		}
		name := param.Name
		tInfo, err := param.Input.ToTypeInfo()
		if err != nil {
			return err
		}

		ns.SetOutputType(name, tInfo)

		sources, err := param.Input.ToFieldInfo(einoCompose.FieldPath{name}, n.parent)
		if err != nil {
			return err
		}

		ns.AddOutputSource(sources...)
	}

	return nil
}

func (o OperatorType) ToSelectorOperator() (selector.Operator, error) {
	switch o {
	case Equal:
		return selector.OperatorEqual, nil
	case NotEqual:
		return selector.OperatorNotEqual, nil
	case LengthGreaterThan:
		return selector.OperatorLengthGreater, nil
	case LengthGreaterThanEqual:
		return selector.OperatorLengthGreaterOrEqual, nil
	case LengthLessThan:
		return selector.OperatorLengthLesser, nil
	case LengthLessThanEqual:
		return selector.OperatorLengthLesserOrEqual, nil
	case Contain:
		return selector.OperatorContain, nil
	case NotContain:
		return selector.OperatorNotContain, nil
	case Empty:
		return selector.OperatorEmpty, nil
	case NotEmpty:
		return selector.OperatorNotEmpty, nil
	case True:
		return selector.OperatorIsTrue, nil
	case False:
		return selector.OperatorIsFalse, nil
	case GreaterThan:
		return selector.OperatorGreater, nil
	case GreaterThanEqual:
		return selector.OperatorGreaterOrEqual, nil
	case LessThan:
		return selector.OperatorLesser, nil
	case LessThanEqual:
		return selector.OperatorLesserOrEqual, nil
	default:
		return "", fmt.Errorf("unsupported operator type: %d", o)
	}
}

func (l LoopType) ToLoopType() (loop.Type, error) {
	switch l {
	case LoopTypeArray:
		return loop.ByArray, nil
	case LoopTypeCount:
		return loop.ByIteration, nil
	case LoopTypeInfinite:
		return loop.Infinite, nil
	default:
		return "", fmt.Errorf("unsupported loop type: %s", l)
	}
}

func ConvertLogicTypeToRelation(logicType DatabaseLogicType) (database.ClauseRelation, error) {
	switch logicType {
	case DatabaseLogicAnd:
		return database.ClauseRelationAND, nil
	case DatabaseLogicOr:
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
