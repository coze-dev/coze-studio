/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package selector

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestClauseResolve tests the Resolve method of the Clause struct.
func TestClauseResolve(t *testing.T) {
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
				LeftOperant:  int64(10),
				Op:           OperatorEqual,
				RightOperant: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorEqual_IntMismatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorEqual,
				RightOperant: int64(20),
			},
			want:    false,
			wantErr: false,
		},
		{
			name: "OperatorEqual_FloatMatch",
			clause: Clause{
				LeftOperant:  10.5,
				Op:           OperatorEqual,
				RightOperant: 10.5,
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorEqual_StringMatch",
			clause: Clause{
				LeftOperant:  "test",
				Op:           OperatorEqual,
				RightOperant: "test",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotEqual
		{
			name: "OperatorNotEqual_IntMatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorNotEqual,
				RightOperant: int64(20),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorNotEqual_StringMatch",
			clause: Clause{
				LeftOperant:  "test",
				Op:           OperatorNotEqual,
				RightOperant: "xyz",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorEmpty
		{
			name: "OperatorEmpty_NilValue",
			clause: Clause{
				LeftOperant: nil,
				Op:          OperatorEmpty,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotEmpty
		{
			name: "OperatorNotEmpty_MapValue",
			clause: Clause{
				LeftOperant: map[string]any{"key1": "value1"},
				Op:          OperatorNotEmpty,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorGreater
		{
			name: "OperatorGreater_IntMatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorGreater,
				RightOperant: int64(5),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorGreater_FloatMatch",
			clause: Clause{
				LeftOperant:  10.5,
				Op:           OperatorGreater,
				RightOperant: 5.0,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorGreaterOrEqual
		{
			name: "OperatorGreaterOrEqual_IntMatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorGreaterOrEqual,
				RightOperant: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLesser
		{
			name: "OperatorLesser_IntMatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorLesser,
				RightOperant: int64(15),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLesserOrEqual
		{
			name: "OperatorLesserOrEqual_IntMatch",
			clause: Clause{
				LeftOperant:  int64(10),
				Op:           OperatorLesserOrEqual,
				RightOperant: int64(10),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorIsTrue
		{
			name: "OperatorIsTrue_BoolTrue",
			clause: Clause{
				LeftOperant: true,
				Op:          OperatorIsTrue,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorIsFalse
		{
			name: "OperatorIsFalse_BoolFalse",
			clause: Clause{
				LeftOperant: true,
				Op:          OperatorIsFalse,
			},
			want:    false,
			wantErr: false,
		},
		// OperatorLengthGreater
		{
			name: "OperatorLengthGreater_Slice",
			clause: Clause{
				LeftOperant:  []int{1, 2, 3},
				Op:           OperatorLengthGreater,
				RightOperant: int64(2),
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorLengthGreater_String",
			clause: Clause{
				LeftOperant:  "test",
				Op:           OperatorLengthGreater,
				RightOperant: int64(2),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthGreaterOrEqual
		{
			name: "OperatorLengthGreaterOrEqual_Slice",
			clause: Clause{
				LeftOperant:  []int{1, 2, 3},
				Op:           OperatorLengthGreaterOrEqual,
				RightOperant: int64(3),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthLesser
		{
			name: "OperatorLengthLesser_Slice",
			clause: Clause{
				LeftOperant:  []int{1, 2, 3},
				Op:           OperatorLengthLesser,
				RightOperant: int64(4),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorLengthLesserOrEqual
		{
			name: "OperatorLengthLesserOrEqual_Slice",
			clause: Clause{
				LeftOperant:  []int{1, 2, 3},
				Op:           OperatorLengthLesserOrEqual,
				RightOperant: int64(3),
			},
			want:    true,
			wantErr: false,
		},
		// OperatorContain
		{
			name: "OperatorContain_String",
			clause: Clause{
				LeftOperant:  "test",
				Op:           OperatorContain,
				RightOperant: "es",
			},
			want:    true,
			wantErr: false,
		},
		{
			name: "OperatorContain_Slice",
			clause: Clause{
				LeftOperant:  []int{1, 2, 3},
				Op:           OperatorContain,
				RightOperant: 2,
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotContain
		{
			name: "OperatorNotContain_String",
			clause: Clause{
				LeftOperant:  "test2",
				Op:           OperatorNotContain,
				RightOperant: "xyz",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorContainKey
		{
			name: "OperatorContainKey_Map",
			clause: Clause{
				LeftOperant:  map[string]any{"key1": "value1"},
				Op:           OperatorContainKey,
				RightOperant: "key1",
			},
			want:    true,
			wantErr: false,
		},
		// OperatorNotContainKey
		{
			name: "OperatorNotContainKey_Map",
			clause: Clause{
				LeftOperant:  map[string]any{"key1": "value1"},
				Op:           OperatorNotContainKey,
				RightOperant: "key2",
			},
			want:    true,
			wantErr: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := tc.clause.Resolve()
			if (err != nil) != tc.wantErr {
				t.Errorf("Clause.Resolve() error = %v, wantErr %v", err, tc.wantErr)
				return
			}
			assert.Equal(t, tc.want, got)
		})
	}
}
