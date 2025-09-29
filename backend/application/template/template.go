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

package template

import (
	"context"

	productAPI "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
	"github.com/coze-dev/coze-studio/backend/domain/template/entity"
	"github.com/coze-dev/coze-studio/backend/domain/template/repository"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type ApplicationService struct {
	templateRepo repository.TemplateRepository
	storage      storage.Storage
}

var ApplicationSVC = &ApplicationService{}

func (t *ApplicationService) PublicGetProductList(ctx context.Context, req *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	pageSize := 50
	if req.PageSize > 0 {
		pageSize = int(req.PageSize)
	}
	pagination := &entity.Pagination{
		Limit:  pageSize,
		Offset: int(req.PageNum) * pageSize,
	}

	listResp, allNum, err := t.templateRepo.List(ctx, &entity.TemplateFilter{SpaceID: ptr.Of(int64(consts.TemplateSpaceID))}, pagination, "")
	if err != nil {
		return nil, err
	}

	products := make([]*productAPI.ProductInfo, 0, len(listResp))
	for _, item := range listResp {
		meta := item.MetaInfo
		for _, cover := range meta.Covers {
			objURL, uRrr := t.storage.GetObjectUrl(ctx, cover.URI)
			if uRrr == nil {
				cover.URL = objURL
			}
		}

		avatarURL, uRrr := t.storage.GetObjectUrl(ctx, "default_icon/connector-coze.png")
		if uRrr == nil {
			if meta.Seller != nil {
				meta.Seller.AvatarURL = avatarURL
			}
			if meta.UserInfo != nil {
				meta.UserInfo.AvatarURL = avatarURL
			}
		}

		products = append(products, &productAPI.ProductInfo{
			MetaInfo:      item.MetaInfo,
			BotExtra:      item.AgentExtra,
			WorkflowExtra: item.WorkflowExtra,
			ProjectExtra:  item.ProjectExtra,
		})
	}
	hasMore := false
	if int64(int(req.PageNum)*pageSize) < allNum {
		hasMore = true
	}
	resp = &productAPI.GetProductListResponse{
		Data: &productAPI.GetProductListData{
			Products: products,
			HasMore:  hasMore,
			Total:    int32(allNum),
		},
	}

	return resp, nil
}
