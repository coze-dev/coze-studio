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

package coderunner

import "context"

type Language string

const (
	Python     Language = "Python"
	JavaScript Language = "JavaScript"
)

type RunRequest struct {
	Code     string
	Params   map[string]any
	Language Language
}
type RunResponse struct {
	Result map[string]any
}

//go:generate mockgen -destination  ../../internal/mock/domain/workflow/crossdomain/code/code_mock.go  --package code  -source code.go
type Runner interface {
	Run(ctx context.Context, request *RunRequest) (*RunResponse, error)
}
