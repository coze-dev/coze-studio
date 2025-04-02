package nodes

import (
	"context"
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

func (n *TestNode) Invoke(ctx context.Context, input map[string]interface{}) (map[string]interface{}, error) {
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
