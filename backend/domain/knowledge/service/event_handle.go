package service

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/bytedance/sonic"
	"github.com/volcengine/volc-sdk-golang/service/imagex/v2"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) HandleMessage(ctx context.Context, msg *eventbus.Message) (err error) {
	defer func() {
		if err != nil {
			logs.Errorf("[HandleMessage] failed, %v", err)
		}
	}()

	// TODO: 确认下 retry ?
	event := &entity.Event{}
	if err = sonic.Unmarshal(msg.Body, event); err != nil {
		return err
	}

	switch event.Type {
	case entity.EventTypeIndexDocument:
		if err = k.indexDocument(ctx, event); err != nil {
			return err
		}
	case entity.EventTypeIndexSlice:
		if err = k.indexSlice(ctx, event); err != nil {
			return err
		}

	case entity.EventTypeDeleteKnowledgeData:
		err = k.deleteKnowledgeDataEventHandler(ctx, event)
		if err != nil {
			logs.CtxErrorf(ctx, "[HandleMessage] delete knowledge failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) deleteKnowledgeDataEventHandler(ctx context.Context, event *entity.Event) error {
	// 删除知识库在各个存储里的数据
	for i := range k.searchStores {
		if k.searchStores[i] == nil {
			continue
		}
		if err := k.searchStores[i].Delete(ctx, event.KnowledgeID, event.SliceIDs); err != nil {
			logs.Errorf("delete knowledge failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) (err error) {
	doc := event.Document
	if doc == nil {
		return fmt.Errorf("[indexDocument] document not provided")
	}

	defer func() {
		if err != nil {
			if setStatusErr := k.documentRepo.SetStatus(ctx, event.Document.ID, int32(entity.DocumentStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexDocument] set document status failed, err: %v", setStatusErr)
			}
		}
	}()

	// clear
	if err = k.sliceRepo.DeleteByDocument(ctx, doc.ID); err != nil {
		return err
	}

	// set chunk status
	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusChunking), ""); err != nil {
		return err
	}

	// parse & chunk
	resource, err := k.imageX.GetResourceURL(ctx, &imagex.GetResourceURLQuery{
		Domain:    k.imageX.Domain,
		ServiceID: k.imageX.ServiceID,
		URI:       doc.URI,
	})
	if err != nil {
		return err
	}

	resp, err := http.Get(resource.Result.URL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("get url failed, status code=%d", resp.StatusCode)
	}

	parseResult, err := k.parser.Parse(ctx, resp.Body, doc)
	if err != nil {
		return err
	}

	// save slices
	ids, err := k.idgen.GenMultiIDs(ctx, len(parseResult.Slices))
	slices := make([]*model.KnowledgeDocumentSlice, 0, len(parseResult.Slices))
	for i := range parseResult.Slices {
		now := time.Now().UnixMilli()
		slices = append(slices, &model.KnowledgeDocumentSlice{
			ID:          ids[i],
			KnowledgeID: doc.KnowledgeID,
			DocumentID:  doc.ID,
			Content:     parseResult.Slices[i].PlainText,
			Sequence:    int32(i + 1),
			CreatedAt:   now,
			UpdatedAt:   now,
			CreatorID:   doc.CreatorID,
			SpaceID:     doc.SpaceID,
			Status:      int32(model.SliceStatusProcessing),
			FailReason:  "",
		})
	}
	if err = k.sliceRepo.BatchCreate(ctx, slices); err != nil {
		return err
	}

	defer func() {
		if err != nil { // set slice status
			if setStatusErr := k.sliceRepo.BatchSetStatus(ctx, ids, int32(model.SliceStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexDocument] set slice status failed, err: %v", setStatusErr)
			}
		}
	}()

	// to vectorstore
	for _, store := range k.searchStores {
		// TODO: knowledge 可以记录 search store 状态，不需要每次都 create 然后靠 create 检查
		if err = store.Create(ctx, doc); err != nil {
			return err
		}

		// TODO: table column
		if err = store.Store(ctx, &searchstore.StoreRequest{
			KnowledgeID:  doc.KnowledgeID,
			DocumentID:   doc.ID,
			DocumentType: doc.Type,
			Slices:       parseResult.Slices,
			CreatorID:    doc.CreatorID,
			TableSchema:  doc.TableColumns,
		}); err != nil {
			return err
		}
	}

	// set slice status
	if err = k.sliceRepo.BatchSetStatus(ctx, ids, int32(model.SliceStatusDone), ""); err != nil {
		return err
	}

	// set document status
	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusEnable), ""); err != nil {
		return err
	}

	return nil
}

func (k *knowledgeSVC) indexSlice(ctx context.Context, event *entity.Event) (err error) {
	slice := event.Slice
	if event.Document != nil {
		return fmt.Errorf("[indexSlice] document not provided")
	}
	if slice == nil {
		return fmt.Errorf("[indexSlice] slice not provided")
	}
	if slice.ID == 0 {
		return fmt.Errorf("[indexSlice] slice.id not set")
	}

	defer func() {
		if err != nil {
			if setStatusErr := k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexSlice] set slice status failed, err: %v", setStatusErr)
			}
		}
	}()

	for _, store := range k.searchStores {
		if err = store.Store(ctx, &searchstore.StoreRequest{
			KnowledgeID:  slice.KnowledgeID,
			DocumentID:   slice.DocumentID,
			DocumentType: event.Document.Type,
			Slices:       []*entity.Slice{slice},
			CreatorID:    slice.CreatorID,
			TableSchema:  event.Document.TableColumns,
		}); err != nil {
			return err
		}
	}

	if err = k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusDone), ""); err != nil {
		return err
	}

	return nil
}
