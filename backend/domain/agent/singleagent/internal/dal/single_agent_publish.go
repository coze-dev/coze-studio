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

package dal

import (
	"context"
	"time"

	// Add this import to fix the undefined issue with gen. Expr

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// List method: paging query publishing records pageIndex starts at 1
func (dao *SingleAgentVersionDAO) List(ctx context.Context, agentID int64, pageIndex, pageSize int32) ([]*entity.SingleAgentPublish, error) {
	sap := dao.dbQuery.SingleAgentPublish
	offset := (pageIndex - 1) * pageSize

	query := sap.WithContext(ctx).
		Where(sap.AgentID.Eq(agentID)).
		Order(sap.PublishTime.Desc())

	result, _, err := query.FindByPage(int(offset), int(pageSize))
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentGetCode)
	}

	dos := make([]*entity.SingleAgentPublish, 0, len(result))
	for _, po := range result {
		dos = append(dos, dao.singleAgentPublishPo2Do(po))
	}

	return dos, nil
}

func (dao *SingleAgentVersionDAO) singleAgentPublishPo2Do(po *model.SingleAgentPublish) *entity.SingleAgentPublish {
	if po == nil {
		return nil
	}
	return &entity.SingleAgentPublish{
		ID:           po.ID,
		AgentID:      po.AgentID,
		PublishID:    po.PublishID,
		ConnectorIds: po.ConnectorIds,
		Version:      po.Version,
		PublishInfo:  po.PublishInfo,
		CreatorID:    po.CreatorID,
		PublishTime:  po.PublishTime,
		CreatedAt:    po.CreatedAt,
		UpdatedAt:    po.UpdatedAt,
		Status:       po.Status,
		Extra:        po.Extra,
	}
}

func (sa *SingleAgentVersionDAO) SavePublishRecord(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) (err error) {
	connectorIDs := p.ConnectorIds
	publishID := p.PublishID
	version := p.Version

	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrAgentIDGenFailCode, errorx.KV("msg", "PublishDraftAgent"))
	}

	now := time.Now()

	po := &model.SingleAgentPublish{
		ID:           id,
		AgentID:      e.AgentID,
		PublishID:    publishID,
		ConnectorIds: connectorIDs,
		Version:      version,
		PublishInfo:  nil,
		CreatorID:    e.CreatorID,
		PublishTime:  now.UnixMilli(),
		Status:       0,
		Extra:        nil,
	}

	if p.PublishInfo != nil {
		po.PublishInfo = p.PublishInfo
	}

	sapTable := query.SingleAgentPublish
	err = sapTable.WithContext(ctx).Create(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrAgentPublishSingleAgentCode)
	}

	return nil
}

func (sa *SingleAgentVersionDAO) Create(ctx context.Context, connectorID int64, version string, e *entity.SingleAgent) (int64, error) {
	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrAgentIDGenFailCode, errorx.KV("msg", "CreatePromptResource"))
	}

	po := sa.singleAgentVersionDo2Po(e)
	po.ID = id
	po.ConnectorID = connectorID
	po.Version = version

	table := query.SingleAgentVersion
	err = table.Create(po)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrAgentPublishSingleAgentCode)
	}

	return id, nil
}
