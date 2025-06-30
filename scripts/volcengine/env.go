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
