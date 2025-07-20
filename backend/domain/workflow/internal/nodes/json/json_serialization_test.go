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

package json

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

func TestNewJsonSerialize(t *testing.T) {
	ctx := context.Background()

	// Test with nil config
	_, err := NewJsonSerializer(ctx, nil)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "config required")

	// Test with missing InputTypes config
	_, err = NewJsonSerializer(ctx, &SerializationConfig{})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "InputTypes is required")

	// Test with valid config
	validConfig := &SerializationConfig{
		InputTypes: map[string]*vo.TypeInfo{
			"testKey": {Type: "string"},
		},
	}
	processor, err := NewJsonSerializer(ctx, validConfig)
	assert.NoError(t, err)
	assert.NotNil(t, processor)
}

func TestJsonSerialize_Invoke(t *testing.T) {
	ctx := context.Background()
	config := &SerializationConfig{
		InputTypes: map[string]*vo.TypeInfo{
			"stringKey": {Type: "string"},
			"intKey":    {Type: "integer"},
			"boolKey":   {Type: "boolean"},
			"objKey":    {Type: "object"},
		},
	}

	processor, err := NewJsonSerializer(ctx, config)
	assert.NoError(t, err)

	// Test cases
	tests := []struct {
		name      string
		input     map[string]any
		expected  string
		expectErr bool
	}{{
		name: "Test string serialization",
		input: map[string]any{
			"input": "test",
		},
		expected:  `"test"`,
		expectErr: false,
	}, {
		name: "Test integer serialization",
		input: map[string]any{
			"input": 123,
		},
		expected:  `123`,
		expectErr: false,
	}, {
		name: "Test boolean serialization",
		input: map[string]any{
			"input": true,
		},
		expected:  `true`,
		expectErr: false,
	}, {
		name: "Test object serialization",
		input: map[string]any{
			"input": map[string]any{
				"nestedKey": "nestedValue",
			},
		},
		expected:  `{"nestedKey":"nestedValue"}`,
		expectErr: false,
	}, {
		name:      "Test nil input",
		input:     nil,
		expected:  "",
		expectErr: true,
	}, {
		name: "Test special character handling",
		input: map[string]any{
			"input": "\"test\"\nwith\twhitespace",
		},
		expected:  `"\"test\"\nwith\twhitespace"`,
		expectErr: false,
	}}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := processor.Invoke(ctx, tt.input)

			if tt.expectErr {
				assert.Error(t, err)
				return
			}

			assert.NoError(t, err)
			assert.Contains(t, result, OutputKeySerialization)

			jsonStr, ok := result[OutputKeySerialization].(string)
			assert.True(t, ok, "The output should be of type string")

			assert.JSONEq(t, tt.expected, jsonStr)
		})
	}
}
