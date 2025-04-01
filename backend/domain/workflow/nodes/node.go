package nodes

import (
	"context"

	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"
)

type Node interface {
	Info() (*NodeInfo, error)
	Marshal() ([]byte, error)
	Unmarshal([]byte) error
}

type Lambda struct {
	Invoke    func(ctx context.Context, input map[string]any) (map[string]any, error)
	Stream    func(ctx context.Context, input map[string]any) (*schema.StreamReader[map[string]any], error)
	Collect   func(ctx context.Context, input *schema.StreamReader[map[string]any]) (map[string]any, error)
	Transform func(ctx context.Context, input *schema.StreamReader[map[string]any]) (*schema.StreamReader[map[string]any], error)
}

type NodeInfo struct {
	Lambda *Lambda
	Fields []*InputField `json:"fields"`
}

type FieldInfo struct {
	Source   FieldSource `json:"source"`
	Type     TypeInfo    `json:"type"`
	Required bool        `json:"required,omitempty"`
}

type InputField struct {
	Info FieldInfo         `json:"info"`
	Path compose.FieldPath `json:"path"`
}

type Reference struct {
	FromNodeKey string            `json:"from_node_key"`
	FromPath    compose.FieldPath `json:"from_path"`
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
	DataTypeString  DataType = "string"
	DataTypeInteger DataType = "integer"
	DataTypeNumber  DataType = "number"
	DataTypeBoolean DataType = "boolean"
	DataTypeTime    DataType = "time"
	DataTypeObject  DataType = "object"
	DataTypeArray   DataType = "array"
	DataTypeFile    DataType = "file"
)

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
