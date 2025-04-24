package compose

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

func TestNodeSchema_OutputValueFiller(t *testing.T) {
	type fields struct {
		In      map[string]any
		Outputs map[string]*nodes.TypeInfo
	}
	tests := []struct {
		name    string
		fields  fields
		want    map[string]any
		wantErr string
	}{
		{
			name: "string field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeString,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "integer field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeInteger,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "number field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeNumber,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "boolean field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeBoolean,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "time field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeTime,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "object field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeObject,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "array field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeArray,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "file field",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeFile,
					},
				},
			},
			want: map[string]any{
				"key": nil,
			},
		},
		{
			name: "required field not present",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type:     nodes.DataTypeString,
						Required: true,
					},
				},
			},
			wantErr: "is required but not present",
		},
		{
			name: "layered: object.string",
			fields: fields{
				In: map[string]any{
					"key": map[string]any{},
				},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							"sub_key": {
								Type: nodes.DataTypeString,
							},
						},
					},
				},
			},
			want: map[string]any{
				"key": map[string]any{
					"sub_key": nil,
				},
			},
		},
		{
			name: "layered: object.object",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							"sub_key": {
								Type: nodes.DataTypeObject,
							},
						},
					},
				},
			},
			want: map[string]any{
				"key": map[string]any{
					"sub_key": nil,
				},
			},
		},
		{
			name: "layered: object.object.array",
			fields: fields{
				In: map[string]any{},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							"sub_key": {
								Type: nodes.DataTypeObject,
								Properties: map[string]*nodes.TypeInfo{
									"sub_key2": {
										Type: nodes.DataTypeArray,
									},
								},
							},
						},
					},
				},
			},
			want: map[string]any{
				"key": map[string]any{
					"sub_key": map[string]any{
						"sub_key2": nil,
					},
				},
			},
		},
		{
			name: "key present",
			fields: fields{
				In: map[string]any{
					"key": "value",
				},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeString,
					},
				},
			},
			want: map[string]any{
				"key": "value",
			},
		},
		{
			name: "layered key present",
			fields: fields{
				In: map[string]any{
					"key": map[string]any{},
				},
				Outputs: map[string]*nodes.TypeInfo{
					"key": {
						Type: nodes.DataTypeObject,
						Properties: map[string]*nodes.TypeInfo{
							"sub_key": {
								Type: nodes.DataTypeObject,
								Properties: map[string]*nodes.TypeInfo{
									"sub_key2": {
										Type: nodes.DataTypeArray,
									},
								},
							},
						},
					},
				},
			},
			want: map[string]any{
				"key": map[string]any{
					"sub_key": map[string]any{
						"sub_key2": nil,
					},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &NodeSchema{
				OutputTypes: tt.fields.Outputs,
			}

			got, err := s.outputValueFiller()(context.Background(), tt.fields.In)

			if len(tt.wantErr) > 0 {
				assert.Error(t, err)
				assert.ErrorContains(t, err, tt.wantErr)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}
