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

package database

import (
	"fmt"

	einoCompose "github.com/cloudwego/eino/compose"

	database "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
)

func setDatabaseInputsForNodeSchema(n *vo.Node, ns *schema.NodeSchema) (err error) {
	selectParam := n.Data.Inputs.SelectParam
	if selectParam != nil {
		err = applyDBConditionToSchema(ns, selectParam.Condition, n.Parent())
		if err != nil {
			return err
		}
	}

	insertParam := n.Data.Inputs.InsertParam
	if insertParam != nil {
		err = applyInsetFieldInfoToSchema(ns, insertParam.FieldInfo, n.Parent())
		if err != nil {
			return err
		}
	}

	deleteParam := n.Data.Inputs.DeleteParam
	if deleteParam != nil {
		err = applyDBConditionToSchema(ns, &deleteParam.Condition, n.Parent())
		if err != nil {
			return err
		}
	}

	updateParam := n.Data.Inputs.UpdateParam
	if updateParam != nil {
		err = applyDBConditionToSchema(ns, &updateParam.Condition, n.Parent())
		if err != nil {
			return err
		}
		err = applyInsetFieldInfoToSchema(ns, updateParam.FieldInfo, n.Parent())
		if err != nil {
			return err
		}
	}

	return nil
}

func applyDBConditionToSchema(ns *schema.NodeSchema, condition *vo.DBCondition, parentNode *vo.Node) error {
	if condition.ConditionList == nil {
		return nil
	}

	for idx, params := range condition.ConditionList {
		var right *vo.Param
		for _, param := range params {
			if param == nil {
				continue
			}
			if param.Name == "right" {
				right = param
				break
			}
		}

		if right == nil {
			continue
		}
		name := fmt.Sprintf("__condition_right_%d", idx)
		tInfo, err := convert.CanvasBlockInputToTypeInfo(right.Input)
		if err != nil {
			return err
		}
		ns.SetInputType(name, tInfo)
		sources, err := convert.CanvasBlockInputToFieldInfo(right.Input, einoCompose.FieldPath{name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}

	return nil
}

func applyInsetFieldInfoToSchema(ns *schema.NodeSchema, fieldInfo [][]*vo.Param, parentNode *vo.Node) error {
	if len(fieldInfo) == 0 {
		return nil
	}

	for _, params := range fieldInfo {
		// Each FieldInfo is list params, containing two elements.
		// The first is to set the name of the field and the second is the corresponding value.
		p0 := params[0]
		p1 := params[1]
		name := p0.Input.Value.Content.(string) // must string type
		tInfo, err := convert.CanvasBlockInputToTypeInfo(p1.Input)
		if err != nil {
			return err
		}
		name = "__setting_field_" + name
		ns.SetInputType(name, tInfo)
		sources, err := convert.CanvasBlockInputToFieldInfo(p1.Input, einoCompose.FieldPath{name}, parentNode)
		if err != nil {
			return err
		}
		ns.AddInputSource(sources...)
	}

	return nil
}

func buildClauseGroupFromCondition(condition *vo.DBCondition) (*database.ClauseGroup, error) {
	clauseGroup := &database.ClauseGroup{}
	if len(condition.ConditionList) == 1 {
		params := condition.ConditionList[0]
		clause, err := buildClauseFromParams(params)
		if err != nil {
			return nil, err
		}
		clauseGroup.Single = clause
	} else {
		relation, err := convertLogicTypeToRelation(condition.Logic)
		if err != nil {
			return nil, err
		}
		clauseGroup.Multi = &database.MultiClause{
			Clauses:  make([]*database.Clause, 0, len(condition.ConditionList)),
			Relation: relation,
		}
		for i := range condition.ConditionList {
			params := condition.ConditionList[i]
			clause, err := buildClauseFromParams(params)
			if err != nil {
				return nil, err
			}
			clauseGroup.Multi.Clauses = append(clauseGroup.Multi.Clauses, clause)
		}
	}

	return clauseGroup, nil
}

func buildClauseFromParams(params []*vo.Param) (*database.Clause, error) {
	var left, operation *vo.Param
	for _, p := range params {
		if p == nil {
			continue
		}
		if p.Name == "left" {
			left = p
			continue
		}
		if p.Name == "operation" {
			operation = p
			continue
		}
	}
	if left == nil {
		return nil, fmt.Errorf("left clause is required")
	}
	if operation == nil {
		return nil, fmt.Errorf("operation clause is required")
	}
	operator, err := operationToOperator(operation.Input.Value.Content.(string))
	if err != nil {
		return nil, err
	}
	clause := &database.Clause{
		Left:     left.Input.Value.Content.(string),
		Operator: operator,
	}

	return clause, nil
}

func convertLogicTypeToRelation(logicType vo.DatabaseLogicType) (database.ClauseRelation, error) {
	switch logicType {
	case vo.DatabaseLogicAnd:
		return database.ClauseRelationAND, nil
	case vo.DatabaseLogicOr:
		return database.ClauseRelationOR, nil
	default:
		return "", fmt.Errorf("logic type %v is invalid", logicType)
	}
}

func operationToOperator(s string) (database.Operator, error) {
	switch s {
	case "EQUAL":
		return database.OperatorEqual, nil
	case "NOT_EQUAL":
		return database.OperatorNotEqual, nil
	case "GREATER_THAN":
		return database.OperatorGreater, nil
	case "LESS_THAN":
		return database.OperatorLesser, nil
	case "GREATER_EQUAL":
		return database.OperatorGreaterOrEqual, nil
	case "LESS_EQUAL":
		return database.OperatorLesserOrEqual, nil
	case "IN":
		return database.OperatorIn, nil
	case "NOT_IN":
		return database.OperatorNotIn, nil
	case "IS_NULL":
		return database.OperatorIsNull, nil
	case "IS_NOT_NULL":
		return database.OperatorIsNotNull, nil
	case "LIKE":
		return database.OperatorLike, nil
	case "NOT_LIKE":
		return database.OperatorNotLike, nil
	}
	return "", fmt.Errorf("not a valid Operation string")
}
