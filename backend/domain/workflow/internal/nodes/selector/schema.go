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

package selector

import (
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

type ClauseRelation string

const (
	ClauseRelationAND ClauseRelation = "and"
	ClauseRelationOR  ClauseRelation = "or"
)

type Config struct {
	Clauses []*OneClauseSchema `json:"clauses"`
}

type OneClauseSchema struct {
	Single *Operator          `json:"single,omitempty"`
	Multi  *MultiClauseSchema `json:"multi,omitempty"`
}

type MultiClauseSchema struct {
	Clauses  []*Operator    `json:"clauses"`
	Relation ClauseRelation `json:"relation"`
}

func (c ClauseRelation) ToVOLogicType() vo.LogicType {
	if c == ClauseRelationAND {
		return vo.AND
	} else if c == ClauseRelationOR {
		return vo.OR
	}

	panic(fmt.Sprintf("unknown clause relation: %s", c))
}
