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

func (dao *SingleAgentVersionDAO) Create(ctx context.Context, e *entity.SingleAgentPublish) (int64, error) {
	id, err := dao.IDGen.GenID(ctx)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrIDGenFailCode, errorx.KV("msg", "CreateSingleAgentPublish"))
	}

	po := dao.singleAgentPublishDo2Po(e)
	po.ID = id

	err = dao.dbQuery.SingleAgentPublish.WithContext(ctx).Create(po)
	if err != nil {
		return 0, errorx.WrapByCode(err, errno.ErrCreateSingleAgentCode)
	}
	return id, nil
}

// List 方法：分页查询发布记录 pageIndex 从1开始
func (dao *SingleAgentVersionDAO) List(ctx context.Context, agentID int64, pageIndex, pageSize int32) ([]*entity.SingleAgentPublish, error) {
	sap := dao.dbQuery.SingleAgentPublish
	offset := (pageIndex - 1) * pageSize

	query := sap.WithContext(ctx).Where(sap.AgentID.Eq(agentID))

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

func (dao *SingleAgentVersionDAO) singleAgentPublishDo2Po(do *entity.SingleAgentPublish) *model.SingleAgentPublish {
	if do == nil {
		return nil
	}
	return &model.SingleAgentPublish{
		ID:           do.ID,
		AgentID:      do.AgentID,
		PublishID:    do.PublishID,
		ConnectorIds: do.ConnectorIds,
		Version:      do.Version,
		PublishInfo:  do.PublishInfo,
		CreatorID:    do.CreatorID,
		PublishTime:  do.PublishTime,
		CreatedAt:    do.CreatedAt,
		UpdatedAt:    do.UpdatedAt,
		Status:       do.Status,
		Extra:        do.Extra,
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

	sapTable := tx.SingleAgentPublish
	err = sapTable.WithContext(ctx).Create(po)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrPublishSingleAgentCode)
	}
	// TODO: 发布成功后，更新 SingleAgentPublishResult

	return err
}

func (sa *SingleAgentVersionDAO) GetConnectorInfos(ctx context.Context, connectorIDs []int64) ([]*entity.ConnectorInfo, error) {
	connectorInfoList := make([]*entity.ConnectorInfo, 0, len(connectorIDs))
	for _, connectorID := range connectorIDs {
		connectorInfo, ok := connectorInfoMap[connectorID]
		if !ok {
			return nil, errorx.New(errno.ErrGetConnectorCode)
		}
		connectorInfoList = append(connectorInfoList, connectorInfo)
	}

	return connectorInfoList, nil
}

// TODO: 改成从配置中读取
var connectorInfoMap = map[int64]*entity.ConnectorInfo{
	1024: {
		ID:              "1024",
		Name:            "API",
		Icon:            "	https://lf9-appstore-sign.oceancloudapi.com/ocean-cloud-tos/FileBizType.BIZ_BOT_ICON/29032201862555_1704265542803208886.jpeg?lk3s=68e6b6b5&x-expires=1746592108&x-signature=SJ8XONKGtVB%2FFpded6w04%2BKAMzA%3D",
		ConnectorStatus: 0,
	},
	999: {
		ID:              "999",
		Name:            "Chat SDK",
		Icon:            "https://lf9-appstore-sign.oceancloudapi.com/ocean-cloud-tos/FileBizType.BIZ_BOT_ICON/3952087207521568_1707043681285046428_nm5Cvu8f5f.jpeg?lk3s=68e6b6b5&x-expires=1746592108&x-signature=owR2R8COWhRH0t01xjoda0eYAUQ%3D",
		ConnectorStatus: 0,
	},
}
