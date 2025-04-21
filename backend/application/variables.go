package application

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type VariableApplicationService struct{}

var VariableSVC = VariableApplicationService{}

func (v *VariableApplicationService) GetSysVariableConf(ctx context.Context, req *kvmemory.GetSysVariableConfRequest) (*kvmemory.GetSysVariableConfResponse, error) {
	vars := variablesDomainSVC.GetSysVariableConf(ctx)

	return &kvmemory.GetSysVariableConfResponse{
		Conf:      vars.ToVariableInfos(),
		GroupConf: vars.ToGroupVariableInfos(),
	}, nil
}

func (v *VariableApplicationService) GetProjectVariableList(ctx context.Context, req *project_memory.GetProjectVariableListReq) (*project_memory.GetProjectVariableListResp, error) {
	// TODO:  后面再确认这个鉴权要不要
	// GetProjectKvMemoryHandler - checkParamsAndParams
	// CheckResourceOperatePermissionV2  鉴权

	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	version := ""
	if req.Version != 0 {
		version = fmt.Sprintf("%d", req.Version)
	}

	data, err := variablesDomainSVC.GetProjectVariableList(ctx, req.ProjectID, version)
	if err != nil {
		return nil, err
	}

	return &project_memory.GetProjectVariableListResp{
		VariableList: data.Variables,
		CanEdit:      *uid == req.UserID, // TODO: 协同编辑的用户也要判断
	}, nil
}

func (v *VariableApplicationService) UpdateProjectVariable(ctx context.Context, req project_memory.UpdateProjectVariableReq) (*project_memory.UpdateProjectVariableResp, error) {
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.UserID != *uid {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "uid permission denied"))
	}

	list := req.VariableList
	sysVars := variablesDomainSVC.GetSysVariableConf(ctx).ToVariables()

	key2Var := make(map[string]*project_memory.Variable)
	for _, v := range req.VariableList {
		key2Var[v.Keyword] = v
	}

	for _, v := range sysVars {
		if key2Var[v.Keyword] == nil {
			list = append(list, v)
		} else {
			if key2Var[v.Keyword].DefaultValue != v.DefaultValue ||
				key2Var[v.Keyword].VariableType != v.VariableType {
				return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "can not update system variable"))
			}
		}
	}

	for _, vv := range list {
		if vv.Channel == project_memory.VariableChannel_APP {
			err := v.checkAppVariableSchema(ctx, nil, vv.Schema)
			if err != nil {
				return nil, err
			}
		}
	}

	// TODO: authz.ActionAndResource CheckResourceOperatePermissionV2

	err := variablesDomainSVC.UpsertProjectMeta(ctx, req.ProjectID, "", req.UserID, entity.NewVariables(list))
	if err != nil {
		return nil, err
	}

	return &project_memory.UpdateProjectVariableResp{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (v *VariableApplicationService) checkAppVariableSchema(ctx context.Context, schemaObj *schemaStruct, schema string) error {
	if len(schema) == 0 && schemaObj == nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema is nil"))
	} else if schemaObj == nil {
		schemaObj = &schemaStruct{}
		err := json.Unmarshal([]byte(schema), schemaObj)
		if err != nil {
			return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
		}
	}

	if !schemaObj.NameValidate() {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("name(%s) is invalid", schemaObj.Name)))
	}

	if schemaObj.Type == "object" {
		return v.checkSchemaObj(ctx, schemaObj.Schema)
	} else if schemaObj.Type == "array" {
		return v.checkSchemaArray(ctx, schemaObj.Schema)
	}

	return nil
}

func (v *VariableApplicationService) checkSchemaObj(ctx context.Context, schema []byte) error {
	schemas := make([]*schemaStruct, 0)
	err := json.Unmarshal(schema, &schemas)
	if err != nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", "schema array content json invalid"))
	}

	for _, schemaObj := range schemas {
		if err := v.checkAppVariableSchema(ctx, schemaObj, ""); err != nil {
			return err
		}
	}

	return nil
}

func (v *VariableApplicationService) checkSchemaArray(ctx context.Context, schema []byte) error {
	schemaObj := schemaStruct{}
	err := json.Unmarshal(schema, &schemaObj)
	if err != nil {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", err.Error()))
	}

	if !schemaObj.NameValidate() {
		return errorx.New(errno.ErrUpdateVariableSchemaCode, errorx.KV("msg", fmt.Sprintf("name(%s) is invalid", schemaObj.Name)))
	}

	return v.checkAppVariableSchema(ctx, nil, string(schemaObj.Schema))
}

type schemaStruct struct {
	Type   string          `json:"type,omitempty"`
	Name   string          `json:"name,omitempty"`
	Schema json.RawMessage `json:"schema,omitempty"`
}

func (s *schemaStruct) NameValidate() bool {
	identifier := s.Name

	reservedWords := map[string]bool{
		"true": true, "false": true, "and": true, "AND": true,
		"or": true, "OR": true, "not": true, "NOT": true,
		"null": true, "nil": true, "If": true, "Switch": true,
	}

	if reservedWords[identifier] {
		return false
	}

	// 检查是否符合后面的部分正则规则
	pattern := `^[a-zA-Z_][a-zA-Z_$0-9]*$`
	match, _ := regexp.MatchString(pattern, identifier)

	return match
}
