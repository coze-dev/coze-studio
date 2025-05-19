package dal

import (
	"context"
	"time"

	// 添加这个导入以解决 gen.Expr 未定义的问题

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

// List 方法：分页查询发布记录 pageIndex 从1开始
func (dao *SingleAgentVersionDAO) List(ctx context.Context, agentID int64, pageIndex, pageSize int32) ([]*entity.SingleAgentPublish, error) {
	sap := dao.dbQuery.SingleAgentPublish
	offset := (pageIndex - 1) * pageSize

	query := sap.WithContext(ctx).
		Where(sap.AgentID.Eq(agentID)).
		Order(sap.PublishTime.Desc())

	result, _, err := query.FindByPage(int(offset), int(pageSize))
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrGetSingleAgentCode)
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

func (sa *SingleAgentVersionDAO) PublishAgent(ctx context.Context, p *entity.SingleAgentPublish, e *entity.SingleAgent) (err error) {
	connectorIDs := p.ConnectorIds
	publishID := p.PublishID
	version := p.Version

	ids, err := sa.IDGen.GenMultiIDs(ctx, len(connectorIDs))
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "PublishDraftAgent"))
	}

	tx := query.Q.Begin()
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	pos := make([]*model.SingleAgentVersion, 0, len(connectorIDs))
	for idx, connectorID := range connectorIDs {
		po := sa.singleAgentVersionDo2Po(e)
		po.ConnectorID = connectorID
		po.ID = ids[idx]
		po.Version = version

		pos = append(pos, po)
	}

	table := tx.SingleAgentVersion
	err = table.CreateInBatches(pos, 10)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPublishSingleAgentCode)
	}

	id, err := sa.IDGen.GenID(ctx)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "PublishDraftAgent"))
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

	sapTable := tx.SingleAgentPublish
	err = sapTable.WithContext(ctx).Create(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPublishSingleAgentCode)
	}

	return tx.Commit()
}
