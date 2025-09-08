package parsex

import (
	"fmt"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"os"
	"strconv"
	"strings"
)

// ParseClusterEndpoints 解析 ES /kafka 地址，多个地址用逗号分隔
func ParseClusterEndpoints(address string) ([]string, error) {
	if strings.TrimSpace(address) == "" {
		return nil, fmt.Errorf("endpoints environment variable is required")
	}

	endpoints := strings.Split(address, ",")
	var validEndpoints []string
	uniqueEndpoints := make(map[string]bool, len(endpoints))

	for _, endpoint := range endpoints {
		trimmed := strings.TrimSpace(endpoint)
		if trimmed == "" {
			continue
		}
		if !uniqueEndpoints[trimmed] {
			uniqueEndpoints[trimmed] = true
			validEndpoints = append(validEndpoints, trimmed)
		}
	}

	if len(validEndpoints) == 0 {
		return nil, fmt.Errorf("no valid  endpoints found in: %s", address)
	}

	return validEndpoints, nil
}

// GetEnvDefaultStringSetting 获取环境变量的值，如果不存在或无效则返回默认值
func GetEnvDefaultStringSetting(envVar, defaultValue string) string {
	value := os.Getenv(envVar)
	if value == "" {
		return defaultValue
	}
	if num, err := strconv.Atoi(value); err != nil || num <= 0 {
		logs.Warnf("Invalid %s value: %s, using default: %s", envVar, value, defaultValue)
		return defaultValue
	}
	return value
}
