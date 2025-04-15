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
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) HandleMessage(ctx context.Context, msg *eventbus.Message) (err error) {
	defer func() {
		if err != nil {
			logs.Errorf("[HandleMessage] failed, %v", err)
		}
	}()

	event := &entity.Event{}
	if err = sonic.Unmarshal(msg.Body, event); err != nil {
		return err
	}

	switch event.Type {
	case entity.EventTypeIndexDocument:

	}

	return nil
}

func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) error {
	doc := event.Document

	// clear
	if err := k.sliceRepo.DeleteByDocument(ctx, doc.ID); err != nil {
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

	parseResult, err := k.parser.Parse(ctx, resp.Body, event.Document.ParsingStrategy, event.Document.ChunkingStrategy)
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

	// to vectorstore

	return nil
}
