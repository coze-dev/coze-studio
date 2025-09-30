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

package envkey

import (
	"fmt"
	"os"
	"strconv"
)

func GetIntD(key string, defaultValue int) int {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}

	i, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return defaultValue
	}

	return int(i)
}

func GetI32D(key string, defaultValue int32) int32 {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}

	i, err := strconv.ParseInt(v, 10, 32)
	if err != nil {
		return defaultValue
	}

	return int32(i)
}

func GetI64(key string) (int64, error) {
	v := os.Getenv(key)
	if v == "" {
		return 0, fmt.Errorf("env %s is empty", key)
	}

	i, err := strconv.ParseInt(v, 10, 64)
	if err != nil {
		return 0, err
	}

	return i, nil
}

func GetI64D(key string, defaultValue int64) int64 {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}

	i, err := strconv.ParseInt(v, 10, 32)
	if err != nil {
		return defaultValue
	}

	return i
}

func GetString(key string) string {
	return os.Getenv(key)
}

func GetStringD(key string, defaultValue string) string {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	return v
}

func GetBoolD(key string, defaultValue bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}

	b, err := strconv.ParseBool(v)
	if err != nil {
		return defaultValue
	}

	return b
}
