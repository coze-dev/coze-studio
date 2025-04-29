package service

import (
	"context"
	"fmt"
	"strconv"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

const resourceIndexName = "coze_resource"

func (s *searchImpl) indexResources(ctx context.Context, ev *entity.ResourceDomainEvent) error {
	return s.indexResource(ctx, ev.OpType, ev.Resource)
}

func (s *searchImpl) indexResource(ctx context.Context, opType entity.OpType, r *entity.Resource) error {
	switch opType {
	case entity.Created, entity.Updated:
		rd := r.ToResourceDocument()
		_, err := s.esClient.Index(resourceIndexName).Id(strconv.FormatInt(rd.ResID, 10)).Document(rd).Do(ctx)
		return err
	case entity.Deleted:
		_, err := s.esClient.Delete(resourceIndexName, strconv.FormatInt(r.ID, 10)).Do(ctx)
		return err
	}

	return fmt.Errorf("unexpected op type: %v", opType)
}
