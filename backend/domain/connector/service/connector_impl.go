package connector

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/types/consts"
)

type connectorImpl struct {
	tos storage.Storage
}

func NewService(tos storage.Storage) Connector {
	return &connectorImpl{
		tos: tos,
	}
}

func (c *connectorImpl) AllConnectorInfo() []*entity.Connector {
	return []*entity.Connector{
		{
			ID:   consts.WebSDKConnectorID,
			Name: "Chat SDK",
			URI:  "default_icon/connector-chat-sdk.jpg",
			Desc: "将Bot部署为Web SDK",
		},
		{
			ID:   consts.AgentAsAPIConnectorID,
			Name: "API",
			URI:  "default_icon/connector-api.jpg",
			Desc: "调用前需[创建访问凭证](https://localhost/open/oauth/apps)，支持 OAuth 2.0 和个人访问令牌", // TODO(fanlv): 链接
		},
		{
			ID:   consts.CozeConnectorID,
			Name: "coze",
			URI:  "default_icon/connector-coze.png",
			Desc: "coze",
		},
	}
}

func (c *connectorImpl) List(ctx context.Context) ([]*entity.Connector, error) {
	allConnectors := c.AllConnectorInfo()
	res := make([]*entity.Connector, 0, len(allConnectors))

	for _, connector := range allConnectors {
		var err error
		connector.URL, err = c.tos.GetObjectUrl(ctx, connector.URI)
		if err != nil {
			return nil, err
		}
		res = append(res, connector)
	}

	return res, nil
}

func (c *connectorImpl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*entity.Connector, error) {
	connectorsMap := make(map[int64]*entity.Connector, len(ids))
	allConnectors := c.AllConnectorInfo()

	for _, connector := range allConnectors {
		connectorsMap[connector.ID] = connector
	}

	cr := make(map[int64]*entity.Connector, len(ids))
	for _, id := range ids {
		if connector, ok := connectorsMap[id]; ok {
			var err error
			connector.URL, err = c.tos.GetObjectUrl(ctx, connector.URI)
			if err != nil {
				return nil, err
			}

			cr[id] = connector
		}
	}
	return cr, nil
}
