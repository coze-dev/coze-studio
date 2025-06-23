package json

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"code.byted.org/flow/opencoze/backend/pkg/sonic"
)

func TestNewJsonDeserializer(t *testing.T) {
	ctx := context.Background()

	// Test with nil config
	_, err := NewJsonDeserializer(ctx, nil)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "config required")

	// Test with missing OutputFields config
	_, err = NewJsonDeserializer(ctx, &DeserializationConfig{})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "OutputFields is required")

	// Test with missing output key in OutputFields
	_, err = NewJsonDeserializer(ctx, &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			"testKey": {Type: vo.DataTypeString},
		},
	})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no output field specified in deserialization config")

	// Test with valid config
	validConfig := &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			OutputKeyDeserialization: {Type: vo.DataTypeString},
		},
	}
	processor, err := NewJsonDeserializer(ctx, validConfig)
	assert.NoError(t, err)
	assert.NotNil(t, processor)
}

func TestJsonDeserializer_Invoke(t *testing.T) {
	ctx := context.Background()

	// Base type test config
	baseTypeConfig := &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			"output": {Type: vo.DataTypeString},
		},
	}

	// Object type test config
	objectTypeConfig := &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			"output": {
				Type: vo.DataTypeObject,
				Properties: map[string]*vo.TypeInfo{
					"name": {Type: vo.DataTypeString, Required: true},
					"age":  {Type: vo.DataTypeInteger},
				},
			},
		},
	}

	// Array type test config
	arrayTypeConfig := &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			"output": {
				Type:         vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeInteger},
			},
		},
	}

	// Nested array object test config
	nestedArrayConfig := &DeserializationConfig{
		OutputFields: map[string]*vo.TypeInfo{
			"output": {
				Type: vo.DataTypeArray,
				ElemTypeInfo: &vo.TypeInfo{
					Type: vo.DataTypeObject,
					Properties: map[string]*vo.TypeInfo{
						"id":   {Type: vo.DataTypeInteger},
						"name": {Type: vo.DataTypeString},
					},
				},
			},
		},
	}

	// Test cases
	tests := []struct {
		name           string
		config         *DeserializationConfig
		inputJSON      string
		expectedOutput any
		expectErr      bool
		expectWarnings int
	}{{
		name:           "Test string deserialization",
		config:         baseTypeConfig,
		inputJSON:      `"test string"`,
		expectedOutput: "test string",
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test integer deserialization",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `123`,
		expectedOutput: 123,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test boolean deserialization",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeBoolean},
			},
		},
		inputJSON:      `true`,
		expectedOutput: true,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name:           "Test object deserialization",
		config:         objectTypeConfig,
		inputJSON:      `{"name":"test","age":20}`,
		expectedOutput: map[string]any{"name": "test", "age": 20.0},
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name:           "Test array deserialization",
		config:         arrayTypeConfig,
		inputJSON:      `[1,2,3]`,
		expectedOutput: []any{1.0, 2.0, 3.0},
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name:      "Test nested array object deserialization",
		config:    nestedArrayConfig,
		inputJSON: `[{"id":1,"name":"a"},{"id":2,"name":"b"}]`,
		expectedOutput: []any{
			map[string]any{"id": 1.0, "name": "a"},
			map[string]any{"id": 2.0, "name": "b"},
		},
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name:           "Test invalid JSON format",
		config:         baseTypeConfig,
		inputJSON:      `{invalid json}`,
		expectedOutput: nil,
		expectErr:      true,
		expectWarnings: 0,
	}, {
		name: "Test type mismatch warning",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `"not a number"`,
		expectedOutput: 0,
		expectErr:      false,
		expectWarnings: 1,
	}, {
		name:           "Test null JSON input",
		config:         baseTypeConfig,
		inputJSON:      `null`,
		expectedOutput: nil,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test string to integer conversion",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `"123"`,
		expectedOutput: 123,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test float to integer conversion (integer part)",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `123.0`,
		expectedOutput: 123,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test float to integer conversion (non-integer part)",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `123.5`,
		expectedOutput: 123,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test boolean to integer conversion",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `true`,
		expectedOutput: 0,
		expectErr:      false,
		expectWarnings: 1,
	}, {
		name: "Test string to boolean conversion",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeBoolean},
			},
		},
		inputJSON:      `"true"`,
		expectedOutput: true,
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test string to integer conversion in nested object",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {
					Type: vo.DataTypeObject,
					Properties: map[string]*vo.TypeInfo{
						"age": {Type: vo.DataTypeInteger},
					},
				},
			},
		},
		inputJSON:      `{"age":"456"}`,
		expectedOutput: map[string]any{"age": 456},
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test string to integer conversion for array elements",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeInteger},
				},
			},
		},
		inputJSON:      `["1", "2", "3"]`,
		expectedOutput: []any{1, 2, 3},
		expectErr:      false,
		expectWarnings: 0,
	}, {
		name: "Test string with non-numeric characters to integer conversion",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {Type: vo.DataTypeInteger},
			},
		},
		inputJSON:      `"123abc"`,
		expectedOutput: 0,
		expectErr:      false,
		expectWarnings: 1,
	}, {
		name: "Test type mismatch in nested object field",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {
					Type: vo.DataTypeObject,
					Properties: map[string]*vo.TypeInfo{
						"score": {Type: vo.DataTypeInteger},
					},
				},
			},
		},
		inputJSON:      `{"score":"invalid"}`,
		expectedOutput: map[string]any{"score": nil},
		expectErr:      false,
		expectWarnings: 1,
	}, {
		name: "Test partial conversion failure in array elements",
		config: &DeserializationConfig{
			OutputFields: map[string]*vo.TypeInfo{
				"output": {
					Type:         vo.DataTypeArray,
					ElemTypeInfo: &vo.TypeInfo{Type: vo.DataTypeInteger},
				},
			},
		},
		inputJSON:      `["1", "two", 3]`,
		expectedOutput: []any{1, 3},
		expectErr:      false,
		expectWarnings: 1,
	}}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			processor, err := NewJsonDeserializer(ctx, tt.config)
			assert.NoError(t, err)

			ctxWithCache := ctxcache.Init(ctx)
			input := map[string]any{"input": tt.inputJSON}
			result, err := processor.Invoke(ctxWithCache, input)

			if tt.expectErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Contains(t, result, OutputKeyDeserialization)

			// Verify the output
			output := result[OutputKeyDeserialization]
			if tt.expectedOutput == nil {
				assert.Nil(t, output)
			} else {
				// Serialize expected and actual output to JSON for comparison, ignoring type differences (e.g., float64 vs. int)
				actualJSON, _ := sonic.Marshal(output)
				expectedJSON, _ := sonic.Marshal(tt.expectedOutput)
				assert.JSONEq(t, string(expectedJSON), string(actualJSON))
			}

			// Verify the number of warnings
			warnings, _ := ctxcache.Get[[]string](ctxWithCache, warningsKey)
			assert.Equal(t, tt.expectWarnings, len(warnings))
		})
	}
}
