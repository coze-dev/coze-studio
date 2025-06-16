package goutil

import (
	"os"
	"path/filepath"

	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func GetPythonFilePath(fileName string) string {
	cwd, err := os.Getwd()
	if err != nil {
		logs.Warnf("[GetPythonFilePath] Failed to get current working directory: %v", err)
		return fileName
	}

	return filepath.Join(cwd, fileName)
}

func GetPython3Path() string {
	cwd, err := os.Getwd()
	if err != nil {
		logs.Warnf("[GetPython3Path] Failed to get current working directory: %v", err)
		return ".venv/bin/python3"
	}

	return filepath.Join(cwd, ".venv/bin/python3")
}
