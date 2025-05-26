package builtin

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
	"path"
	"strings"
	"time"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
)

const baseWord = "1Aa2Bb3Cc4Dd5Ee6Ff7Gg8Hh9Ii0JjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz"
const knowledgePrefix = "BIZ_KNOWLEDGE"
const imgSrcFormat = `<img src="" data-tos-key="%s">`

func createSecret(uid int64, fileType string) string {
	num := 10
	input := fmt.Sprintf("upload_%d_Ma*9)fhi_%d_gou_%s_rand_%d", uid, time.Now().Unix(), fileType, rand.Intn(100000))
	// 做md5，取前20个,// mapIntToBase62 把数字映射到 Base62
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
func GetExtension(uri string) string {
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
