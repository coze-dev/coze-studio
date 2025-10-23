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

	knowledge "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/events"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/document/progressbar"
	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/rdb"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
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
	// Delete the data in each store of the knowledge base
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

type indexDocCacheRecord struct {
	ProcessingIDs       []int64
	LastProcessedNumber int64
	ParseUri            string
}

const (
	indexDocCacheKey = "index_doc_cache:%d:%d"
)

// indexDocumentNew handles the indexing of a new document into the knowledge system
func (k *knowledgeSVC) indexDocument(ctx context.Context, event *entity.Event) (err error) {
	doc := event.Document
	if doc == nil {
		return errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KV("reason", "[indexDocument] document not provided"))
	}

	// Validate document and knowledge status
	var valid bool
	if valid, err = k.validateDocumentStatus(ctx, doc); err != nil || !valid {
		return
	}

	// Setup error handling and recovery
	defer k.handleIndexingErrors(ctx, event, &err)

	// Start indexing process
	if err = k.beginIndexingProcess(ctx, doc); err != nil {
		return
	}

	// Process document parsing and chunking
	var parseResult []*schema.Document
	var cacheRecord *indexDocCacheRecord
	parseResult, cacheRecord, err = k.processDocumentParsing(ctx, doc)
	if err != nil {
		return
	}
	if cacheRecord.LastProcessedNumber == 0 {
		if err = k.cleanupPreviousProcessing(ctx, doc); err != nil {
			return
		}
	}
	// Handle table-type documents specially
	if doc.Type == knowledge.DocumentTypeTable {
		if err = k.handleTableDocument(ctx, doc, parseResult); err != nil {
			return
		}
	}

	// Process document chunks in batches
	if err = k.processDocumentChunks(ctx, doc, parseResult, cacheRecord); err != nil {
		return
	}

	// Finalize document indexing
	err = k.finalizeDocumentIndexing(ctx, event.Document.KnowledgeID, event.Document.ID)
	return
}

// validateDocumentStatus checks if the document can be indexed
func (k *knowledgeSVC) validateDocumentStatus(ctx context.Context, doc *entity.Document) (bool, error) {
	valid, err := k.isWritableKnowledgeAndDocument(ctx, doc.KnowledgeID, doc.ID)
	if err != nil {
		return false, err
	}
	if !valid {
		return false, errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KVf("reason", "[indexDocument] not writable, knowledge_id=%d, document_id=%d",
				doc.KnowledgeID, doc.ID))
	}
	return true, nil
}

// handleIndexingErrors manages errors and recovery during indexing
func (k *knowledgeSVC) handleIndexingErrors(ctx context.Context, event *entity.Event, err *error) {
	if e := recover(); e != nil {
		err = ptr.Of(errorx.New(errno.ErrKnowledgeSystemCode,
			errorx.KV("msg", fmt.Sprintf("panic: %v", e))))
		logs.CtxErrorf(ctx, "[indexDocument] panic, err: %v", err)
		k.setDocumentStatus(ctx, event.Document.ID,
			int32(entity.DocumentStatusFailed), ptr.From(err).Error())
		return
	}

	if ptr.From(err) != nil {
		var status int32
		var errMsg string

		var statusError errorx.StatusError
		if errors.As(ptr.From(err), &statusError) {
			errMsg = errorx.ErrorWithoutStack(statusError)
			if statusError.Code() == errno.ErrKnowledgeNonRetryableCode {
				status = int32(entity.DocumentStatusFailed)
			} else {
				status = int32(entity.DocumentStatusChunking)
			}
		} else {
			errMsg = ptr.From(err).Error()
			status = int32(entity.DocumentStatusChunking)
		}

		k.setDocumentStatus(ctx, event.Document.ID, status, errMsg)
	}
}

// beginIndexingProcess starts the indexing process
func (k *knowledgeSVC) beginIndexingProcess(ctx context.Context, doc *entity.Document) error {
	err := k.documentRepo.SetStatus(ctx, doc.ID, int32(entity.DocumentStatusChunking), "")
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("set document status failed, err: %v", err)))
	}
	return nil
}

// processDocumentParsing handles document parsing and caching
func (k *knowledgeSVC) processDocumentParsing(ctx context.Context, doc *entity.Document) (
	[]*schema.Document, *indexDocCacheRecord, error) {

	cacheKey := fmt.Sprintf(indexDocCacheKey, doc.KnowledgeID, doc.ID)
	cacheRecord := &indexDocCacheRecord{}

	// Try to get cached parse results
	val, err := k.cacheCli.Get(ctx, cacheKey).Result()
	if err == nil {
		if err = sonic.UnmarshalString(val, &cacheRecord); err != nil {
			return nil, nil, errorx.New(errno.ErrKnowledgeParseJSONCode,
				errorx.KV("msg", fmt.Sprintf("parse cache record failed, err: %v", err)))
		}
	}

	// Parse document if not cached
	if err != nil || len(cacheRecord.ParseUri) == 0 {
		return k.parseAndCacheDocument(ctx, doc, cacheRecord, cacheKey)
	}

	// Load parse results from cache
	return k.loadParsedDocument(ctx, cacheRecord)
}

// parseAndCacheDocument parses the document and caches the results
func (k *knowledgeSVC) parseAndCacheDocument(ctx context.Context, doc *entity.Document,
	cacheRecord *indexDocCacheRecord, cacheKey string) ([]*schema.Document, *indexDocCacheRecord, error) {

	// Get document content from storage
	bodyBytes, err := k.storage.GetObject(ctx, doc.URI)
	if err != nil {
		return nil, nil, errorx.New(errno.ErrKnowledgeGetObjectFailCode,
			errorx.KV("msg", fmt.Sprintf("get object failed, err: %v", err)))
	}

	// Get appropriate parser for document type
	docParser, err := k.parseManager.GetParser(convert.DocumentToParseConfig(doc))
	if err != nil {
		return nil, nil, errorx.New(errno.ErrKnowledgeGetParserFailCode,
			errorx.KV("msg", fmt.Sprintf("get parser failed, err: %v", err)))
	}

	// Parse document content
	parseResult, err := docParser.Parse(ctx, bytes.NewReader(bodyBytes), parser.WithExtraMeta(map[string]any{
		document.MetaDataKeyCreatorID: doc.CreatorID,
		document.MetaDataKeyExternalStorage: map[string]any{
			"document_id": doc.ID,
		},
	}))
	if err != nil {
		return nil, nil, errorx.New(errno.ErrKnowledgeParserParseFailCode,
			errorx.KV("msg", fmt.Sprintf("parse document failed, err: %v", err)))
	}

	// Cache parse results
	if err := k.cacheParseResults(ctx, doc, parseResult, cacheRecord, cacheKey); err != nil {
		return nil, nil, err
	}

	return parseResult, cacheRecord, nil
}

// cacheParseResults stores parse results in persistent storage and cache
func (k *knowledgeSVC) cacheParseResults(ctx context.Context, doc *entity.Document,
	parseResult []*schema.Document, cacheRecord *indexDocCacheRecord, cacheKey string) error {

	parseResultData, err := sonic.Marshal(parseResult)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeParseJSONCode,
			errorx.KV("msg", fmt.Sprintf("marshal parse result failed, err: %v", err)))
	}

	fileName := fmt.Sprintf("FileBizType.Knowledge/%d_%d.txt", doc.CreatorID, doc.ID)
	if err = k.storage.PutObject(ctx, fileName, parseResultData); err != nil {
		return errorx.New(errno.ErrKnowledgePutObjectFailCode,
			errorx.KV("msg", fmt.Sprintf("put object failed, err: %v", err)))
	}

	cacheRecord.ParseUri = fileName
	return k.recordIndexDocumentStatus(ctx, cacheRecord, cacheKey)
}

// loadParsedDocument loads previously parsed document from cache
func (k *knowledgeSVC) loadParsedDocument(ctx context.Context,
	cacheRecord *indexDocCacheRecord) ([]*schema.Document, *indexDocCacheRecord, error) {

	data, err := k.storage.GetObject(ctx, cacheRecord.ParseUri)
	if err != nil {
		return nil, nil, errorx.New(errno.ErrKnowledgeGetObjectFailCode,
			errorx.KV("msg", fmt.Sprintf("get object failed, err: %v", err)))
	}

	var parseResult []*schema.Document
	if err = sonic.Unmarshal(data, &parseResult); err != nil {
		return nil, nil, errorx.New(errno.ErrKnowledgeParseJSONCode,
			errorx.KV("msg", fmt.Sprintf("marshal parse result failed, err: %v", err)))
	}

	return parseResult, cacheRecord, nil
}

// handleTableDocument handles special processing for table-type documents
func (k *knowledgeSVC) handleTableDocument(ctx context.Context,
	doc *entity.Document, parseResult []*schema.Document) error {

	noData, err := document.GetDocumentsColumnsOnly(parseResult)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeNonRetryableCode,
			errorx.KVf("reason", "[indexDocument] get table data status failed, err: %v", err))
	}
	if noData {
		parseResult = nil // clear parse result
	}
	return nil
}

// processDocumentChunks processes document chunks in batches
func (k *knowledgeSVC) processDocumentChunks(ctx context.Context,
	doc *entity.Document, parseResult []*schema.Document, cacheRecord *indexDocCacheRecord) error {

	batchSize := 100
	progressbar := progressbar.New(ctx, doc.ID,
		int64(len(parseResult)*len(k.searchStoreManagers)), k.cacheCli, true)

	if err := progressbar.AddN(int(cacheRecord.LastProcessedNumber) * len(k.searchStoreManagers)); err != nil {
		return errorx.New(errno.ErrKnowledgeSystemCode,
			errorx.KV("msg", fmt.Sprintf("add progress bar failed, err: %v", err)))
	}

	// Process chunks in batches
	for i := int(cacheRecord.LastProcessedNumber); i < len(parseResult); i += batchSize {
		chunks := parseResult[i:min(i+batchSize, len(parseResult))]
		if err := k.batchProcessSlice(ctx, doc, i, chunks, cacheRecord, progressbar); err != nil {
			return err
		}
	}

	return nil
}

// finalizeDocumentIndexing completes the document indexing process
func (k *knowledgeSVC) finalizeDocumentIndexing(ctx context.Context, knowledgeID, documentID int64) error {
	if err := k.documentRepo.SetStatus(ctx, documentID, int32(entity.DocumentStatusEnable), ""); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("set document status failed, err: %v", err)))
	}
	if err := k.documentRepo.UpdateDocumentSliceInfo(ctx, documentID); err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update document slice info failed, err: %v", err)))
	}
	if err := k.cacheCli.Del(ctx, fmt.Sprintf(indexDocCacheKey, knowledgeID, documentID)).Err(); err != nil {
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", fmt.Sprintf("del cache failed, err: %v", err)))
	}
	return nil
}

// batchProcessSlice processes a batch of document slices
func (k *knowledgeSVC) batchProcessSlice(ctx context.Context, doc *entity.Document,
	startIdx int, parseResult []*schema.Document, cacheRecord *indexDocCacheRecord,
	progressBar progressbar.ProgressBar) error {

	collectionName := getCollectionName(doc.KnowledgeID)
	length := len(parseResult)
	var ids []int64
	var err error
	// Generate IDs for this batch
	if len(cacheRecord.ProcessingIDs) == 0 {
		ids, err = k.genMultiIDs(ctx, length)
		if err != nil {
			return err
		}
	} else {
		ids = cacheRecord.ProcessingIDs
	}
	for idx := range parseResult {
		parseResult[idx].ID = strconv.FormatInt(ids[idx], 10)
	}
	// Update cache record with processing IDs
	cacheRecord.ProcessingIDs = ids
	if err := k.recordIndexDocumentStatus(ctx, cacheRecord,
		fmt.Sprintf(indexDocCacheKey, doc.KnowledgeID, doc.ID)); err != nil {
		return err
	}

	// Convert documents to slices
	sliceEntities, err := k.convertToSlices(doc, parseResult)
	if err != nil {
		return err
	}

	// Handle table-type documents
	if doc.Type == knowledge.DocumentTypeTable {
		if err := k.upsertDataToTable(ctx, &doc.TableInfo, sliceEntities); err != nil {
			logs.CtxErrorf(ctx, "[indexDocument] insert data to table failed, err: %v", err)
			return err
		}
	}

	// Store slices in database

	if err := k.storeSlicesInDB(ctx, doc, parseResult, startIdx, ids); err != nil {
		return err
	}

	// Index slices in search stores
	if err := k.indexSlicesInSearchStores(ctx, doc, collectionName, sliceEntities,
		cacheRecord, progressBar); err != nil {
		return err
	}

	// Update cache record after successful processing
	cacheRecord.LastProcessedNumber = int64(startIdx) + int64(length)
	cacheRecord.ProcessingIDs = nil

	// Mark slices as done
	err = k.sliceRepo.BatchSetStatus(ctx, ids, int32(model.SliceStatusDone), "")
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("batch set slice status failed, err: %v", err)))
	}

	if err := k.recordIndexDocumentStatus(ctx, cacheRecord,
		fmt.Sprintf(indexDocCacheKey, doc.KnowledgeID, doc.ID)); err != nil {
		return err
	}

	return nil
}

// convertToSlices converts parsed documents to slice entities
func (k *knowledgeSVC) convertToSlices(doc *entity.Document, parseResult []*schema.Document) ([]*entity.Slice, error) {

	convertFn := d2sMapping[doc.Type]
	if convertFn == nil {
		return nil, errorx.New(errno.ErrKnowledgeSystemCode,
			errorx.KV("msg", "convertFn is empty"))
	}

	return slices.TransformWithErrorCheck(parseResult, func(a *schema.Document) (*entity.Slice, error) {
		return convertFn(a, doc.KnowledgeID, doc.ID, doc.CreatorID)
	})
}

// cleanupPreviousProcessing cleans up partially processed data from previous attempts
func (k *knowledgeSVC) cleanupPreviousProcessing(ctx context.Context, doc *entity.Document) error {
	collectionName := getCollectionName(doc.KnowledgeID)
	if doc.IsAppend || doc.Type == knowledge.DocumentTypeImage {
		return nil
	}
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
			if err := s.Delete(ctx, slices.Transform(ids, func(id int64) string {
				return strconv.FormatInt(id, 10)
			})); err != nil {
				logs.Errorf("[indexDocument] delete knowledge failed, err: %v", err)
				return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", fmt.Sprintf("delete search store failed, err: %v", err)))
			}
		}
	}
	if doc.Type == knowledge.DocumentTypeTable {
		_, err := k.rdb.DeleteData(ctx, &rdb.DeleteDataRequest{
			TableName: doc.TableInfo.PhysicalTableName,
			Where: &rdb.ComplexCondition{
				Conditions: []*rdb.Condition{
					{
						Field:    consts.RDBFieldID,
						Operator: rdbEntity.OperatorIn,
						Value:    ids,
					},
				},
			},
		})
		if err != nil {
			logs.CtxErrorf(ctx, "delete data failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
		}
	}
	return nil
}

// storeSlicesInDB stores slice data in the database
func (k *knowledgeSVC) storeSlicesInDB(ctx context.Context, doc *entity.Document,
	parseResult []*schema.Document, startIdx int, ids []int64) error {

	var seqOffset float64
	var err error

	if doc.IsAppend {
		seqOffset, err = k.sliceRepo.GetLastSequence(ctx, doc.ID)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode,
				errorx.KV("msg", fmt.Sprintf("get last sequence failed, err: %v", err)))
		}
		seqOffset += 1
	}
	if doc.Type == knowledge.DocumentTypeImage {
		if len(parseResult) != 0 {
			slices, _, err := k.sliceRepo.FindSliceByCondition(ctx, &entity.WhereSliceOpt{DocumentID: doc.ID})
			if err != nil {
				return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("find slice failed, err: %v", err)))
			}
			var slice *model.KnowledgeDocumentSlice
			if len(slices) > 0 {
				slice = slices[0]
				slice.Content = parseResult[0].Content
			} else {
				id, err := k.idgen.GenID(ctx)
				if err != nil {
					return errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", fmt.Sprintf("GenID failed, err: %v", err)))
				}
				slice = &model.KnowledgeDocumentSlice{
					ID:          id,
					KnowledgeID: doc.KnowledgeID,
					DocumentID:  doc.ID,
					Content:     parseResult[0].Content,
					CreatedAt:   time.Now().UnixMilli(),
					UpdatedAt:   time.Now().UnixMilli(),
					CreatorID:   doc.CreatorID,
					SpaceID:     doc.SpaceID,
					Status:      int32(model.SliceStatusProcessing),
					FailReason:  "",
				}
			}
			if err = k.sliceRepo.Update(ctx, slice); err != nil {
				return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", fmt.Sprintf("update slice failed, err: %v", err)))
			}
		}
		return nil
	}
	sliceModels := make([]*model.KnowledgeDocumentSlice, 0, len(parseResult))
	for i, src := range parseResult {
		now := time.Now().UnixMilli()
		sliceModel := &model.KnowledgeDocumentSlice{
			ID:          ids[i],
			KnowledgeID: doc.KnowledgeID,
			DocumentID:  doc.ID,
			Content:     parseResult[i].Content,
			Sequence:    seqOffset + float64(i+startIdx),
			CreatedAt:   now,
			UpdatedAt:   now,
			CreatorID:   doc.CreatorID,
			SpaceID:     doc.SpaceID,
			Status:      int32(model.SliceStatusProcessing),
			FailReason:  "",
		}

		if doc.Type == knowledge.DocumentTypeTable {
			convertFn := d2sMapping[doc.Type]
			sliceEntity, err := convertFn(src, doc.KnowledgeID, doc.ID, doc.CreatorID)
			if err != nil {
				logs.CtxErrorf(ctx, "[indexDocument] convert document failed, err: %v", err)
				return errorx.New(errno.ErrKnowledgeSystemCode,
					errorx.KV("msg", fmt.Sprintf("convert document failed, err: %v", err)))
			}
			sliceModel.Content = sliceEntity.GetSliceContent()
		}

		sliceModels = append(sliceModels, sliceModel)
	}

	err = k.sliceRepo.BatchCreate(ctx, sliceModels)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode,
			errorx.KV("msg", fmt.Sprintf("batch create slice failed, err: %v", err)))
	}
	return nil
}

// indexSlicesInSearchStores indexes slices in appropriate search stores
func (k *knowledgeSVC) indexSlicesInSearchStores(ctx context.Context, doc *entity.Document,
	collectionName string, sliceEntities []*entity.Slice, cacheRecord *indexDocCacheRecord,
	progressBar progressbar.ProgressBar) error {

	fields, err := k.mapSearchFields(doc)
	if err != nil {
		return err
	}
	indexingFields := getIndexingFields(fields)

	// Convert slices to search documents
	ssDocs, err := slices.TransformWithErrorCheck(sliceEntities, func(a *entity.Slice) (*schema.Document, error) {
		return k.slice2Document(ctx, doc, a)
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeSystemCode,
			errorx.KV("msg", fmt.Sprintf("reformat document failed, err: %v", err)))
	}

	// Skip if it's an image document with empty content
	if doc.Type == knowledge.DocumentTypeImage && len(ssDocs) == 1 && len(ssDocs[0].Content) == 0 {
		return nil
	}

	// Index in each search store manager
	for _, manager := range k.searchStoreManagers {
		now := time.Now()
		if err := manager.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields:         fields,
			CollectionMeta: nil,
		}); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode,
				errorx.KV("msg", fmt.Sprintf("create search store failed, err: %v", err)))
		}

		ss, err := manager.GetSearchStore(ctx, collectionName)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode,
				errorx.KV("msg", fmt.Sprintf("get search store failed, err: %v", err)))
		}

		if _, err = ss.Store(ctx, ssDocs,
			searchstore.WithIndexerPartitionKey(fieldNameDocumentID),
			searchstore.WithPartition(strconv.FormatInt(doc.ID, 10)),
			searchstore.WithIndexingFields(indexingFields),
			searchstore.WithProgressBar(progressBar),
		); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode,
				errorx.KV("msg", fmt.Sprintf("store search store failed, err: %v", err)))
		}

		logs.CtxDebugf(ctx, "[indexDocument] ss type=%v, len(docs)=%d, finished after %d ms",
			manager.GetType(), len(ssDocs), time.Now().Sub(now).Milliseconds())
		if err := k.recordIndexDocumentStatus(ctx, cacheRecord,
			fmt.Sprintf(indexDocCacheKey, doc.KnowledgeID, doc.ID)); err != nil {
			return err
		}
	}

	return nil
}

// setDocumentStatus updates document status with error handling
func (k *knowledgeSVC) setDocumentStatus(ctx context.Context, docID int64, status int32, errMsg string) {
	if setStatusErr := k.documentRepo.SetStatus(ctx, docID, status, errMsg); setStatusErr != nil {
		logs.CtxErrorf(ctx, "[indexDocument] set document status failed, err: %v", setStatusErr)
	}
}

func (k *knowledgeSVC) recordIndexDocumentStatus(ctx context.Context, r *indexDocCacheRecord, cacheKey string) error {
	data, err := sonic.Marshal(r)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeParseJSONCode, errorx.KV("msg", fmt.Sprintf("marshal parse result failed, err: %v", err)))
	}
	err = k.cacheCli.Set(ctx, cacheKey, data, time.Hour*2).Err()
	if err != nil {
		return errorx.New(errno.ErrKnowledgeCacheClientSetFailCode, errorx.KV("msg", fmt.Sprintf("set cache failed, err: %v", err)))
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
