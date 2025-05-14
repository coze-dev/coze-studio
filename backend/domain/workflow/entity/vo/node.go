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

func (t *TypeInfo) ToParameterInfo() (*schema.ParameterInfo, error) {
	param := &schema.ParameterInfo{
		Type:     convertDataType(t.Type),
		Desc:     t.Desc,
		Required: t.Required,
	}

	if t.Type == DataTypeObject {
		param.SubParams = make(map[string]*schema.ParameterInfo, len(t.Properties))
		for k, subT := range t.Properties {
			subParam, err := subT.ToParameterInfo()
			if err != nil {
				return nil, err
			}
			param.SubParams[k] = subParam
		}
	} else if t.Type == DataTypeArray {
		elemParam, err := t.ElemTypeInfo.ToParameterInfo()
		if err != nil {
			return nil, err
		}
		param.ElemInfo = elemParam
	}

	return param, nil
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

func TypeValidateAndConvert(t *TypeInfo, v any) (any, bool) {
	switch t.Type {
	case DataTypeString:
		if _, ok := v.(string); ok {
			return v, true
		}
		return nil, false
	case DataTypeInteger:
		return toInt64(v)
	case DataTypeNumber:
		if _, ok := v.(float64); ok {
			return v, true
		}
		return nil, false
	case DataTypeBoolean:
		if _, ok := v.(bool); ok {
			return v, true
		}
		return nil, false
	case DataTypeTime:
		if _, ok := v.(time.Time); ok {
			return v, true
		}
		return nil, false
	case DataTypeObject:
		if _, ok := v.(map[string]any); ok {
			return v, true
		}
		return nil, false
	case DataTypeArray:
		if val, ok := v.([]any); ok {
			elemTypeInfo := t.ElemTypeInfo
			if elemTypeInfo.Type == DataTypeArray {
				panic("not support")
			}
			for i := range val {
				elem, ok_ := TypeValidateAndConvert(elemTypeInfo, val[i])
				if !ok_ {
					return nil, false
				}

				val[i] = elem
			}

			return v, true
		}

		return nil, false
	case DataTypeFile:
		if _, ok := v.(string); ok {
			return v, true
		}
		return nil, false
	default:
		panic("impossible")
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
		schema, err := typeInfoToJSONSchema(typeInfo)
		if err != nil {
			return "", err
		}
		properties[key] = schema
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

	schema := make(map[string]interface{})

	switch info.Type {
	case DataTypeString:
		schema["type"] = "string"
	case DataTypeInteger:
		schema["type"] = "integer"
	case DataTypeNumber:
		schema["type"] = "number"
	case DataTypeBoolean:
		schema["type"] = "boolean"
	case DataTypeTime:
		schema["type"] = "string"
		schema["format"] = "date-time"
	case DataTypeObject:
		schema["type"] = "object"
	case DataTypeArray:
		schema["type"] = "array"
	case DataTypeFile:
		schema["type"] = "string"
		if info.FileType != nil {
			schema["contentMediaType"] = string(*info.FileType)
		}
	default:
		return nil, fmt.Errorf("impossible")
	}

	if info.Desc != "" {
		schema["description"] = info.Desc
	}

	if info.Type == DataTypeArray && info.ElemTypeInfo != nil {
		itemsSchema, err := typeInfoToJSONSchema(info.ElemTypeInfo)
		if err != nil {
			return nil, fmt.Errorf("failed to convert array element type: %v", err)
		}
		schema["items"] = itemsSchema
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

		schema["properties"] = properties

		if len(required) > 0 {
			schema["required"] = required
		}
	}

	return schema, nil
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
