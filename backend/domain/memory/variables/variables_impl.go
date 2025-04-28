package variables

import (
	"context"
	"fmt"
	"sort"
	"time"

	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/kvmemory"
	"code.byted.org/flow/opencoze/backend/api/model/project_memory"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ternary"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

var sysVariableConf []*kvmemory.VariableInfo = []*kvmemory.VariableInfo{
	{
		Key:                  "sys_uuid",
		Description:          "用户唯一ID",
		DefaultValue:         "",
		Example:              "",
		ExtDesc:              "",
		GroupDesc:            "用户请求/授权后系统自动获取的相关数据",
		GroupExtDesc:         "",
		GroupName:            "用户信息",
		Sensitive:            "false",
		CanWrite:             "false",
		MustNotUseInPrompt:   "false",
		EffectiveChannelList: []string{"全渠道"},
	},
	{
		Key:                  "sys_lark_chat_mode",
		Description:          "Bot所在飞书会话类型",
		DefaultValue:         "",
		Example:              "",
		GroupDesc:            "飞书对话和用户信息",
		GroupExtDesc:         "将项目发布到飞书后,以下变量可获取所在飞书对话和对话用户的信息或用来调用飞书开放平台接口",
		ExtDesc:              "枚举值包括“p2p”（私聊）和“group”（群聊）两种，取决于当前bot对话发生在哪种对话中",
		GroupName:            "飞书",
		Sensitive:            "false",
		CanWrite:             "false",
		MustNotUseInPrompt:   "true",
		EffectiveChannelList: []string{"全渠道"},
	},
}

type variablesImpl struct {
	*dal.VariablesDAO
}

func NewService(db *gorm.DB, generator idgen.IDGenerator) Variables {
	dao := dal.NewDAO(db, generator)
	return &variablesImpl{
		VariablesDAO: dao,
	}
}

func (v *variablesImpl) GetSysVariableConf(_ context.Context) entity.SysConfVariables {
	return sysVariableConf
}

func (v *variablesImpl) GetProjectVariablesMeta(ctx context.Context, projectID, version string) (*entity.VariablesMeta, error) {
	return v.GetVariableMeta(ctx, projectID, project_memory.VariableConnector_Project, version)
}

func (v *variablesImpl) UpsertProjectMeta(ctx context.Context, projectID, version string, userID int64, e *entity.VariablesMeta) (int64, error) {
	return v.upsertVariableMeta(ctx, projectID, project_memory.VariableConnector_Project, version, userID, e)
}

func (v *variablesImpl) UpsertBotMeta(ctx context.Context, agentID int64, version string, userID int64, e *entity.VariablesMeta) (int64, error) {
	bizID := fmt.Sprintf("%d", agentID)
	return v.upsertVariableMeta(ctx, bizID, project_memory.VariableConnector_Bot, version, userID, e)
}

func (v *variablesImpl) upsertVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string, userID int64, e *entity.VariablesMeta) (int64, error) {
	// TODO: 机审 rpc.VariableAudit
	meta, err := v.VariablesDAO.GetVariableMeta(ctx, bizID, bizType, version)
	if err != nil {
		return 0, err
	}

	do := &entity.VariablesMeta{
		BizID:     bizID,
		Version:   version,
		CreatorID: int64(userID),
		BizType:   int32(bizType),
		Variables: e.Variables,
	}

	if meta == nil {
		return v.VariablesDAO.CreateVariableMeta(ctx, do, bizType)
	}

	do.ID = meta.ID
	err = v.VariablesDAO.UpdateProjectVariable(ctx, do, bizType)
	if err != nil {
		return 0, err
	}

	return meta.ID, nil
}

func (*variablesImpl) mergeVariableList(_ context.Context, sysVarsList, variablesList []*entity.VariableMeta) *entity.VariablesMeta {
	mergedMap := make(map[string]*entity.VariableMeta)
	for _, sysVar := range sysVarsList {
		mergedMap[sysVar.Keyword] = sysVar
	}

	// 可以覆盖 sysVar
	for _, variable := range variablesList {
		mergedMap[variable.Keyword] = variable
	}

	res := make([]*entity.VariableMeta, 0)
	for _, variable := range mergedMap {
		res = append(res, variable)
	}

	sort.Slice(res, func(i, j int) bool {
		if res[i].Channel == project_memory.VariableChannel_System && !(res[j].Channel == project_memory.VariableChannel_System) {
			return false
		}
		if !(res[i].Channel == project_memory.VariableChannel_System) && res[j].Channel == project_memory.VariableChannel_System {
			return true
		}
		indexI := -1
		indexJ := -1

		for index, s := range sysVarsList {
			if s.Keyword == res[i].Keyword {
				indexI = index
			}
			if s.Keyword == res[j].Keyword {
				indexJ = index
			}
		}

		for index, s := range variablesList {
			if s.Keyword == res[i].Keyword && indexI < 0 {
				indexI = index
			}
			if s.Keyword == res[j].Keyword && indexJ < 0 {
				indexJ = index
			}
		}
		return indexI < indexJ
	})

	return &entity.VariablesMeta{
		Variables: res,
	}
}

func (v *variablesImpl) GetAgentVariableMeta(ctx context.Context, agentID int64, version string) (*entity.VariablesMeta, error) {
	bizID := fmt.Sprintf("%d", agentID)
	return v.GetVariableMeta(ctx, bizID, project_memory.VariableConnector_Bot, version)
}

func (v *variablesImpl) GetVariableMetaByID(ctx context.Context, id int64) (*entity.VariablesMeta, error) {
	do, err := v.VariablesDAO.GetVariableMetaByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if do == nil {
		return nil, nil
	}

	return do, nil
}

func (v *variablesImpl) GetVariableMeta(ctx context.Context, bizID string, bizType project_memory.VariableConnector, version string) (*entity.VariablesMeta, error) {
	data, err := v.VariablesDAO.GetVariableMeta(ctx, bizID, bizType, version)
	if err != nil {
		return nil, err
	}

	sysVarMeta := v.GetSysVariableConf(ctx)
	if bizType == project_memory.VariableConnector_Project {
		sysVarMeta.RemoveLocalChannelVariable()
	}

	sysVarMetaList := sysVarMeta.ToVariables()

	if data == nil {
		return sysVarMetaList, nil
	}

	resVarMetaList := v.mergeVariableList(ctx, sysVarMetaList.Variables, data.Variables)
	resVarMetaList.SetupSchema()
	resVarMetaList.SetupIsReadOnly()

	return resVarMetaList, nil
}

func (v *variablesImpl) DeleteVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string) (err error) {
	// if e.BizType == int32(project_memory.VariableConnector_Project) {
	// 	keywords = v.removeProjectSysVariable(ctx, keywords)
	// } else {
	// 	keywords, err = v.removeAgentSysVariable(ctx, keywords, e.BizID)
	// 	if err != nil {
	// 		return err
	// 	}
	// }

	keywords = v.removeSysVariable(ctx, keywords)

	if len(keywords) == 0 {
		return errorx.New(errno.ErrDeleteVariableCode)
	}

	return v.VariablesDAO.DeleteVariableInstance(ctx, e, keywords)
}

func (v *variablesImpl) removeAgentSysVariable(ctx context.Context, keywords []string, biz_id string) ([]string, error) {
	vars, err := v.GetVariableMeta(ctx, biz_id, project_memory.VariableConnector_Bot, "")
	if err != nil {
		return nil, err
	}

	sysKeywords := make(map[string]bool)
	for _, v := range vars.Variables {
		if v.Channel == project_memory.VariableChannel_System {
			sysKeywords[v.Keyword] = true
		}
	}

	if len(sysKeywords) == 0 {
		return keywords, nil
	}

	filteredKeywords := make([]string, 0)
	for _, v := range keywords {
		if sysKeywords[v] {
			continue
		}
		filteredKeywords = append(filteredKeywords, v)
	}

	return filteredKeywords, nil
}

func (v *variablesImpl) removeSysVariable(ctx context.Context, keywords []string) []string {
	sysConf := v.GetSysVariableConf(ctx)
	sysVarsMap := make(map[string]bool)
	for _, v := range sysConf {
		sysVarsMap[v.Key] = true
	}

	filteredKeywords := make([]string, 0)
	for _, v := range keywords {
		if sysVarsMap[v] {
			continue
		}

		filteredKeywords = append(filteredKeywords, v)
	}

	return filteredKeywords
}

func (v *variablesImpl) GetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, keywords []string, varChannel *project_memory.VariableChannel) ([]*kvmemory.KVItem, error) {
	meta, err := v.GetVariableMeta(ctx, e.BizID, project_memory.VariableConnector(e.BizType), e.Version)
	if err != nil {
		return nil, err
	}

	if varChannel != nil && *varChannel == project_memory.VariableChannel_APP {
		return v.getAppKVItems(ctx, meta)
	}

	meta.RemoveVariableWithChannel(project_memory.VariableChannel_APP) // app can not be set
	meta.RemoveDisableVariable()

	metaKey2Variable := map[string]*entity.VariableMeta{}
	metaKeys := make([]string, 0, len(meta.Variables))
	for _, variable := range meta.Variables {
		if variable.Channel == project_memory.VariableChannel_System {
			continue
		}

		metaKeys = append(metaKeys, variable.Keyword)
		metaKey2Variable[variable.Keyword] = variable
	}

	kvInstances, err := v.VariablesDAO.GetVariableInstances(ctx, e, keywords)
	if err != nil {
		return nil, err
	}

	varBothInMetaAndInstance := map[string]*entity.VariableInstance{}
	for _, v := range kvInstances {
		if _, ok := metaKey2Variable[v.Keyword]; ok {
			varBothInMetaAndInstance[v.Keyword] = v
		}
	}

	newKeywords := ternary.IFElse(len(keywords) > 0, keywords, metaKeys)

	resMemory := make([]*kvmemory.KVItem, 0, len(newKeywords))
	for _, v := range newKeywords {
		if vv, ok := varBothInMetaAndInstance[v]; ok {
			resMemory = append(resMemory, &kvmemory.KVItem{
				Keyword:    vv.Keyword,
				Value:      vv.Content,
				CreateTime: vv.CreatedAt,
				UpdateTime: vv.UpdatedAt,
			})
		} else if vv, ok := metaKey2Variable[v]; ok { // only in meta
			now := time.Now()
			resMemory = append(resMemory, &kvmemory.KVItem{
				Keyword:    vv.Keyword,
				Value:      vv.DefaultValue,
				CreateTime: now.Unix(),
				UpdateTime: now.Unix(),
			})
		}
	}

	sysKVItems, err := v.getSysKVItems(ctx, meta, e)

	res := v.mergeKVItem(sysKVItems, resMemory)
	res = v.sortKVItem(res, meta)

	return res, nil
}

func (v *variablesImpl) getAppKVItems(_ context.Context, meta *entity.VariablesMeta) ([]*kvmemory.KVItem, error) {
	resMemory := []*kvmemory.KVItem{}

	for _, v := range meta.Variables {
		if v.Channel == project_memory.VariableChannel_APP {
			resMemory = append(resMemory, &kvmemory.KVItem{
				Keyword: v.Keyword,
				Value:   v.DefaultValue,
				Schema:  v.Schema,
			})
		}
	}

	return resMemory, nil
}

func (v *variablesImpl) getSysKVItems(ctx context.Context, meta *entity.VariablesMeta, e *entity.UserVariableMeta) ([]*kvmemory.KVItem, error) {
	sysKVItems := []*kvmemory.KVItem{}

	for _, variable := range meta.Variables {
		if variable.Channel == project_memory.VariableChannel_System {
			sysKV, err := e.GenSystemKV(ctx, variable.Keyword)
			if err != nil {
				return nil, err
			}

			if sysKV != nil {
				sysKVItems = append(sysKVItems, sysKV)
			}
		}
	}

	return sysKVItems, nil
}

func (v *variablesImpl) mergeKVItem(user []*kvmemory.KVItem, sys []*kvmemory.KVItem) []*kvmemory.KVItem {
	res := make([]*kvmemory.KVItem, 0, len(user))
	sysMap := make(map[string]bool)
	for _, v := range sys {
		res = append(res, v)
		sysMap[v.Keyword] = true
	}

	for _, v := range user {
		if sysMap[v.Keyword] {
			continue
		}
		res = append(res, v)
	}

	return res
}

func (v *variablesImpl) sortKVItem(items []*kvmemory.KVItem, meta *entity.VariablesMeta) []*kvmemory.KVItem {
	sort.Slice(items, func(ii, jj int) bool {
		i := items[ii]
		j := items[jj]

		// 如果都是系统变量，这里不需要变换位置
		if i.IsSystem && !j.IsSystem {
			return false
		}
		if !i.IsSystem && j.IsSystem {
			return true
		}

		indexI := -1
		indexJ := -1

		for index, s := range meta.Variables {
			if s.Keyword == i.Keyword {
				indexI = index
			}
			if s.Keyword == j.Keyword {
				indexJ = index
			}
		}

		return indexI < indexJ
	})

	return items
}

func (v *variablesImpl) SetVariableInstance(ctx context.Context, e *entity.UserVariableMeta, items []*kvmemory.KVItem) ([]string, error) {
	meta, err := v.GetVariableMeta(ctx, e.BizID, project_memory.VariableConnector(e.BizType), e.Version)
	if err != nil {
		return nil, err
	}

	filerItems := v.filterKVItem(items, meta)
	if len(filerItems) == 0 {
		return nil, errorx.New(errno.ErrSetKvMemoryItemInstanceCode)
	}

	keywords := make([]string, 0, len(filerItems))
	key2Item := make(map[string]*kvmemory.KVItem, len(filerItems))
	for _, v := range filerItems {
		keywords = append(keywords, v.Keyword)
		key2Item[v.Keyword] = v
	}

	kvInstances, err := v.VariablesDAO.GetVariableInstances(ctx, e, keywords)
	if err != nil {
		return nil, err
	}

	needUpdateKeywords := make([]string, 0, len(kvInstances))
	needUpdateKVs := make([]*entity.VariableInstance, 0, len(kvInstances))
	for _, v := range kvInstances {
		if vv, ok := key2Item[v.Keyword]; ok {
			needUpdateKeywords = append(needUpdateKeywords, v.Keyword)
			v.Content = vv.Value
			needUpdateKVs = append(needUpdateKVs, v)
			delete(key2Item, v.Keyword)
		}
	}

	err = v.VariablesDAO.UpdateVariableInstance(ctx, needUpdateKVs)
	if err != nil {
		return nil, err
	}

	needIndexKVs := make([]*entity.VariableInstance, 0, len(key2Item))
	for _, v := range key2Item {
		needIndexKVs = append(needIndexKVs, &entity.VariableInstance{
			BizType:      int32(e.BizType),
			BizID:        e.BizID,
			Version:      e.Version,
			ConnectorID:  e.ConnectorID,
			ConnectorUID: e.ConnectorUID,
			Type:         int32(project_memory.VariableType_KVVariable),
			Keyword:      v.Keyword,
			Content:      v.Value,
		})
	}

	err = v.VariablesDAO.InsertVariableInstance(ctx, needIndexKVs)
	if err != nil {
		return nil, err
	}

	return needUpdateKeywords, nil
}

func (v *variablesImpl) filterKVItem(items []*kvmemory.KVItem, meta *entity.VariablesMeta) []*kvmemory.KVItem {
	metaKey2Variable := map[string]*entity.VariableMeta{}
	for _, variable := range meta.Variables {
		metaKey2Variable[variable.Keyword] = variable
	}

	res := make([]*kvmemory.KVItem, 0, len(items))
	for _, v := range items {
		vv, ok := metaKey2Variable[v.Keyword]
		if ok && vv.Channel != project_memory.VariableChannel_System {
			res = append(res, v)
		}
	}

	return res
}
