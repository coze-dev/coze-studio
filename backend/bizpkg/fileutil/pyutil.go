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

package fileutil

import (
	"os"
	"path/filepath"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
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

	filePath := filepath.Join(cwd, ".venv/bin/python3")
	if _, err := os.Stat(filePath); err == nil {
		return filePath
	}

	return "python3" // use system python3
}
