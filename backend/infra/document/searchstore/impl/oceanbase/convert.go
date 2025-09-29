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

package oceanbase

import (
	"encoding/json"
	"fmt"
	"math"
	"regexp"
	"strings"
	"unicode"

	"github.com/cloudwego/eino/schema"
)

func TableName(collectionName string) string {
	cleanName := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' {
			return r
		}
		return '_'
	}, collectionName)
	return fmt.Sprintf("vector_%s", strings.ToLower(cleanName))
}

func ExtractContent(doc *schema.Document) string {
	if doc.Content != "" {
		return strings.TrimSpace(doc.Content)
	}
	if doc.MetaData != nil {
		if content, ok := doc.MetaData["content"].(string); ok && content != "" {
			return strings.TrimSpace(content)
		}
		if text, ok := doc.MetaData["text"].(string); ok && text != "" {
			return strings.TrimSpace(text)
		}
	}
	return ""
}

func BuildMetadata(doc *schema.Document) map[string]interface{} {
	metadata := make(map[string]interface{})
	if doc.MetaData != nil {
		for k, v := range doc.MetaData {
			metadata[k] = v
		}
	}
	metadata["document_id"] = doc.ID
	metadata["content"] = doc.Content
	metadata["content_length"] = len(doc.Content)
	return metadata
}

func MetadataToJSON(metadata map[string]interface{}) (string, error) {
	if metadata == nil {
		return "{}", nil
	}
	jsonBytes, err := json.Marshal(metadata)
	if err != nil {
		return "", fmt.Errorf("failed to marshal metadata: %w", err)
	}
	return string(jsonBytes), nil
}

func JSONToMetadata(jsonStr string) (map[string]interface{}, error) {
	if jsonStr == "" {
		return make(map[string]interface{}), nil
	}
	var metadata map[string]interface{}
	if err := json.Unmarshal([]byte(jsonStr), &metadata); err != nil {
		return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
	}
	return metadata, nil
}

func ValidateCollectionName(name string) error {
	if name == "" {
		return fmt.Errorf("collection name cannot be empty")
	}
	if len(name) > maxCollectionNameLength {
		return fmt.Errorf("collection name too long (max %d characters)", maxCollectionNameLength)
	}

	if len(name) > 0 && unicode.IsDigit(rune(name[0])) {
		return fmt.Errorf("collection name cannot start with a digit")
	}

	for _, r := range name {
		if !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-') {
			return fmt.Errorf("collection name contains invalid character: %c", r)
		}
	}

	if isReservedWord(name) {
		return fmt.Errorf("collection name is a reserved word: %s", name)
	}

	return nil
}

func BuildInClause(values []string) string {
	if len(values) == 0 {
		return "()"
	}
	quoted := make([]string, len(values))
	for i, v := range values {
		quoted[i] = fmt.Sprintf("'%s'", v)
	}
	return fmt.Sprintf("(%s)", strings.Join(quoted, ","))
}

func ConvertToFloat32(f64 []float64) []float32 {
	f32 := make([]float32, len(f64))
	for i, v := range f64 {
		f32[i] = float32(v)
	}
	return f32
}

func ConvertToFloat64(f32 []float32) []float64 {
	f64 := make([]float64, len(f32))
	for i, v := range f32 {
		f64[i] = float64(v)
	}
	return f64
}

func SanitizeString(s string) string {
	s = strings.Map(func(r rune) rune {
		if r < 32 || r == 127 {
			return -1
		}
		return r
	}, s)

	s = strings.Join(strings.Fields(s), " ")

	return strings.TrimSpace(s)
}

func TruncateString(s string, maxLength int) string {
	if len(s) <= maxLength {
		return s
	}
	return s[:maxLength-3] + "..."
}

func IsValidVector(vector []float32) error {
	if len(vector) == 0 {
		return fmt.Errorf("vector cannot be empty")
	}
	if len(vector) > maxVectorDimension {
		return fmt.Errorf("vector dimension too large (max %d)", maxVectorDimension)
	}

	for i, v := range vector {
		if v != v { // NaN check
			return fmt.Errorf("vector contains NaN at index %d", i)
		}
	}

	return nil
}

func NormalizeVector(vector []float32) []float32 {
	if len(vector) == 0 {
		return vector
	}

	var sum float32
	for _, v := range vector {
		sum += v * v
	}

	if sum == 0 {
		return vector
	}

	norm := float32(1.0 / math.Sqrt(float64(sum)))
	normalized := make([]float32, len(vector))
	for i, v := range vector {
		normalized[i] = v * norm
	}

	return normalized
}

var reservedWords = map[string]bool{
	"select": true, "from": true, "where": true, "insert": true, "update": true,
	"delete": true, "drop": true, "create": true, "alter": true, "table": true,
	"index": true, "primary": true, "foreign": true, "key": true, "constraint": true,
	"order": true, "by": true, "group": true, "having": true, "union": true,
	"all": true, "distinct": true, "as": true, "in": true, "between": true,
	"like": true, "is": true, "null": true, "not": true, "and": true, "or": true,
	"vector": true, "embedding": true, "collection": true,
}

func isReservedWord(name string) bool {
	return reservedWords[strings.ToLower(name)]
}

func GenerateTableName(collectionName string, suffix string) string {
	baseName := TableName(collectionName)
	if suffix != "" {
		return fmt.Sprintf("%s_%s", baseName, suffix)
	}
	return baseName
}

func ValidateSQLIdentifier(identifier string) error {
	if identifier == "" {
		return fmt.Errorf("SQL identifier cannot be empty")
	}

	if len(identifier) > 64 {
		return fmt.Errorf("SQL identifier too long (max 64 characters)")
	}

	matched, _ := regexp.MatchString(`^[a-zA-Z_][a-zA-Z0-9_]*$`, identifier)
	if !matched {
		return fmt.Errorf("SQL identifier format invalid: %s", identifier)
	}

	return nil
}
