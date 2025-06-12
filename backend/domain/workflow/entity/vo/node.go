package vo

import (
	"fmt"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
)

type NodeKey string

type FieldInfo struct {
	Path   compose.FieldPath `json:"path"`
	Source FieldSource       `json:"source"`
}

type Reference struct {
	FromNodeKey NodeKey           `json:"from_node_key,omitempty"`
	FromPath    compose.FieldPath `json:"from_path"`

	VariableType *variable.Type `json:"variable_type,omitempty"`
}

type FieldSource struct {
	Ref *Reference `json:"ref,omitempty"`
	Val any        `json:"val,omitempty"`
}

type TypeInfo struct {
	Type         DataType             `json:"type"`
	ElemTypeInfo *TypeInfo            `json:"elem_type_info,omitempty"`
	FileType     *FileSubType         `json:"file_type,omitempty"`
	Required     bool                 `json:"required,omitempty"`
	Desc         string               `json:"desc,omitempty"`
	Properties   map[string]*TypeInfo `json:"properties,omitempty"`
}
type NamedTypeInfo struct {
	Name         string           `json:"name"`
	Type         DataType         `json:"type"`
	ElemTypeInfo *NamedTypeInfo   `json:"elem_type_info,omitempty"`
	FileType     *FileSubType     `json:"file_type,omitempty"`
	Required     bool             `json:"required,omitempty"`
	Desc         string           `json:"desc,omitempty"`
	Properties   []*NamedTypeInfo `json:"properties,omitempty"`
}

type DataType string

const (
	DataTypeString  DataType = "string"  // string
	DataTypeInteger DataType = "integer" // int64
	DataTypeNumber  DataType = "number"  // float64
	DataTypeBoolean DataType = "boolean" // bool
	DataTypeTime    DataType = "time"    // time.Time
	DataTypeObject  DataType = "object"  // map[string]any
	DataTypeArray   DataType = "list"    // []any
	DataTypeFile    DataType = "file"    // string (url)
)

func toInt64(v any) (any, bool) {
	switch val := v.(type) {
	case int64:
		return val, true
	case float64:
		return int64(val), true
	default:
		return nil, false
	}
}

// Zero creates a zero value
func (t *TypeInfo) Zero() any {
	switch t.Type {
	case DataTypeString:
		return ""
	case DataTypeInteger:
		return int64(0)
	case DataTypeNumber:
		return float64(0)
	case DataTypeBoolean:
		return false
	case DataTypeTime:
		return time.Time{}
	case DataTypeObject:
		var m map[string]any
		return m
	case DataTypeArray:
		var a []any
		return a
	case DataTypeFile:
		return ""
	default:
		panic("impossible")
	}
}

func (n *NamedTypeInfo) ToParameterInfo() (*schema.ParameterInfo, error) {
	param := &schema.ParameterInfo{
		Type:     convertDataType(n.Type),
		Desc:     n.Desc,
		Required: n.Required,
	}

	if n.Type == DataTypeObject {
		param.SubParams = make(map[string]*schema.ParameterInfo, len(n.Properties))
		for _, subT := range n.Properties {
			subParam, err := subT.ToParameterInfo()
			if err != nil {
				return nil, err
			}
			param.SubParams[subT.Name] = subParam
		}
	} else if n.Type == DataTypeArray {
		elemParam, err := n.ElemTypeInfo.ToParameterInfo()
		if err != nil {
			return nil, err
		}
		param.ElemInfo = elemParam
	}

	return param, nil
}

func (n *NamedTypeInfo) ToVariable() (*Variable, error) {

	variableType, err := convertVariableType(n.Type)
	if err != nil {
		return nil, err
	}

	v := &Variable{
		Name:     n.Name,
		Type:     variableType,
		Required: n.Required,
	}

	if n.Type == DataTypeFile && n.FileType != nil {
		v.AssistType = toAssistType(*n.FileType)
	}

	if n.Type == DataTypeArray && n.ElemTypeInfo != nil {
		ele, err := n.ElemTypeInfo.ToVariable()
		if err != nil {
			return nil, err
		}
		v.Schema = ele
	}

	if n.Type == DataTypeObject && len(n.Properties) > 0 {
		varList := make([]*Variable, 0, len(n.Properties))
		for _, p := range n.Properties {
			v, err := p.ToVariable()
			if err != nil {
				return nil, err
			}
			varList = append(varList, v)
		}
		v.Schema = varList
	}

	return v, nil
}

func toAssistType(f FileSubType) AssistType {
	switch f {
	case FileTypeDefault:
		return AssistTypeDefault
	case FileTypeImage:
		return AssistTypeImage
	case FileTypeSVG:
		return AssistTypeSvg
	case FileTypeAudio:
		return AssistTypeAudio
	case FileTypeVideo:
		return AssistTypeVideo
	case FileTypeDocument:
		return AssistTypeDoc
	case FileTypePPT:
		return AssistTypePPT
	case FileTypeExcel:
		return AssistTypeExcel
	case FileTypeTxt:
		return AssistTypeTXT
	case FileTypeCode:
		return AssistTypeCode
	case FileTypeZip:
		return AssistTypeZip
	default:
		return AssistTypeNotSet
	}
}

func convertVariableType(d DataType) (VariableType, error) {
	switch d {
	case DataTypeString, DataTypeTime, DataTypeFile:
		return VariableTypeString, nil
	case DataTypeNumber:
		return VariableTypeFloat, nil
	case DataTypeInteger:
		return VariableTypeInteger, nil
	case DataTypeBoolean:
		return VariableTypeBoolean, nil
	case DataTypeObject:
		return VariableTypeObject, nil
	case DataTypeArray:
		return VariableTypeList, nil
	default:
		return "", fmt.Errorf("unknown variable type: %v", d)
	}
}

func convertDataType(d DataType) schema.DataType {
	switch d {
	case DataTypeString, DataTypeTime, DataTypeFile:
		return schema.String
	case DataTypeNumber:
		return schema.Number
	case DataTypeInteger:
		return schema.Integer
	case DataTypeBoolean:
		return schema.Boolean
	case DataTypeObject:
		return schema.Object
	case DataTypeArray:
		return schema.Array
	default:
		panic("unknown data type")
	}
}

func TypeInfoToJSONSchema(tis map[string]*TypeInfo, structName *string) (string, error) {
	schema_ := map[string]any{
		"type":       "object",
		"properties": make(map[string]any),
		"required":   []string{},
	}

	if structName != nil {
		schema_["title"] = *structName
	}

	properties := schema_["properties"].(map[string]any)
	for key, typeInfo := range tis {
		if typeInfo == nil {
			continue
		}
		sc, err := typeInfoToJSONSchema(typeInfo)
		if err != nil {
			return "", err
		}
		properties[key] = sc
		if typeInfo.Required {
			schema_["required"] = append(schema_["required"].([]string), key)
		}
	}

	jsonBytes, err := sonic.Marshal(schema_)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
}

func typeInfoToJSONSchema(info *TypeInfo) (map[string]interface{}, error) {

	sc := make(map[string]interface{})

	switch info.Type {
	case DataTypeString:
		sc["type"] = "string"
	case DataTypeInteger:
		sc["type"] = "integer"
	case DataTypeNumber:
		sc["type"] = "number"
	case DataTypeBoolean:
		sc["type"] = "boolean"
	case DataTypeTime:
		sc["type"] = "string"
		sc["format"] = "date-time"
	case DataTypeObject:
		sc["type"] = "object"
	case DataTypeArray:
		sc["type"] = "array"
	case DataTypeFile:
		sc["type"] = "string"
		if info.FileType != nil {
			sc["contentMediaType"] = string(*info.FileType)
		}
	default:
		return nil, fmt.Errorf("impossible")
	}

	if info.Desc != "" {
		sc["description"] = info.Desc
	}

	if info.Type == DataTypeArray && info.ElemTypeInfo != nil {
		itemsSchema, err := typeInfoToJSONSchema(info.ElemTypeInfo)
		if err != nil {
			return nil, fmt.Errorf("failed to convert array element type: %v", err)
		}
		sc["items"] = itemsSchema
	}
	if info.Type == DataTypeObject && info.Properties != nil {
		properties := make(map[string]interface{})
		required := make([]string, 0)

		for name, propInfo := range info.Properties {
			propSchema, err := typeInfoToJSONSchema(propInfo)
			if err != nil {
				return nil, fmt.Errorf("failed to convert property %s: %v", name, err)
			}

			properties[name] = propSchema

			if propInfo.Required {
				required = append(required, name)
			}
		}

		sc["properties"] = properties

		if len(required) > 0 {
			sc["required"] = required
		}
	}

	return sc, nil
}

type FileSubType string

const (
	FileTypeDefault  FileSubType = "default"
	FileTypeImage    FileSubType = "image"
	FileTypeSVG      FileSubType = "svg"
	FileTypeAudio    FileSubType = "audio"
	FileTypeVideo    FileSubType = "video"
	FileTypeVoice    FileSubType = "voice"
	FileTypeDocument FileSubType = "doc"
	FileTypePPT      FileSubType = "ppt"
	FileTypeExcel    FileSubType = "excel"
	FileTypeTxt      FileSubType = "txt"
	FileTypeCode     FileSubType = "code"
	FileTypeZip      FileSubType = "zip"
)

type NodeProperty struct {
	Type                string
	IsEnableChatHistory bool
	IsEnableUserQuery   bool
	IsRefGlobalVariable bool
	SubWorkflow         map[string]*NodeProperty
}

func (f *FieldInfo) IsRefGlobalVariable() bool {
	if f.Source.Ref != nil && f.Source.Ref.VariableType != nil {
		return *f.Source.Ref.VariableType == variable.GlobalUser || *f.Source.Ref.VariableType == variable.GlobalSystem || *f.Source.Ref.VariableType == variable.GlobalAPP
	}
	return false
}

func ParseVariable(v any) (*Variable, error) {
	if va, ok := v.(*Variable); ok {
		return va, nil
	}

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
