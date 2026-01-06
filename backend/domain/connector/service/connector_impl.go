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

package connector

import (
	"context"

	connector "github.com/coze-dev/coze-studio/backend/crossdomain/connector/model"
	"github.com/coze-dev/coze-studio/backend/domain/connector/entity"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type connectorImpl struct {
	tos storage.Storage
}

func NewService(tos storage.Storage) Connector {
	return &connectorImpl{
		tos: tos,
	}
}

var i18n2ConnectorDesc = map[i18n.Locale]map[int64]string{
	i18n.LocaleEN: {
		consts.WebSDKConnectorID: "Deploy your project to the Chat SDK. This publishing method is supported only for projects that have created a conversation flow, please refer to [Installation Guidelines](coze://web-sdk-guide) for installation methods.",
		consts.APIConnectorID:    "Supports OAuth 2.0 and personal access tokens",
		consts.CozeConnectorID:   "Coze",
	},
}

func (c *connectorImpl) AllConnectorInfo(ctx context.Context) []*entity.Connector {
	connectors := []*entity.Connector{
		{
			Connector: &connector.Connector{
				ID:   consts.WebSDKConnectorID,
				Name: "Chat SDK",
				URI:  "default_icon/connector-chat-sdk.jpg",
				Desc: "将项目部署到Chat SDK。仅创建过对话流的项目支持该发布方式,安装方式请查看[安装指引](coze://web-sdk-guide)",
			},
		},
		{
			Connector: &connector.Connector{
				ID:   consts.APIConnectorID,
				Name: "API",
				URI:  "default_icon/connector-api.jpg",
				Desc: "支持 OAuth 2.0 和个人访问令牌",
			},
		},
		{
			Connector: &connector.Connector{
				ID:   consts.CozeConnectorID,
				Name: "coze",
				URI:  "default_icon/connector-coze.png",
				Desc: "Coze",
			},
		},
	}

	locale := i18n.GetLocale(ctx)
	for _, connector := range connectors {
		i18nDesc, ok := i18n2ConnectorDesc[locale][connector.ID]
		if ok {
			connector.Desc = i18nDesc
		}
	}

	return connectors
}

func (c *connectorImpl) List(ctx context.Context) ([]*entity.Connector, error) {
	allConnectors := c.AllConnectorInfo(ctx)
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

func (c *connectorImpl) GetByID(ctx context.Context, id int64) (*entity.Connector, error) {
	res, err := c.GetByIDs(ctx, []int64{id})
	if err != nil {
		return nil, err
	}

	connector, ok := res[id]
	if !ok {
		return nil, errorx.New(errno.ErrConnectorNotFound, errorx.KV("id", conv.Int64ToStr(id)))
	}

	return connector, nil
}

func (c *connectorImpl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*entity.Connector, error) {
	connectorsMap := make(map[int64]*entity.Connector, len(ids))
	allConnectors := c.AllConnectorInfo(ctx)

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
