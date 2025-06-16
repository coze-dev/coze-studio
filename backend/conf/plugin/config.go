package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func InitConfig(ctx context.Context) (err error) {
	cwd, err := os.Getwd()
	if err != nil {
		logs.Warnf("[InitConfig] Failed to get current working directory: %v", err)
		cwd = os.Getenv("PWD")
	}

	basePath := path.Join(cwd, "resources", "conf", "plugin")

	err = loadPluginProductMeta(ctx, basePath)
	if err != nil {
		return err
	}

	err = loadOAuthSchema(ctx, basePath)
	if err != nil {
		return err
	}

	return nil
}

var oauthSchema string

func GetOAuthSchema() string {
	return oauthSchema
}

func loadOAuthSchema(ctx context.Context, basePath string) (err error) {
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
	return sonic.Unmarshal(data, &js) == nil
}
