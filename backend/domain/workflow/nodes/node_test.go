package nodes

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
)

type inner struct {
	InnerF1 FieldInfo
}

type scheme struct {
	M  map[string]FieldInfo
	F1 FieldInfo
	I  *inner
}

type TestNode struct {
	Schema *scheme
}

func (n *TestNode) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	return input, nil
}

func (n *TestNode) Info() (*NodeInfo, error) {
	return &NodeInfo{
		Lambda: &Lambda{
			Invoke: n.Invoke,
		},
	}, nil
}

func (n *TestNode) Marshal() ([]byte, error) {
	return sonic.Marshal(n.Schema)
}

func (n *TestNode) Unmarshal(bytes []byte) error {
	s, err := UnmarshalJSON[*scheme](bytes)
	if err != nil {
		return err
	}

	n.Schema = s
	return nil
}

func NewTestNode(s *scheme) *TestNode {
	return &TestNode{
		Schema: s,
	}
}

func TestLambdaNode(t *testing.T) {
	s := &scheme{
		M: map[string]FieldInfo{
			"key3": {
				Source: FieldSource{
					Val: "value3",
				},
			},
		},
		F1: FieldInfo{
			Source: FieldSource{
				Ref: &Reference{
					FromNodeKey: "parent_node1",
					FromPath:    []string{"field3"},
				},
			},
		},
		I: &inner{
			InnerF1: FieldInfo{
				Source: FieldSource{
					Ref: &Reference{
						FromNodeKey: compose.START,
						FromPath:    []string{"start_field1"},
					},
				},
			},
		},
	}

	testN := NewTestNode(s)

	m, err := testN.Marshal()
	assert.NoError(t, err)

	testN1 := &TestNode{}
	err = testN1.Unmarshal(m)
	assert.NoError(t, err)
	assert.Equal(t, s, testN1.Schema)

	info, err := testN1.Info()
	assert.NoError(t, err)
	assert.NotNil(t, info.Lambda.Invoke)

	inputFields, err := GetInputFields(s)
	assert.NoError(t, err)
	assert.Equal(t, []*InputField{
		{
			Info: FieldInfo{
				Source: FieldSource{
					Val: "value3",
				},
			},
			Path: compose.FieldPath{"M", "key3"},
		},
		{
			Info: FieldInfo{
				Source: FieldSource{
					Ref: &Reference{
						FromNodeKey: "parent_node1",
						FromPath:    compose.FieldPath{"field3"},
					},
				},
			},
			Path: compose.FieldPath{"F1"},
		},
		{
			Info: FieldInfo{
				Source: FieldSource{
					Ref: &Reference{
						FromNodeKey: compose.START,
						FromPath:    compose.FieldPath{"start_field1"},
					},
				},
			},
			Path: compose.FieldPath{"I", "InnerF1"},
		},
	}, inputFields)
}

func TestTypeInfoToJSONSchema(t *testing.T) {
	tests := []struct {
		name     string
		typeInfo map[string]*TypeInfo
		validate func(t *testing.T, schema string)
	}{
		{
			name: "Basic Data Types",
			typeInfo: map[string]*TypeInfo{
				"stringField": {Type: DataTypeString},
				"intField":    {Type: DataTypeInteger},
				"numField":    {Type: DataTypeNumber},
				"boolField":   {Type: DataTypeBoolean},
				"timeField":   {Type: DataTypeTime},
			},
			validate: func(t *testing.T, schema string) {
				var schemaObj map[string]any
				err := json.Unmarshal([]byte(schema), &schemaObj)
				assert.NoError(t, err)

				props := schemaObj["properties"].(map[string]any)

				// 验证字符串字段
				stringProp := props["stringField"].(map[string]any)
				assert.Equal(t, "string", stringProp["type"])

				// 验证整数字段
				intProp := props["intField"].(map[string]any)
				assert.Equal(t, "integer", intProp["type"])

				// 验证数字字段
				numProp := props["numField"].(map[string]any)
				assert.Equal(t, "number", numProp["type"])

				// 验证布尔字段
				boolProp := props["boolField"].(map[string]any)
				assert.Equal(t, "boolean", boolProp["type"])

				// 验证时间字段
				timeProp := props["timeField"].(map[string]any)
				assert.Equal(t, "string", timeProp["type"])
				assert.Equal(t, "date-time", timeProp["format"])
			},
		},
		{
			name: "Complex Data Types",
			typeInfo: map[string]*TypeInfo{
				"objectField": {Type: DataTypeObject},
				"arrayField": {
					Type:     DataTypeArray,
					ElemType: stringPtr(DataTypeString),
				},
				"fileField": {
					Type:     DataTypeFile,
					FileType: fileSubTypePtr(FileTypeImage),
				},
			},
			validate: func(t *testing.T, schema string) {
				var schemaObj map[string]any
				err := json.Unmarshal([]byte(schema), &schemaObj)
				assert.NoError(t, err)

				props := schemaObj["properties"].(map[string]any)

				// 验证对象字段
				objProp := props["objectField"].(map[string]any)
				assert.Equal(t, "object", objProp["type"])

				// 验证数组字段
				arrProp := props["arrayField"].(map[string]any)
				assert.Equal(t, "array", arrProp["type"])
				items := arrProp["items"].(map[string]any)
				assert.Equal(t, "string", items["type"])

				// 验证文件字段
				fileProp := props["fileField"].(map[string]any)
				assert.Equal(t, "string", fileProp["type"])
				assert.Equal(t, "image", fileProp["contentMediaType"])
			},
		},
		{
			name: "Nested Array",
			typeInfo: map[string]*TypeInfo{
				"nestedArray": {
					Type:     DataTypeArray,
					ElemType: stringPtr(DataTypeObject),
				},
			},
			validate: func(t *testing.T, schema string) {
				var schemaObj map[string]any
				err := json.Unmarshal([]byte(schema), &schemaObj)
				assert.NoError(t, err)

				props := schemaObj["properties"].(map[string]any)

				// 验证嵌套数组字段
				arrProp := props["nestedArray"].(map[string]any)
				assert.Equal(t, "array", arrProp["type"])
				items := arrProp["items"].(map[string]any)
				assert.Equal(t, "object", items["type"])
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			schema, err := TypeInfoToJSONSchema(tt.typeInfo)
			assert.NoError(t, err)
			tt.validate(t, schema)
		})
	}
}

// 辅助函数，用于创建 DataType 指针
func stringPtr(dt DataType) *DataType {
	return &dt
}

// 辅助函数，用于创建 FileSubType 指针
func fileSubTypePtr(fst FileSubType) *FileSubType {
	return &fst
}
