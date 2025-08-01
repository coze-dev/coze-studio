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

package builtin

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
	"path"
	"strings"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
)

const baseWord = "1Aa2Bb3Cc4Dd5Ee6Ff7Gg8Hh9Ii0JjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
const knowledgePrefix = "BIZ_KNOWLEDGE"
const imgSrcFormat = `<img src="" data-tos-key="%s">`

func createSecret(uid int64, fileType string) string {
	num := 10
	input := fmt.Sprintf("upload_%d_Ma*9)fhi_%d_gou_%s_rand_%d", uid, time.Now().Unix(), fileType, rand.Intn(100000))
	// Do md5, take the first 20,//mapIntToBase62 map the number to Base62
	hash := sha256.Sum256([]byte(fmt.Sprintf("%s", input)))
	hashString := base64.StdEncoding.EncodeToString(hash[:])
	if len(hashString) > num {
		hashString = hashString[:num]
	}

	result := ""
	for _, char := range hashString {
		index := int(char) % 62
		result += string(baseWord[index])
	}
	return result
}
func getExtension(uri string) string {
	if uri == "" {
		return ""
	}
	fileExtension := path.Base(uri)
	ext := path.Ext(fileExtension)
	if ext != "" {
		return strings.TrimPrefix(ext, ".")
	}
	return ""
}

func getCreatorIDFromExtraMeta(extraMeta map[string]any) int64 {
	if extraMeta == nil {
		return 0
	}
	if uid, ok := extraMeta[document.MetaDataKeyCreatorID]; ok {
		if uidInt, ok := uid.(int64); ok {
			return uidInt
		}
	}
	return 0
}
