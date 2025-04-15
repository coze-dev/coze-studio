package service

import (
	"context"
	"encoding/json"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) deleteDocument(ctx context.Context, knowledgeID int64, docIDs []int64, userID int64, hardDelete bool) (err error) {
	option := dao.WhereDocumentOpt{
		IDs: docIDs,
	}
	if knowledgeID != 0 {
		option.KnowledgeIDs = []int64{knowledgeID}
	}
	if userID != 0 {
		option.CreatorID = userID
	}
	_, err = k.documentRepo.FindDocumentByCondition(ctx, &option)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return err
	}
	// todo，表格型知识库要去数据库那里删除掉创建的表
	sliceIDs, err := k.sliceRepo.GetDocumentSliceIDs(ctx, docIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "get document slice ids failed, err: %v", err)
		return err
	}
	// 在db中删除doc和slice的信息
	err = k.documentRepo.SoftDeleteDocuments(ctx, docIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "soft delete documents failed, err: %v", err)
		return err
	}

	deleteDocumentEvent := entity.Event{
		Type:        entity.EventTypeDeleteDataset,
		SliceIDs:    sliceIDs,
		KnowledgeID: knowledgeID,
	}
	eventData, err := json.Marshal(deleteDocumentEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return err
	}
	err = k.producer.Send(ctx, eventData)
	if err != nil {
		logs.CtxErrorf(ctx, "send event failed, err: %v", err)
		return err
	}
	return nil
}
