package selector

import (
	"testing"

	"github.com/cloudwego/eino/compose"
	"github.com/stretchr/testify/assert"
)

// TestClauseResolve tests the Resolve method of the Clause struct.
func TestClauseResolve(t *testing.T) {
	// Define a sample input map with different types of values
	input := map[string]any{
		"node1\x01field1":         int64(10),                        // int
		"node1\x01field2":         "test",                           // string
		"node1\x01field3":         []int{1, 2, 3},                   // slice
		"node1\x01field4":         map[string]any{"key1": "value1"}, // map
		"node1\x01field4\x01key1": "value1",
		"node1\x01field5":         true, // bool
		"node1\x01field6":         nil,  // nil
		"node1\x01field7":         10.5, // float64
	}

	// Test cases for different operators, considering acceptable operand types
	testCases := []struct {
		name    string
		clause  Clause
		want    bool
		wantErr bool
	}{
		// OperatorEqual
		{
			name: "OperatorEqual_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorEqual,
				RightValue: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorEqual_IntMismatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorEqual,
				RightValue: int64(20),
			},
			want:    false,
			wantErr: false,
		},
		{
			name: "OperatorEqual_FloatMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field7"},
				},
				Op:         OperatorEqual,
				RightValue: 10.5,
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorEqual_StringMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field2"},
				},
				Op:         OperatorEqual,
				RightValue: "test",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotEqual
		{
			name: "OperatorNotEqual_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorNotEqual,
				RightValue: int64(20),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorNotEqual_StringMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field2"},
				},
				Op:         OperatorNotEqual,
				RightValue: "xyz",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorEmpty
		{
			name: "OperatorEmpty_NilValue",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field6"},
				},
				Op: OperatorEmpty,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotEmpty
		{
			name: "OperatorNotEmpty_MapValue",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field4"},
				},
				Op: OperatorNotEmpty,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorGreater
		{
			name: "OperatorGreater_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorGreater,
				RightValue: int64(5),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorGreater_FloatMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field7"},
				},
				Op:         OperatorGreater,
				RightValue: 5.0,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorGreaterOrEqual
		{
			name: "OperatorGreaterOrEqual_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorGreaterOrEqual,
				RightValue: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLesser
		{
			name: "OperatorLesser_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorLesser,
				RightValue: int64(15),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLesserOrEqual
		{
			name: "OperatorLesserOrEqual_IntMatch",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field1"},
				},
				Op:         OperatorLesserOrEqual,
				RightValue: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorIsTrue
		{
			name: "OperatorIsTrue_BoolTrue",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field5"},
				},
				Op: OperatorIsTrue,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorIsFalse
		{
			name: "OperatorIsFalse_BoolFalse",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field5"},
				},
				Op: OperatorIsFalse,
			},
			want:    false,
			wantErr: false,
		},
		// OperatorLengthGreater
		{
			name: "OperatorLengthGreater_Slice",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field3"},
				},
				Op:         OperatorLengthGreater,
				RightValue: 2,
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorLengthGreater_String",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field2"},
				},
				Op:         OperatorLengthGreater,
				RightValue: 2,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthGreaterOrEqual
		{
			name: "OperatorLengthGreaterOrEqual_Slice",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field3"},
				},
				Op:         OperatorLengthGreaterOrEqual,
				RightValue: 3,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthLesser
		{
			name: "OperatorLengthLesser_Slice",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field3"},
				},
				Op:         OperatorLengthLesser,
				RightValue: 4,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthLesserOrEqual
		{
			name: "OperatorLengthLesserOrEqual_Slice",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field3"},
				},
				Op:         OperatorLengthLesserOrEqual,
				RightValue: 3,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorContain
		{
			name: "OperatorContain_String",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field2"},
				},
				Op:         OperatorContain,
				RightValue: "es",
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorContain_Slice",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field3"},
				},
				Op:         OperatorContain,
				RightValue: 2,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotContain
		{
			name: "OperatorNotContain_String",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field2"},
				},
				Op:         OperatorNotContain,
				RightValue: "xyz",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorContainKey
		{
			name: "OperatorContainKey_Map",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field4"},
				},
				Op:         OperatorContainKey,
				RightValue: "key1",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotContainKey
		{
			name: "OperatorNotContainKey_Map",
			clause: Clause{
				LeftOperant: Operant{
					FromNodeKey: "node1",
					Path:        compose.FieldPath{"field4"},
				},
				Op:         OperatorNotContainKey,
				RightValue: "key2",
			},
			want:    true,
			wantErr: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := tc.clause.Resolve(input)
			if (err != nil) != tc.wantErr {
				t.Errorf("Clause.Resolve() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}
