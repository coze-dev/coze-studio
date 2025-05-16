package plugin

import (
	"encoding/json"
	"fmt"
	"os"
	"path"
)

func InitConfig() (err error) {
	basePath := path.Join(os.Getenv("PWD"), "resources", "conf", "plugin")

	err = loadOfficialPluginMeta(basePath)
	if err != nil {
		return err
	}

	err = loadOAuthSchema(basePath)
	if err != nil {
		return err
	}

	return nil
}

var oauthSchema string

func GetOAuthSchema() string {
	return oauthSchema
}

func loadOAuthSchema(basePath string) (err error) {
	filePath := path.Join(basePath, "common", "oauth_schema.json")
	file, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read file '%s' failed, err=%v", filePath, err)
	}

	if !isValidJSON(file) {
		return fmt.Errorf("invalid json, filePath=%s", filePath)
	}

	oauthSchema = string(file)

	return nil
}

func isValidJSON(data []byte) bool {
	var js json.RawMessage
	return json.Unmarshal(data, &js) == nil
}
