package plugin

import (
	"os"
	"path/filepath"
)

func InitConfig() (err error) {
	basePath := filepath.Join(os.Getenv("PWD"), "resources", "conf")

	err = loadOfficialPluginMeta(basePath)
	if err != nil {
		return err
	}

	return nil
}
