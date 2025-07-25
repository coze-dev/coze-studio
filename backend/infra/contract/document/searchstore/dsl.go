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

package searchstore

import "fmt"

type DSL struct {
	Op    Op
	Field string
	Value interface{} // builtin types / []*DSL
}

type Op string

const (
	OpEq   Op = "eq"
	OpNe   Op = "ne"
	OpLike Op = "like"
	OpIn   Op = "in"

	OpAnd Op = "and"
	OpOr  Op = "or"
)

func (d *DSL) DSL() map[string]any {
	return map[string]any{"dsl": d}
}

func LoadDSL(src map[string]any) (*DSL, error) {
	if src == nil {
		return nil, nil
	}

	dsl, ok := src["dsl"].(*DSL)
	if !ok {
		return nil, fmt.Errorf("load dsl failed")
	}

	return dsl, nil
}
