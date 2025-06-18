package template

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/template/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/consts"

	productAPI "code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_public_api"
	"code.byted.org/flow/opencoze/backend/domain/template/repository"
)

type ApplicationService struct {
	templateRepo repository.TemplateRepository
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
