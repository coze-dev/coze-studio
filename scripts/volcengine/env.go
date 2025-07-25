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

package main

import (
	"fmt"
	"os"
	"strings"
)

func updateEnvVarInFile(key, newValue string) {
	oldValue := os.Getenv(key)
	if len(oldValue) > 0 {
		return
	}

	filePath := ".env"
	input, err := os.ReadFile(filePath)
	if err != nil {
		panic(fmt.Errorf("can not read file %s: %w", ".env", err))
	}

	lines := strings.Split(string(input), "\n")
	found := false

	for i, line := range lines {
		trimmedLine := strings.TrimSpace(line)

		var prefix string
		if strings.HasPrefix(trimmedLine, "export ") {
			prefix = "export "
			trimmedLine = strings.TrimPrefix(trimmedLine, "export ")
		}

		parts := strings.SplitN(trimmedLine, "=", 2)
		if len(parts) == 2 && parts[0] == key {
			lines[i] = fmt.Sprintf(`%s%s="%s"`, prefix, key, newValue)
			found = true
			break
		}
	}

	if !found {
		panic(fmt.Errorf("can not find var %s in file %s", key, filePath))
	}

	output := strings.Join(lines, "\n")
	err = os.WriteFile(filePath, []byte(output), 0o644)
	if err != nil {
		panic(fmt.Errorf("can not write file %s: %w", filePath, err))
	}
}
