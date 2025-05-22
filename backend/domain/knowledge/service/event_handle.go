package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/document/parser"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/document/searchstore"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) HandleMessage(ctx context.Context, msg *eventbus.Message) (err error) {
	defer func() {
		if err != nil {
			logs.Errorf("[HandleMessage] failed, %v", err)
		} else {
			logs.Infof("[HandleMessage] knowledge event handle success, body=%s", string(msg.Body))
		}
	}()

	if string(msg.Body) == "hello" {
		fmt.Println("bye")
		return nil
	}

	// TODO: 确认下 retry ?
	event := &entity.Event{}
	if err = sonic.Unmarshal(msg.Body, event); err != nil {
		return err
	}

	switch event.Type {
	case entity.EventTypeIndexDocuments:
		if err = k.indexDocuments(ctx, event); err != nil {
			return err
		}
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
	case entity.EventTypeDocumentReview:
		if err = k.documentReviewEventHandler(ctx, event); err != nil {
			logs.CtxErrorf(ctx, "[HandleMessage] document review failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) deleteKnowledgeDataEventHandler(ctx context.Context, event *entity.Event) error {
	// 删除知识库在各个存储里的数据
	for _, manager := range k.searchStoreManagers {
		s, err := manager.GetSearchStore(ctx, getCollectionName(event.KnowledgeID))
		if err != nil {
			return fmt.Errorf("get search store failed, %w", err)
		}
		if err := s.Delete(ctx, slices.Transform(event.SliceIDs, func(id int64) string {
			return strconv.FormatInt(id, 10)
		})); err != nil {
			logs.Errorf("delete knowledge failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) indexDocuments(ctx context.Context, event *entity.Event) (err error) {
	if len(event.Documents) == 0 {
		logs.CtxWarnf(ctx, "[indexDocuments] documents not provided")
		return nil
	}
	for i := range event.Documents {
		doc := event.Documents[i]
		if doc == nil {
			logs.CtxWarnf(ctx, "[indexDocuments] document not provided")
			continue
		}
		e := &entity.Event{
			Type:        entity.EventTypeIndexDocument,
			Document:    doc,
			KnowledgeID: doc.KnowledgeID,
		}
		msgData, err := sonic.Marshal(e)
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocuments] marshal event failed, err: %v", err)
			return err
		}
		err = k.producer.Send(ctx, msgData, eventbus.WithShardingKey(strconv.FormatInt(doc.KnowledgeID, 10)))
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocuments] send message failed, err: %v", err)
			return err
		}
	}
	return nil
}

func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) (err error) {
	// 需要设计一套防重入的机制
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
	collectionName := getCollectionName(doc.KnowledgeID)

	ids, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{doc.ID})
	if err != nil {
		return err
	}
	if len(ids) > 0 {
		if err = k.sliceRepo.DeleteByDocument(ctx, doc.ID); err != nil {
			return err
		}
		for _, manager := range k.searchStoreManagers {
			s, err := manager.GetSearchStore(ctx, collectionName)
			if err != nil {
				return fmt.Errorf("[indexDocument] get search store failed, %w", err)
			}
			if err := s.Delete(ctx, slices.Transform(event.SliceIDs, func(id int64) string {
				return strconv.FormatInt(id, 10)
			})); err != nil {
				logs.Errorf("[indexDocument] delete knowledge failed, err: %v", err)
				return err
			}
		}
	}

	// set chunk status
	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusChunking), ""); err != nil {
		return err
	}

	// parse & chunk
	bodyBytes, err := k.storage.GetObject(ctx, doc.URI)
	if err != nil {
		return err
	}

	docParser, err := k.parseManager.GetParser(convert.DocumentToParseConfig(doc))
	if err != nil {
		return fmt.Errorf("[indexDocument] get document parser failed, %w", err)
	}

	parseResult, err := docParser.Parse(ctx, bytes.NewReader(bodyBytes), parser.WithExtraMeta(map[string]any{
		document.MetaDataKeyCreatorID: doc.CreatorID,
		document.MetaDataKeyExternalStorage: map[string]any{
			"document_id": doc.ID,
		},
	}))
	if err != nil {
		return fmt.Errorf("[indexDocument] parse document failed, %w", err)
	}

	convertFn := d2sMapping[doc.Type]
	if convertFn == nil {
		return fmt.Errorf("[indexDocument] document convert fn not found, type=%d", doc.Type)
	}

	entitySlices, err := slices.TransformWithErrorCheck(parseResult, func(a *schema.Document) (*entity.Slice, error) {
		return convertFn(a, doc.KnowledgeID, doc.ID, doc.CreatorID)
	})
	if err != nil {
		return fmt.Errorf("[indexDocument] transform documents failed, %w", err)
	}

	// save slices
	const maxBatchSize = 100
	total := len(parseResult)
	allIDs := make([]int64, 0, total)
	for total > 0 {
		batchSize := min(total, maxBatchSize)
		ids, err = k.idgen.GenMultiIDs(ctx, batchSize)
		if err != nil {
			return err
		}
		allIDs = append(allIDs, ids...)
		total -= batchSize
	}

	for i := range allIDs {
		parseResult[i].ID = strconv.FormatInt(allIDs[i], 10)
	}

	if doc.Type == entity.DocumentTypeTable {
		// 表格类型，将数据插入到数据库中
		err = k.upsertDataToTable(ctx, &doc.TableInfo, entitySlices, ids)
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocument] insert data to table failed, err: %v", err)
			return err
		}
	}

	sliceModels := make([]*model.KnowledgeDocumentSlice, 0, len(parseResult))
	for i, src := range parseResult {
		now := time.Now().UnixMilli()
		src.ID = strconv.FormatInt(ids[i], 10)
		sliceModels = append(sliceModels, &model.KnowledgeDocumentSlice{
			ID:          ids[i],
			KnowledgeID: doc.KnowledgeID,
			DocumentID:  doc.ID,
			Content:     parseResult[i].Content,
			Sequence:    float64(i),
			CreatedAt:   now,
			UpdatedAt:   now,
			CreatorID:   doc.CreatorID,
			SpaceID:     doc.SpaceID,
			Status:      int32(model.SliceStatusProcessing),
			FailReason:  "",
		})
	}
	if err = k.sliceRepo.BatchCreate(ctx, sliceModels); err != nil {
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

	fields, err := k.mapSearchFields(doc)
	if err != nil {
		return err
	}

	var indexingFields []string
	for _, field := range fields {
		if field.Indexing {
			indexingFields = append(indexingFields, field.Name)
		}
	}

	for _, manager := range k.searchStoreManagers {
		// TODO: knowledge 可以记录 search store 状态，不需要每次都 create 然后靠 create 检查
		if err = manager.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields:         fields,
			CollectionMeta: nil,
		}); err != nil {
			return fmt.Errorf("[indexDocuments] search store create failed, %w", err)
		}

		ss, err := manager.GetSearchStore(ctx, collectionName)
		if err != nil {
			return fmt.Errorf("[indexDocuments] search store get failed, %w", err)
		}

		if _, err = ss.Store(ctx, parseResult,
			searchstore.WithPartition(strconv.FormatInt(doc.ID, 10)),
			searchstore.WithIndexingFields(indexingFields),
		); err != nil {
			return fmt.Errorf("[indexDocuments] search store save failed, %w", err)
		}
	}
	// set slice status
	if err = k.sliceRepo.BatchSetStatus(ctx, ids, int32(model.SliceStatusDone), ""); err != nil {
		return err
	}

	// TODO: 更新 size + slice count + char count
	// set document status
	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusEnable), ""); err != nil {
		return err
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, event.Document.ID); err != nil {
		return err
	}
	return nil
}

func (k *knowledgeSVC) upsertDataToTable(ctx context.Context, tableInfo *entity.TableInfo, slices []*entity.Slice, sliceIDs []int64) (err error) {
	if len(slices) == 0 {
		logs.CtxWarnf(ctx, "[insertDataToTable] slices not provided")
		return nil
	}
	if len(sliceIDs) != len(slices) {
		return errors.New("slice ids length not equal slices length")
	}
	insertData, err := packInsertData(slices, sliceIDs)
	if err != nil {
		logs.CtxErrorf(ctx, "[insertDataToTable] pack insert data failed, err: %v", err)
		return err
	}
	resp, err := k.rdb.UpsertData(ctx, &rdb.UpsertDataRequest{
		TableName: tableInfo.PhysicalTableName,
		Data:      insertData,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "[insertDataToTable] insert data failed, err: %v", err)
		return err
	}
	if resp.AffectedRows != int64(len(slices)) {
		return fmt.Errorf("insert data failed, affected rows: %d, expect: %d", resp.AffectedRows, len(slices))
	}
	return nil
}

func packInsertData(slices []*entity.Slice, ids []int64) (data []map[string]interface{}, err error) {
	defer func() {
		if r := recover(); r != nil {
			logs.Errorf("[packInsertData] panic: %v", r)
			err = fmt.Errorf("[packInsertData] panic: %v", r)
			return
		}
	}()
	for i := range slices {
		dataMap := map[string]interface{}{
			consts.RDBFieldID: ids[i],
		}
		for j := range slices[i].RawContent[0].Table.Columns {
			col := slices[i].RawContent[0].Table.Columns[j]
			if col.ColumnName == consts.RDBFieldID {
				continue
			}
			physicalColumnName := convert.ColumnIDToRDBField(col.ColumnID)
			dataMap[physicalColumnName] = col.GetValue()
		}
		data = append(data, dataMap)
	}
	return data, nil
}

func (k *knowledgeSVC) indexSlice(ctx context.Context, event *entity.Event) (err error) {
	slice := event.Slice
	if event.Document == nil {
		doc, err := k.documentRepo.GetByID(ctx, slice.DocumentID)
		if err != nil {
			return err
		}
		event.Document = k.fromModelDocument(ctx, doc)
	}
	if slice == nil {
		return fmt.Errorf("[indexSlice] slice not provided")
	}
	if slice.ID == 0 {
		return fmt.Errorf("[indexSlice] slice.id not set")
	}
	if slice.DocumentID == 0 {
		slice.DocumentID = event.Document.ID
	}
	if slice.KnowledgeID == 0 {
		slice.KnowledgeID = event.Document.KnowledgeID
	}

	defer func() {
		if err != nil {
			if setStatusErr := k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexSlice] set slice status failed, err: %v", setStatusErr)
			}
		}
	}()

	fields, err := k.mapSearchFields(event.Document)
	if err != nil {
		return err
	}

	var indexingFields []string
	for _, field := range fields {
		if field.Indexing {
			indexingFields = append(indexingFields, field.Name)
		}
	}

	collectionName := getCollectionName(slice.KnowledgeID)
	for _, manager := range k.searchStoreManagers {
		ss, err := manager.GetSearchStore(ctx, collectionName)
		if err != nil {
			return fmt.Errorf("[indexSlice] search store get failed, %w", err)
		}

		doc, err := k.slice2Document(ctx, event.Document, slice)
		if err != nil {
			return fmt.Errorf("[indexSlice] convert slice to document failed, %w", err)
		}

		if _, err = ss.Store(ctx, []*schema.Document{doc},
			searchstore.WithPartition(strconv.FormatInt(event.Document.ID, 10)),
			searchstore.WithIndexingFields(indexingFields),
		); err != nil {
			return fmt.Errorf("[indexSlice] document store failed, %w", err)
		}
	}

	if err = k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusDone), ""); err != nil {
		return err
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, slice.DocumentID); err != nil {
		return err
	}
	return nil
}

type chunk struct {
	ID   string `json:"id"`
	Text string `json:"text"`
	Type string `json:"type"`
}

type chunkResult struct {
	Chunks []*chunk `json:"chunks"`
}

func (k *knowledgeSVC) documentReviewEventHandler(ctx context.Context, event *entity.Event) (err error) {
	review := event.DocumentReview
	if review == nil {
		return fmt.Errorf("[documentReviewEventHandler] review not provided")
	}
	if review.ReviewId == nil {
		return fmt.Errorf("[documentReviewEventHandler] review.id not set")
	}
	reviewModel, err := k.reviewRepo.GetByID(ctx, *review.ReviewId)
	if err != nil {
		return err
	}
	if reviewModel.Status == int32(entity.ReviewStatus_Enable) {
		return nil
	}
	byteData, err := k.storage.GetObject(ctx, review.Uri)
	if err != nil {
		return err
	}
	p, err := k.parseManager.GetParser(convert.DocumentToParseConfig(event.Document))
	if err != nil {
		return err
	}
	result, err := p.Parse(ctx, bytes.NewReader(byteData))
	if err != nil {
		return err
	}
	ids, err := k.idgen.GenMultiIDs(ctx, len(result))
	if err != nil {
		return err
	}
	fn, ok := d2sMapping[event.Document.Type]
	if !ok {
		return fmt.Errorf("[documentReviewEventHandler] unknow document type: %d", event.Document.Type)
	}
	var chunks []*chunk
	for i, doc := range result {
		slice, err := fn(doc, event.Document.KnowledgeID, event.Document.ID, event.Document.CreatorID)
		if err != nil {
			return err
		}
		chunks = append(chunks, &chunk{
			ID:   strconv.FormatInt(ids[i], 10),
			Text: slice.GetSliceContent(),
			Type: "text",
		})
	}
	chunkResp := &chunkResult{
		Chunks: chunks,
	}
	chunksData, err := sonic.Marshal(chunkResp)
	if err != nil {
		return err
	}
	tosUri := fmt.Sprintf("DocReview/%d_%d_%d.txt", reviewModel.CreatorID, time.Now().UnixMilli(), *review.ReviewId)
	err = k.storage.PutObject(ctx, tosUri, chunksData, storage.WithContentType("text/plain; charset=utf-8"))
	if err != nil {
		return err
	}
	return k.reviewRepo.UpdateReview(ctx, reviewModel.ID, map[string]interface{}{
		"status":         int32(entity.ReviewStatus_Enable),
		"chunk_resp_uri": tosUri,
	})
}

func (k *knowledgeSVC) mapSearchFields(doc *entity.Document) ([]*searchstore.Field, error) {
	fn, found := fMapping[doc.Type]
	if !found {
		return nil, fmt.Errorf("[mapSearchFields] document type invalid, type=%d", doc.Type)
	}
	return fn(doc, k.enableCompactTable), nil
}

func (k *knowledgeSVC) slice2Document(ctx context.Context, src *entity.Document, slice *entity.Slice) (*schema.Document, error) {
	fn, found := s2dMapping[src.Type]
	if !found {
		return nil, fmt.Errorf("[slice2Document] document type invalid, type=%d", src.Type)
	}
	return fn(ctx, slice, src.TableInfo.Columns, k.enableCompactTable)
}

func getCollectionName(knowledgeID int64) string {
	return fmt.Sprintf("opencoze_%d", knowledgeID)
}

func getColName(colID int64) string {
	return fmt.Sprintf("col_%d", colID)
}
