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

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/events"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/progressbar"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) HandleMessage(ctx context.Context, msg *eventbus.Message) (err error) {
	defer func() {
		if err != nil {
			var statusError errorx.StatusError
			if errors.As(err, &statusError) && statusError.Code() == errno.ErrKnowledgeNonRetryableCode {
				logs.Errorf("[HandleMessage][no-retry] failed, %v", err)
				err = nil
			} else {
				logs.Errorf("[HandleMessage][retry] failed, %v", err)
			}
		} else {
			logs.Infof("[HandleMessage] knowledge event handle success, body=%s", string(msg.Body))
		}
	}()

	event := &entity.Event{}
	if err = sonic.Unmarshal(msg.Body, event); err != nil {
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("unmarshal event failed, err: %v", err)))
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
	default:
		return errorx.New(errno.ErrKnowledgeNonRetryableCode, errorx.KV("reason", fmt.Sprintf("unknown event type=%s", event.Type)))
	}
	return nil
}

func (k *knowledgeSVC) deleteKnowledgeDataEventHandler(ctx context.Context, event *entity.Event) error {
	// 删除知识库在各个存储里的数据
	for _, manager := range k.searchStoreManagers {
		s, err := manager.GetSearchStore(ctx, getCollectionName(event.KnowledgeID))
		if err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("get search store failed, err: %v", err)))
		}
		if err := s.Delete(ctx, slices.Transform(event.SliceIDs, func(id int64) string {
			return strconv.FormatInt(id, 10)
		})); err != nil {
			logs.Errorf("delete knowledge failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("delete search store failed, err: %v", err)))
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
		e := events.NewIndexDocumentEvent(doc.KnowledgeID, doc)
		msgData, err := sonic.Marshal(e)
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocuments] marshal event failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal event failed, err: %v", err)))
		}
		err = k.producer.Send(ctx, msgData, eventbus.WithShardingKey(strconv.FormatInt(doc.KnowledgeID, 10)))
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocuments] send message failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeMQSendFailCode, errorx.KV("msg", fmt.Sprintf("send message failed, err: %v", err)))
		}
	}
	return nil
}

func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) (err error) {
	doc := event.Document
	if doc == nil {
		return errorx.New(errno.ErrKnowledgeNonRetryableCode, errorx.KV("reason", "[indexDocument] document not provided"))
	}

	// 1. retry 队列和普通队列中对同一文档的 index 操作并发，同一个文档数据写入两份（在后端 bugfix 上线时产生）
	// 2. rebalance 重复消费同一条消息

	// check knowledge and document status
	if valid, err := k.isWritableKnowledgeAndDocument(ctx, doc.KnowledgeID, doc.ID); err != nil {
		return err
	} else if !valid {
		return errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KVf("reason", "[indexDocument] not writable, knowledge_id=%d, document_id=%d", event.KnowledgeID, doc.ID))
	}

	defer func() {
		if e := recover(); e != nil {
			err = errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", fmt.Sprintf("panic: %v", e)))
			logs.CtxErrorf(ctx, "[indexDocument] panic, err: %v", err)
			if setStatusErr := k.documentRepo.SetStatus(ctx, event.Document.ID, int32(entity.DocumentStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexDocument] set document status failed, err: %v", setStatusErr)
			}
			return
		}
		if err != nil {
			var errMsg string
			var statusError errorx.StatusError
			var status int32
			if errors.As(err, &statusError) {
				errMsg = errorx.ErrorWithoutStack(statusError)
				if statusError.Code() == errno.ErrKnowledgeNonRetryableCode {
					status = int32(entity.DocumentStatusFailed)
				} else {
					status = int32(entity.DocumentStatusChunking)
				}
			} else {
				errMsg = err.Error()
				status = int32(entity.DocumentStatusChunking)
			}
			if setStatusErr := k.documentRepo.SetStatus(ctx, event.Document.ID, status, errMsg); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexDocument] set document status failed, err: %v", setStatusErr)
			}
		}
	}()

	// clear
	collectionName := getCollectionName(doc.KnowledgeID)

	if !doc.IsAppend {
		ids, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{doc.ID})
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get document slice ids failed, err: %v", err)))
		}
		if len(ids) > 0 {
			if err = k.sliceRepo.DeleteByDocument(ctx, doc.ID); err != nil {
				return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("delete document slice failed, err: %v", err)))
			}
			for _, manager := range k.searchStoreManagers {
				s, err := manager.GetSearchStore(ctx, collectionName)
				if err != nil {
					return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("get search store failed, err: %v", err)))
				}
				if err := s.Delete(ctx, slices.Transform(event.SliceIDs, func(id int64) string {
					return strconv.FormatInt(id, 10)
				})); err != nil {
					logs.Errorf("[indexDocument] delete knowledge failed, err: %v", err)
					return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("delete search store failed, err: %v", err)))
				}
			}
		}
	}

	// set chunk status
	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusChunking), ""); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("set document status failed, err: %v", err)))
	}

	// parse & chunk
	bodyBytes, err := k.storage.GetObject(ctx, doc.URI)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeGetObjectFailCode, errorx.KV("msg", fmt.Sprintf("get object failed, err: %v", err)))
	}

	docParser, err := k.parseManager.GetParser(convert.DocumentToParseConfig(doc))
	if err != nil {
		return errorx.New(errno.ErrKnowledgeGetParserFailCode, errorx.KV("msg", fmt.Sprintf("get parser failed, err: %v", err)))
	}

	parseResult, err := docParser.Parse(ctx, bytes.NewReader(bodyBytes), parser.WithExtraMeta(map[string]any{
		document.MetaDataKeyCreatorID: doc.CreatorID,
		document.MetaDataKeyExternalStorage: map[string]any{
			"document_id": doc.ID,
		},
	}))
	if err != nil {
		return errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KV("msg", fmt.Sprintf("parse document failed, err: %v", err)))
	}

	if doc.Type == knowledge.DocumentTypeTable {
		noData, err := document.GetDocumentsColumnsOnly(parseResult)
		if err != nil { // unexpected
			return errorx.New(errno.ErrKnowledgeNonRetryableCode,
				errorx.KVf("reason", "[indexDocument] get table data status failed, err: %v", err))
		}
		if noData {
			parseResult = nil // clear parse result
		}
	}

	// set id
	allIDs := make([]int64, 0, len(parseResult))
	for l := 0; l < len(parseResult); l += 100 {
		r := min(l+100, len(parseResult))
		batchSize := r - l
		ids, err := k.idgen.GenMultiIDs(ctx, batchSize)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("GenMultiIDs failed, err: %v", err)))
		}
		allIDs = append(allIDs, ids...)
		for i := 0; i < batchSize; i++ {
			id := ids[i]
			index := l + i
			parseResult[index].ID = strconv.FormatInt(id, 10)
		}
	}

	convertFn := d2sMapping[doc.Type]
	if convertFn == nil {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "convertFn is empty"))
	}

	sliceEntities, err := slices.TransformWithErrorCheck(parseResult, func(a *schema.Document) (*entity.Slice, error) {
		return convertFn(a, doc.KnowledgeID, doc.ID, doc.CreatorID)
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", fmt.Sprintf("convert document failed, err: %v", err)))
	}

	// save slices
	if doc.Type == knowledge.DocumentTypeTable {
		// 表格类型，将数据插入到数据库中
		err = k.upsertDataToTable(ctx, &doc.TableInfo, sliceEntities)
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocument] insert data to table failed, err: %v", err)
			return err
		}
	}

	var seqOffset float64
	if doc.IsAppend {
		seqOffset, err = k.sliceRepo.GetLastSequence(ctx, doc.ID)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get last sequence failed, err: %v", err)))
		}
		seqOffset += 1
	}

	sliceModels := make([]*model.KnowledgeDocumentSlice, 0, len(parseResult))
	for i, src := range parseResult {
		now := time.Now().UnixMilli()
		sliceModel := &model.KnowledgeDocumentSlice{
			ID:          allIDs[i],
			KnowledgeID: doc.KnowledgeID,
			DocumentID:  doc.ID,
			Content:     parseResult[i].Content,
			Sequence:    seqOffset + float64(i),
			CreatedAt:   now,
			UpdatedAt:   now,
			CreatorID:   doc.CreatorID,
			SpaceID:     doc.SpaceID,
			Status:      int32(model.SliceStatusProcessing),
			FailReason:  "",
		}
		if doc.Type == knowledge.DocumentTypeTable {
			sliceEntity, err := convertFn(src, doc.KnowledgeID, doc.ID, doc.CreatorID)
			if err != nil {
				logs.CtxErrorf(ctx, "[indexDocument] convert document failed, err: %v", err)
				return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", fmt.Sprintf("convert document failed, err: %v", err)))
			}
			sliceModel.Content = sliceEntity.GetSliceContent()
		}
		sliceModels = append(sliceModels, sliceModel)
	}
	if err = k.sliceRepo.BatchCreate(ctx, sliceModels); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch create slice failed, err: %v", err)))
	}

	defer func() {
		if err != nil { // set slice status
			if setStatusErr := k.sliceRepo.BatchSetStatus(ctx, allIDs, int32(model.SliceStatusFailed), err.Error()); setStatusErr != nil {
				logs.CtxErrorf(ctx, "[indexDocument] set slice status failed, err: %v", setStatusErr)
			}
		}
	}()

	// to vectorstore
	fields, err := k.mapSearchFields(doc)
	if err != nil {
		return err
	}
	indexingFields := getIndexingFields(fields)

	// reformat docs, mainly for enableCompactTable
	ssDocs, err := slices.TransformWithErrorCheck(sliceEntities, func(a *entity.Slice) (*schema.Document, error) {
		return k.slice2Document(ctx, doc, a)
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", fmt.Sprintf("reformat document failed, err: %v", err)))
	}
	progressbar := progressbar.NewProgressBar(ctx, doc.ID, int64(len(ssDocs)*len(k.searchStoreManagers)), k.cacheCli, true)
	for _, manager := range k.searchStoreManagers {
		now := time.Now()
		if err = manager.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields:         fields,
			CollectionMeta: nil,
		}); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("create search store failed, err: %v", err)))
		}
		// 图片型知识库kn:doc:slice = 1:n:n，可能content为空，不需要写入
		if doc.Type == knowledge.DocumentTypeImage && len(ssDocs) == 1 && len(ssDocs[0].Content) == 0 {
			continue
		}
		ss, err := manager.GetSearchStore(ctx, collectionName)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("get search store failed, err: %v", err)))
		}
		if _, err = ss.Store(ctx, ssDocs,
			searchstore.WithIndexerPartitionKey(fieldNameDocumentID),
			searchstore.WithPartition(strconv.FormatInt(doc.ID, 10)),
			searchstore.WithIndexingFields(indexingFields),
			searchstore.WithProgressBar(progressbar),
		); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("store search store failed, err: %v", err)))
		}
		logs.CtxDebugf(ctx, "[indexDocument] ss type=%v, len(docs)=%d, finished after %d ms",
			manager.GetType(), len(ssDocs), time.Now().Sub(now).Milliseconds())
	}
	// set slice status
	if err = k.sliceRepo.BatchSetStatus(ctx, allIDs, int32(model.SliceStatusDone), ""); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch set slice status failed, err: %v", err)))
	}

	// set document status

	if err = k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusEnable), ""); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("set document status failed, err: %v", err)))
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, event.Document.ID); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update document slice info failed, err: %v", err)))
	}
	return nil
}

func (k *knowledgeSVC) upsertDataToTable(ctx context.Context, tableInfo *entity.TableInfo, slices []*entity.Slice) (err error) {
	if len(slices) == 0 {
		return nil
	}
	insertData, err := packInsertData(slices)
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
		return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KVf("msg", "insert data failed, err: %v", err))
	}
	if resp.AffectedRows+resp.UnchangedRows != int64(len(slices)) {
		logs.CtxErrorf(ctx, "[insertDataToTable] insert data failed, affected rows: %d, expect: %d", resp.AffectedRows, len(slices))
		return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KVf("msg", "insert data failed, affected rows: %d, expect: %d", resp.AffectedRows, len(slices)))
	}
	return nil
}

func packInsertData(slices []*entity.Slice) (data []map[string]interface{}, err error) {
	defer func() {
		if r := recover(); r != nil {
			logs.Errorf("[packInsertData] panic: %v", r)
			err = errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "panic: %v", r))
			return
		}
	}()

	for i := range slices {
		dataMap := map[string]any{
			consts.RDBFieldID: slices[i].ID,
		}
		for j := range slices[i].RawContent[0].Table.Columns {
			val := slices[i].RawContent[0].Table.Columns[j]
			if val.ColumnName == consts.RDBFieldID {
				continue
			}
			physicalColumnName := convert.ColumnIDToRDBField(val.ColumnID)
			dataMap[physicalColumnName] = val.GetValue()
		}
		data = append(data, dataMap)
	}

	return data, nil
}

func (k *knowledgeSVC) indexSlice(ctx context.Context, event *entity.Event) (err error) {
	slice := event.Slice
	if slice == nil {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "slice not provided"))
	}
	if slice.ID == 0 {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "slice.id not set"))
	}
	if event.Document == nil {
		doc, err := k.documentRepo.GetByID(ctx, slice.DocumentID)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get document failed, err: %v", err)))
		}
		event.Document, err = k.fromModelDocument(ctx, doc)
		if err != nil {
			return err
		}
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

	indexingFields := getIndexingFields(fields)
	collectionName := getCollectionName(slice.KnowledgeID)
	for _, manager := range k.searchStoreManagers {
		ss, err := manager.GetSearchStore(ctx, collectionName)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("get search store failed, err: %v", err)))
		}

		doc, err := k.slice2Document(ctx, event.Document, slice)
		if err != nil {
			return err
		}

		if _, err = ss.Store(ctx, []*schema.Document{doc},
			searchstore.WithIndexerPartitionKey(fieldNameDocumentID),
			searchstore.WithPartition(strconv.FormatInt(event.Document.ID, 10)),
			searchstore.WithIndexingFields(indexingFields),
		); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("store search store failed, err: %v", err)))
		}
	}

	if err = k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusDone), ""); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch set slice status failed, err: %v", err)))
	}
	if err = k.documentRepo.UpdateDocumentSliceInfo(ctx, slice.DocumentID); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update document slice info failed, err: %v", err)))
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
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "review not provided"))
	}
	if review.ReviewID == nil {
		return errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "review.id not set"))
	}
	reviewModel, err := k.reviewRepo.GetByID(ctx, *review.ReviewID)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("get review failed, err: %v", err)))
	}
	if reviewModel.Status == int32(entity.ReviewStatus_Enable) {
		return nil
	}
	byteData, err := k.storage.GetObject(ctx, review.Uri)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeGetObjectFailCode, errorx.KV("msg", fmt.Sprintf("get object failed, err: %v", err)))
	}
	p, err := k.parseManager.GetParser(convert.DocumentToParseConfig(event.Document))
	if err != nil {
		return errorx.New(errno.ErrKnowledgeGetParserFailCode, errorx.KV("msg", fmt.Sprintf("get parser failed, err: %v", err)))
	}
	result, err := p.Parse(ctx, bytes.NewReader(byteData))
	if err != nil {
		return errorx.New(errno.ErrKnowledgeParserParseFailCode, errorx.KV("msg", fmt.Sprintf("parse document failed, err: %v", err)))
	}
	ids, err := k.genMultiIDs(ctx, len(result))
	if err != nil {
		return errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("GenMultiIDs failed, err: %v", err)))
	}
	fn, ok := d2sMapping[event.Document.Type]
	if !ok {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "convertFn is empty"))
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
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal chunk failed, err: %v", err)))
	}
	tosUri := fmt.Sprintf("DocReview/%d_%d_%d.txt", reviewModel.CreatorID, time.Now().UnixMilli(), *review.ReviewID)
	err = k.storage.PutObject(ctx, tosUri, chunksData, storage.WithContentType("text/plain; charset=utf-8"))
	if err != nil {
		return errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}
	return k.reviewRepo.UpdateReview(ctx, reviewModel.ID, map[string]interface{}{
		"status":         int32(entity.ReviewStatus_Enable),
		"chunk_resp_uri": tosUri,
	})
}

func (k *knowledgeSVC) mapSearchFields(doc *entity.Document) ([]*searchstore.Field, error) {
	fn, found := fMapping[doc.Type]
	if !found {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", fmt.Sprintf("document type invalid, type=%d", doc.Type)))
	}
	return fn(doc, k.enableCompactTable), nil
}

func (k *knowledgeSVC) slice2Document(ctx context.Context, src *entity.Document, slice *entity.Slice) (*schema.Document, error) {
	fn, found := s2dMapping[src.Type]
	if !found {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", fmt.Sprintf("document type invalid, type=%d", src.Type)))
	}
	return fn(ctx, slice, src.TableInfo.Columns, k.enableCompactTable)
}
