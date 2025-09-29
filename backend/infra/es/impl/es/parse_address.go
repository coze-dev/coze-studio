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

package es

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func parseClusterEndpoints(address string) ([]string, error) {
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

func getEnvDefaultIntSetting(envVar, defaultValue string) string {
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
