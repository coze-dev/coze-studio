package compose

import (
	"fmt"
	"strings"

	"strconv"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/compose"

	crossdatabase "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/httprequester"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes/selector"
)

type SelectorCallbackInput = []*SelectorBranch

type SelectorCallbackField struct {
	Key     string         `json:"key"`
	Type    vo.DataType    `json:"type"`
	Value   any            `json:"value"`
	VarType *variable.Type `json:"var_type,omitempty"`
}

type SelectorCondition struct {
	Left     SelectorCallbackField  `json:"left"`
	Operator vo.OperatorType        `json:"operator"`
	Right    *SelectorCallbackField `json:"right"`
}

type SelectorBranch struct {
	Conditions []*SelectorCondition `json:"conditions"`
	Logic      vo.LogicType         `json:"logic"`
	Name       string               `json:"name"`
}

func (s *NodeSchema) ToSelectorCallbackInput(in map[string]any, sc *WorkflowSchema) (map[string]any, error) {
	config := s.Configs.([]*selector.OneClauseSchema)
	count := len(config)

	output := make([]*SelectorBranch, count)

	for _, source := range s.InputSources {
		targetPath := source.Path
		if len(targetPath) == 2 {
			indexStr := targetPath[0]
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				return nil, err
			}

			branch := output[index]
			if branch == nil {
				output[index] = &SelectorBranch{
					Conditions: []*SelectorCondition{
						{
							Operator: config[index].Single.ToCanvasOperatorType(),
						},
					},
					Logic: selector.ClauseRelationAND.ToVOLogicType(),
				}
			}

			if targetPath[1] == selector.LeftKey {
				leftV, ok := nodes.TakeMapValue(in, targetPath)
				if !ok {
					return nil, fmt.Errorf("failed to take left value of %s", targetPath)
				}
				if source.Source.Ref.VariableType != nil { // TODO: double check format for variables, including intermediate vars
					output[index].Conditions[0].Left = SelectorCallbackField{
						Key:     strings.Join(source.Source.Ref.FromPath, "."),
						Type:    s.InputTypes[targetPath[0]].Properties[targetPath[1]].Type,
						VarType: source.Source.Ref.VariableType,
					}
				} else {
					output[index].Conditions[0].Left = SelectorCallbackField{
						Key:     sc.GetNode(source.Source.Ref.FromNodeKey).Name + "." + strings.Join(source.Source.Ref.FromPath, "."),
						Type:    s.InputTypes[targetPath[0]].Properties[targetPath[1]].Type,
						Value:   leftV,
						VarType: source.Source.Ref.VariableType,
					}
				}
			} else if targetPath[1] == selector.RightKey {
				rightV, ok := nodes.TakeMapValue(in, targetPath)
				if !ok {
					return nil, fmt.Errorf("failed to take right value of %s", targetPath)
				}
				output[index].Conditions[0].Right = &SelectorCallbackField{
					Type:  s.InputTypes[targetPath[0]].Properties[targetPath[1]].Type,
					Value: rightV,
				}

				if source.Source.Ref != nil {
					if source.Source.Ref.VariableType != nil {
						output[index].Conditions[0].Right.Key = strings.Join(source.Source.Ref.FromPath, ".")
						output[index].Conditions[0].Right.VarType = source.Source.Ref.VariableType
					} else {
						output[index].Conditions[0].Right.Key = sc.GetNode(source.Source.Ref.FromNodeKey).Name + "." + strings.Join(source.Source.Ref.FromPath, ".")
					}
				}
			}
		} else if len(targetPath) == 3 {
			indexStr := targetPath[0]
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				return nil, err
			}

			multi := config[index].Multi

			branch := output[index]
			if branch == nil {
				output[index] = &SelectorBranch{
					Conditions: make([]*SelectorCondition, len(multi.Clauses)),
					Logic:      multi.Relation.ToVOLogicType(),
				}
			}

			for j := range multi.Clauses {
				if output[index].Conditions[j] == nil {
					output[index].Conditions[j] = &SelectorCondition{
						Operator: multi.Clauses[j].ToCanvasOperatorType(),
					}
				}

				if targetPath[2] == selector.LeftKey {
					leftV, ok := nodes.TakeMapValue(in, targetPath)
					if !ok {
						return nil, fmt.Errorf("failed to take left value of %s", targetPath)
					}
					output[index].Conditions[j].Left = SelectorCallbackField{
						Key:     sc.GetNode(source.Source.Ref.FromNodeKey).Name + "." + strings.Join(source.Source.Ref.FromPath, "."),
						Type:    s.InputTypes[targetPath[0]].Properties[targetPath[1]].Properties[targetPath[2]].Type,
						Value:   leftV,
						VarType: source.Source.Ref.VariableType,
					}
				} else if targetPath[2] == selector.RightKey {
					rightV, ok := nodes.TakeMapValue(in, targetPath)
					if !ok {
						return nil, fmt.Errorf("failed to take right value of %s", targetPath)
					}
					output[index].Conditions[j].Right = &SelectorCallbackField{
						Type:  s.InputTypes[targetPath[0]].Properties[targetPath[1]].Properties[targetPath[2]].Type,
						Value: rightV,
					}
					if source.Source.Ref != nil {
						output[index].Conditions[0].Right.Key = sc.GetNode(source.Source.Ref.FromNodeKey).Name + "." + strings.Join(source.Source.Ref.FromPath, ".")
						output[index].Conditions[j].Right.VarType = source.Source.Ref.VariableType
					}
				}
			}
		}
	}

	return map[string]any{"branches": output}, nil
}

func (s *NodeSchema) ToSelectorCallbackOutput(out int) (map[string]any, error) {
	count := len(s.Configs.([]*selector.OneClauseSchema))
	if out == count {
		return map[string]any{"result": "pass to else branch"}, nil
	}

	if out >= 0 && out < count {
		return map[string]any{"result": fmt.Sprintf("pass to condition %d branch", out+1)}, nil
	}

	return nil, fmt.Errorf("out of range: %d", out)
}

func (s *NodeSchema) ToDatabaseInsertCallbackInput(databaseID int64, input map[string]any) (map[string]any, error) {

	fs, ok := nodes.TakeMapValue(input, compose.FieldPath{"Fields"})
	if !ok {
		return nil, fmt.Errorf("failed to take right value of %s", compose.FieldPath{"Fields"})
	}

	result := make(map[string]any)
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}

	type FieldInfo struct {
		FieldID    string `json:"fieldId"`
		FieldValue any    `json:"fieldValue"`
	}

	fieldInfo := make([]*FieldInfo, 0)
	for k, v := range fs.(map[string]any) {
		fieldInfo = append(fieldInfo, &FieldInfo{
			FieldID:    k,
			FieldValue: v,
		})
	}
	result["insertParam"] = map[string]any{
		"fieldInfo": fieldInfo,
	}

	return result, nil

}

func (s *NodeSchema) ToDatabaseUpdateCallbackInput(databaseID int64, inventory *database.UpdateInventory) (map[string]any, error) {
	result := make(map[string]any)
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["updateParam"] = map[string]any{}

	condition, err := convertToCondition(inventory.ConditionGroup)
	if err != nil {
		return nil, err
	}
	type FieldInfo struct {
		fieldID    string
		fieldValue any
	}

	fieldInfo := make([]FieldInfo, 0)
	for k, v := range inventory.Fields {
		fieldInfo = append(fieldInfo, FieldInfo{
			fieldID:    k,
			fieldValue: v,
		})
	}

	result["updateParam"] = map[string]any{
		"condition": condition,
		"fieldInfo": fieldInfo,
	}
	return result, nil

}

func (s *NodeSchema) ToDatabaseQueryCallbackInput(config *database.QueryConfig, conditionGroup *crossdatabase.ConditionGroup) (map[string]any, error) {
	result := make(map[string]any)

	databaseID := config.DatabaseInfoID
	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["selectParam"] = map[string]any{}

	condition, err := convertToCondition(conditionGroup)
	if err != nil {
		return nil, err
	}
	type Field struct {
		FieldID    string `json:"fieldId"`
		IsDistinct bool   `json:"isDistinct"`
	}
	fieldList := make([]Field, 0, len(config.QueryFields))
	for _, f := range config.QueryFields {
		fieldList = append(fieldList, Field{FieldID: f})
	}
	type Order struct {
		FieldID string `json:"fieldId"`
		IsAsc   bool   `json:"isAsc"`
	}

	OrderList := make([]Order, 0)
	for _, c := range config.OrderClauses {
		OrderList = append(OrderList, Order{
			FieldID: c.FieldID,
			IsAsc:   c.IsAsc,
		})
	}
	result["selectParam"] = map[string]any{
		"condition":   condition,
		"fieldList":   fieldList,
		"limit":       config.Limit,
		"orderByList": OrderList,
	}

	return result, nil

}

func (s *NodeSchema) ToDatabaseDeleteCallbackInput(databaseID int64, conditionGroup *crossdatabase.ConditionGroup) (map[string]any, error) {
	result := make(map[string]any)

	result["databaseInfoList"] = []string{fmt.Sprintf("%d", databaseID)}
	result["deleteParam"] = map[string]any{}

	condition, err := convertToCondition(conditionGroup)
	if err != nil {
		return nil, err
	}
	type Field struct {
		FieldID    string `json:"fieldId"`
		IsDistinct bool   `json:"isDistinct"`
	}
	result["deleteParam"] = map[string]any{
		"condition": condition}

	return result, nil

}

func (s *NodeSchema) ToHttpRequesterCallbackInput(config *httprequester.Config, input map[string]any) (map[string]any, error) {
	var (
		request = &httprequester.Request{}
	)
	bs, _ := sonic.Marshal(input)
	if err := sonic.Unmarshal(bs, request); err != nil {
		return nil, err
	}

	result := make(map[string]any)
	result["method"] = config.Method

	url, err := nodes.Jinja2TemplateRender(config.URLConfig.Tpl, request.URLVars)
	if err != nil {
		return nil, err
	}
	result["url"] = url

	params := make(map[string]any, len(request.Params))
	for k, v := range request.Params {
		params[k] = v
	}
	result["param"] = params

	headers := make(map[string]any, len(request.Headers))
	for k, v := range request.Headers {
		headers[k] = v
	}
	result["header"] = headers
	result["auth"] = nil
	if config.AuthConfig != nil {
		if config.AuthConfig.Type == httprequester.Custom {
			result["auth"] = map[string]interface{}{
				"Key":   request.Authentication.Key,
				"Value": request.Authentication.Value,
			}
		} else if config.AuthConfig.Type == httprequester.BearToken {
			result["auth"] = map[string]interface{}{
				"token": request.Authentication.Token,
			}
		}
	}

	result["body"] = nil
	switch config.BodyConfig.BodyType {
	case httprequester.BodyTypeJSON:
		js, err := nodes.Jinja2TemplateRender(config.BodyConfig.TextJsonConfig.Tpl, request.JsonVars)
		if err != nil {
			return nil, err
		}
		ret := make(map[string]any)
		err = sonic.Unmarshal([]byte(js), &ret)
		if err != nil {
			return nil, err
		}
		result["body"] = ret
	case httprequester.BodyTypeRawText:
		tx, err := nodes.Jinja2TemplateRender(config.BodyConfig.TextPlainConfig.Tpl, request.TextPlainVars)
		if err != nil {

			return nil, err
		}
		result["body"] = tx
	case httprequester.BodyTypeFormData:
		result["body"] = request.FormDataVars
	case httprequester.BodyTypeFormURLEncoded:
		result["body"] = request.FormURLEncodedVars
	case httprequester.BodyTypeBinary:
		result["body"] = request.FileURL

	}
	return result, nil
}

func convertToOperation(Op crossdatabase.Operator) (string, error) {
	switch Op {
	case crossdatabase.OperatorEqual:
		return "EQUAL", nil
	case crossdatabase.OperatorNotEqual:
		return "NOT_EQUAL", nil
	case crossdatabase.OperatorGreater:
		return "GREATER_THAN", nil
	case crossdatabase.OperatorLesser:
		return "LESS_THAN", nil
	case crossdatabase.OperatorGreaterOrEqual:
		return "GREATER_EQUAL", nil
	case crossdatabase.OperatorLesserOrEqual:
		return "LESS_EQUAL", nil
	case crossdatabase.OperatorIn:
		return "IN", nil
	case crossdatabase.OperatorNotIn:
		return "NOT_IN", nil
	case crossdatabase.OperatorIsNull:
		return "IS_NULL", nil
	case crossdatabase.OperatorIsNotNull:
		return "IS_NOT_NULL", nil
	case crossdatabase.OperatorLike:
		return "LIKE", nil
	case crossdatabase.OperatorNotLike:
		return "NOT LIKE", nil
	}
	return "", fmt.Errorf("not a valid database Operator")

}
func convertToLogic(rel crossdatabase.ClauseRelation) (string, error) {
	switch rel {
	case crossdatabase.ClauseRelationOR:
		return "OR", nil
	case crossdatabase.ClauseRelationAND:
		return "AND", nil
	default:
		return "", fmt.Errorf("unknown clause relation %v", rel)

	}
}

type ConditionItem struct {
	Left      string `json:"left"`
	Operation string `json:"operation"`
	Right     any    `json:"right"`
}
type Condition struct {
	ConditionList []ConditionItem `json:"conditionList"`
	Logic         string          `json:"logic"`
}

func convertToCondition(conditionGroup *crossdatabase.ConditionGroup) (*Condition, error) {
	logic, err := convertToLogic(conditionGroup.Relation)
	if err != nil {
		return nil, err
	}
	condition := &Condition{
		ConditionList: make([]ConditionItem, 0),
		Logic:         logic,
	}
	for _, c := range conditionGroup.Conditions {
		op, err := convertToOperation(c.Operator)
		if err != nil {
			return nil, fmt.Errorf("invalid operator: %s", c.Operator)
		}
		condition.ConditionList = append(condition.ConditionList, ConditionItem{
			Left:      c.Left,
			Operation: op,
			Right:     c.Right,
		})

	}
	return condition, nil
}
