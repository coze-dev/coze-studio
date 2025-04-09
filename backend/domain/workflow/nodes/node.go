package nodes

import (
	"context"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
)

type FieldInfo struct {
	Source   *FieldSource `json:"source,omitempty"`
	Type     TypeInfo     `json:"type"`
	Required bool         `json:"required,omitempty"`
}

type InputField struct {
	Info FieldInfo         `json:"info"`
	Path compose.FieldPath `json:"path"`
}

type RefType string

const (
	RefTypeNode               RefType = "node"
	RefTypeGlobalUser         RefType = "global_user"
	RefTypeGlobalSustem       RefType = "global_sys"
	RefTypeParentIntermediate RefType = "parent_intermediate"
)

type Reference struct {
	FromNodeKey string            `json:"from_node_key,omitempty"`
	FromPath    compose.FieldPath `json:"from_path"`

	RefType *RefType `json:"ref_type,omitempty"` // default to RefTypeNode
}

type FieldSource struct {
	Ref *Reference `json:"ref,omitempty"`
	Val any        `json:"val,omitempty"`
}

type TypeInfo struct {
	Type     DataType     `json:"type"`
	ElemType *DataType    `json:"elem_type,omitempty"`
	FileType *FileSubType `json:"file_type,omitempty"`
}

type DataType string

const (
	DataTypeString  DataType = "string"  // string
	DataTypeInteger DataType = "integer" // int64
	DataTypeNumber  DataType = "number"  // float64
	DataTypeBoolean DataType = "boolean" // bool
	DataTypeTime    DataType = "time"    // time.Time
	DataTypeObject  DataType = "object"  // map[string]any
	DataTypeArray   DataType = "array"   // []any
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
			elemType := *t.ElemType
			if elemType == DataTypeArray {
				panic("not support")
			}

			elemTypeInfo := &TypeInfo{
				Type: elemType,
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

func TypeInfoToJSONSchema(tis map[string]*TypeInfo) (string, error) {
	schema_ := map[string]any{
		"type":       "object",
		"properties": make(map[string]any),
		"required":   []string{},
	}

	properties := schema_["properties"].(map[string]any)

	for field, typeInfo := range tis {
		property := make(map[string]any)

		switch typeInfo.Type {
		case DataTypeString:
			property["type"] = "string"
		case DataTypeInteger:
			property["type"] = "integer"
		case DataTypeNumber:
			property["type"] = "number"
		case DataTypeBoolean:
			property["type"] = "boolean"
		case DataTypeTime:
			property["type"] = "string"
			property["format"] = "date-time"
		case DataTypeObject:
			property["type"] = "object"
		case DataTypeArray:
			property["type"] = "array"
			if typeInfo.ElemType != nil {
				items := make(map[string]any)
				switch *typeInfo.ElemType {
				case DataTypeString:
					items["type"] = "string"
				case DataTypeInteger:
					items["type"] = "integer"
				case DataTypeNumber:
					items["type"] = "number"
				case DataTypeBoolean:
					items["type"] = "boolean"
				case DataTypeTime:
					items["type"] = "string"
					items["format"] = "date-time"
				case DataTypeObject:
					items["type"] = "object"
				case DataTypeFile:
					items["type"] = "string"
					if typeInfo.FileType != nil {
						items["contentMediaType"] = string(*typeInfo.FileType)
					}
				}
				property["items"] = items
			}
		case DataTypeFile:
			property["type"] = "string"
			if typeInfo.FileType != nil {
				property["contentMediaType"] = string(*typeInfo.FileType)
			}
		}

		properties[field] = property
	}

	jsonBytes, err := sonic.Marshal(schema_)
	if err != nil {
		return "", err
	}
	return string(jsonBytes), nil
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

func DefaultOutDecorate[I any, O any, OPT any](
	r func(ctx context.Context, input I, opts ...OPT) (output O, err error),
	defaultOutput O) func(ctx context.Context, input I, opts ...OPT) (output O, err error) {

	return func(ctx context.Context, input I, opts ...OPT) (output O, err error) {
		output, err = r(ctx, input, opts...)
		if err != nil {
			return defaultOutput, nil
		}

		return output, nil
	}
}
