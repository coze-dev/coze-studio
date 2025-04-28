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
