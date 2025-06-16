package template

import (
	"context"

	productAPI "code.byted.org/flow/opencoze/backend/api/model/flow/marketplace/product_public_api"
	"code.byted.org/flow/opencoze/backend/domain/template/repository"
)

type ApplicationService struct {
	templateRepo repository.TemplateRepository
}

var ApplicationSVC = &ApplicationService{}

func (t *ApplicationService) PublicGetProductList(ctx context.Context, _ *productAPI.GetProductListRequest) (resp *productAPI.GetProductListResponse, err error) {
	listResp, allNum, err := t.templateRepo.List(ctx, nil, nil, "")
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

	resp = &productAPI.GetProductListResponse{
		Data: &productAPI.GetProductListData{
			Products: products,
			HasMore:  false, // 一次性拉完
			Total:    int32(allNum),
		},
	}

	return resp, nil
}
