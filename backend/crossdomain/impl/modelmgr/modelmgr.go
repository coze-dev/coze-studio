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

package modelmgr

import (
	"context"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/modelmgr"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossmodelmgr"
	"github.com/coze-dev/coze-studio/backend/domain/modelmgr"
)

var defaultSVC crossmodelmgr.ModelMgr

type impl struct {
	DomainSVC modelmgr.Manager
}

func InitDomainService(c modelmgr.Manager) crossmodelmgr.ModelMgr {
	defaultSVC = &impl{
		DomainSVC: c,
	}
	return defaultSVC
}

func (s *impl) MGetModelByID(ctx context.Context, req *modelmgr.MGetModelRequest) ([]*model.Model, error) {
	res, err := s.DomainSVC.MGetModelByID(ctx, req)
	if err != nil {
		return nil, err
	}

	ret := make([]*model.Model, 0, len(res))
	for _, v := range res {
		ret = append(ret, v.Model)
	}

	return ret, nil
}
