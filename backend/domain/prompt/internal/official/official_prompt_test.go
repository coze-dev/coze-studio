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

package official

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

var rawJsonBody = `{
    "resource_list": [
    ]
}`

func TestUnescapeJSON(t *testing.T) {
	var jsonBody map[string]any
	err := json.Unmarshal([]byte(rawJsonBody), &jsonBody)
	assert.NoError(t, err)

	jsonArr := jsonBody["resource_list"].([]any)

	for idx, elem := range jsonArr {
		fmt.Printf("--------------------: %v\n", idx)
		fmt.Printf("%s\n", elem.(map[string]any)["prompt_text"])
		fmt.Printf("--------------------: %v\n", idx)
		fmt.Printf("\n")
	}
}
