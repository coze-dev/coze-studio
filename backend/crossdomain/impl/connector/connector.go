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

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/connector"
	crossconnector "github.com/coze-dev/coze-studio/backend/crossdomain/contract/connector"
	connector "github.com/coze-dev/coze-studio/backend/domain/connector/service"
)

var defaultSVC crossconnector.Connector

func InitDomainService(c connector.Connector) crossconnector.Connector {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func DefaultSVC() crossconnector.Connector {
	return defaultSVC
}

type impl struct {
	DomainSVC connector.Connector
}

func (c *impl) GetByIDs(ctx context.Context, ids []int64) (map[int64]*model.Connector, error) {
	res, err := c.DomainSVC.GetByIDs(ctx, ids)
	if err != nil {
		return nil, err
	}

	ret := make(map[int64]*model.Connector, len(res))
	for _, v := range res {
		ret[v.ID] = v.Connector
	}

	return ret, nil
}

func (c *impl) List(ctx context.Context) ([]*model.Connector, error) {
	res, err := c.DomainSVC.List(ctx)
	if err != nil {
		return nil, err
	}

	ret := make([]*model.Connector, 0, len(res))
	for _, v := range res {
		ret = append(ret, v.Connector)
	}

	return ret, nil
}

func (c *impl) GetByID(ctx context.Context, id int64) (*model.Connector, error) {
	info, err := c.DomainSVC.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return info.Connector, nil
}
