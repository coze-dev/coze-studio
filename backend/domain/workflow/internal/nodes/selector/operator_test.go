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
	"reflect"
	"testing"
)

// TestOperatorWillAccept tests the WillAccept method of the Operator struct.
func TestOperatorWillAccept(t *testing.T) {
	testCases := []struct {
		name      string
		operator  Operator
		leftType  reflect.Type
		rightType reflect.Type
		wantErr   bool
	}{
		// OperatorEqual
		{
			name:      "OperatorEqual_Int64Match",
			operator:  OperatorEqual,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorEqual_InvalidType",
			operator:  OperatorEqual,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorNotEqual
		{
			name:      "OperatorNotEqual_Float64Match",
			operator:  OperatorNotEqual,
			leftType:  reflect.TypeOf(float64(0)),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorNotEqual_InvalidType",
			operator:  OperatorNotEqual,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorEmpty
		{
			name:      "OperatorEmpty_Struct",
			operator:  OperatorEmpty,
			leftType:  reflect.TypeOf(map[string]int{}),
			rightType: nil,
			wantErr:   false,
		},
		{
			name:      "OperatorEmpty_NonNilRight",
			operator:  OperatorEmpty,
			leftType:  reflect.TypeOf(map[string]int{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		// OperatorNotEmpty
		{
			name:      "OperatorNotEmpty_Slice",
			operator:  OperatorNotEmpty,
			leftType:  reflect.TypeOf([]int{}),
			rightType: nil,
			wantErr:   false,
		},
		{
			name:      "OperatorNotEmpty_NonNilRight",
			operator:  OperatorNotEmpty,
			leftType:  reflect.TypeOf([]int{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		// OperatorGreater
		{
			name:      "OperatorGreater_Int64Match",
			operator:  OperatorGreater,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorGreater_InvalidType",
			operator:  OperatorGreater,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorGreaterOrEqual
		{
			name:      "OperatorGreaterOrEqual_Float64Match",
			operator:  OperatorGreaterOrEqual,
			leftType:  reflect.TypeOf(float64(0)),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorGreaterOrEqual_InvalidType",
			operator:  OperatorGreaterOrEqual,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorLesser
		{
			name:      "OperatorLesser_Int64Match",
			operator:  OperatorLesser,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLesser_InvalidType",
			operator:  OperatorLesser,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorLesserOrEqual
		{
			name:      "OperatorLesserOrEqual_Float64Match",
			operator:  OperatorLesserOrEqual,
			leftType:  reflect.TypeOf(float64(0)),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLesserOrEqual_InvalidType",
			operator:  OperatorLesserOrEqual,
			leftType:  reflect.TypeOf(struct{}{}),
			rightType: reflect.TypeOf(struct{}{}),
			wantErr:   true,
		},
		// OperatorIsTrue
		{
			name:      "OperatorIsTrue_Bool",
			operator:  OperatorIsTrue,
			leftType:  reflect.TypeOf(true),
			rightType: nil,
			wantErr:   false,
		},
		{
			name:      "OperatorIsTrue_NonNilRight",
			operator:  OperatorIsTrue,
			leftType:  reflect.TypeOf(true),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorIsTrue_InvalidType",
			operator:  OperatorIsTrue,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: nil,
			wantErr:   true,
		},
		// OperatorIsFalse
		{
			name:      "OperatorIsFalse_Bool",
			operator:  OperatorIsFalse,
			leftType:  reflect.TypeOf(false),
			rightType: nil,
			wantErr:   false,
		},
		{
			name:      "OperatorIsFalse_NonNilRight",
			operator:  OperatorIsFalse,
			leftType:  reflect.TypeOf(false),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorIsFalse_InvalidType",
			operator:  OperatorIsFalse,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: nil,
			wantErr:   true,
		},
		// OperatorLengthGreater
		{
			name:      "OperatorLengthGreater_String",
			operator:  OperatorLengthGreater,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLengthGreater_InvalidLeft",
			operator:  OperatorLengthGreater,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorLengthGreater_InvalidRight",
			operator:  OperatorLengthGreater,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   true,
		},
		// OperatorLengthGreaterOrEqual
		{
			name:      "OperatorLengthGreaterOrEqual_Slice",
			operator:  OperatorLengthGreaterOrEqual,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLengthGreaterOrEqual_InvalidLeft",
			operator:  OperatorLengthGreaterOrEqual,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorLengthGreaterOrEqual_InvalidRight",
			operator:  OperatorLengthGreaterOrEqual,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   true,
		},
		// OperatorLengthLesser
		{
			name:      "OperatorLengthLesser_String",
			operator:  OperatorLengthLesser,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLengthLesser_InvalidLeft",
			operator:  OperatorLengthLesser,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorLengthLesser_InvalidRight",
			operator:  OperatorLengthLesser,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   true,
		},
		// OperatorLengthLesserOrEqual
		{
			name:      "OperatorLengthLesserOrEqual_Slice",
			operator:  OperatorLengthLesserOrEqual,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorLengthLesserOrEqual_InvalidLeft",
			operator:  OperatorLengthLesserOrEqual,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorLengthLesserOrEqual_InvalidRight",
			operator:  OperatorLengthLesserOrEqual,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(float64(0)),
			wantErr:   true,
		},
		// OperatorContain
		{
			name:      "OperatorContain_String",
			operator:  OperatorContain,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(""),
			wantErr:   false,
		},
		{
			name:      "OperatorContain_Slice",
			operator:  OperatorContain,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorContain_InvalidLeft",
			operator:  OperatorContain,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(0),
			wantErr:   true,
		},
		{
			name:      "OperatorContain_InvalidRight",
			operator:  OperatorContain,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		// OperatorNotContain
		{
			name:      "OperatorNotContain_String",
			operator:  OperatorNotContain,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(""),
			wantErr:   false,
		},
		{
			name:      "OperatorNotContain_Slice",
			operator:  OperatorNotContain,
			leftType:  reflect.TypeOf([]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   false,
		},
		{
			name:      "OperatorNotContain_InvalidLeft",
			operator:  OperatorNotContain,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		{
			name:      "OperatorNotContain_InvalidRight",
			operator:  OperatorNotContain,
			leftType:  reflect.TypeOf(""),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		// OperatorContainKey
		{
			name:      "OperatorContainKey_Map",
			operator:  OperatorContainKey,
			leftType:  reflect.TypeOf(map[string]any{}),
			rightType: reflect.TypeOf(""),
			wantErr:   false,
		},
		{
			name:      "OperatorContainKey_InvalidLeft",
			operator:  OperatorContainKey,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(""),
			wantErr:   true,
		},
		{
			name:      "OperatorContainKey_InvalidRight",
			operator:  OperatorContainKey,
			leftType:  reflect.TypeOf(map[string]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
		// OperatorNotContainKey
		{
			name:      "OperatorNotContainKey_Map",
			operator:  OperatorNotContainKey,
			leftType:  reflect.TypeOf(map[string]any{}),
			rightType: reflect.TypeOf(""),
			wantErr:   false,
		},
		{
			name:      "OperatorNotContainKey_InvalidLeft",
			operator:  OperatorNotContainKey,
			leftType:  reflect.TypeOf(int64(0)),
			rightType: reflect.TypeOf(""),
			wantErr:   true,
		},
		{
			name:      "OperatorNotContainKey_InvalidRight",
			operator:  OperatorNotContainKey,
			leftType:  reflect.TypeOf(map[string]any{}),
			rightType: reflect.TypeOf(int64(0)),
			wantErr:   true,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.operator.WillAccept(tc.leftType, tc.rightType)
			if (err != nil) != tc.wantErr {
				t.Errorf("Operator.WillAccept() error = %v, wantErr %v", err, tc.wantErr)
			}
		})
	}
}
