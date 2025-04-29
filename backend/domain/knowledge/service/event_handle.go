package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/bytedance/sonic"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/searchstore"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
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
	ids, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{doc.ID})
	if err != nil {
		return err
	}
	if len(ids) > 0 {
		if err = k.sliceRepo.DeleteByDocument(ctx, doc.ID); err != nil {
			return err
		}

		for _, store := range k.searchStores {
			if err = store.Delete(ctx, doc.KnowledgeID, ids); err != nil {
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
	reader := bytes.NewReader(bodyBytes)

	parseResult, err := k.parser.Parse(ctx, reader, doc)
	if err != nil {
		return err
	}

	// save slices
	const maxBatchSize = 100
	total := len(parseResult.Slices)
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

	if doc.Type == entity.DocumentTypeTable {
		// 表格类型，将数据插入到数据库中
		err = k.upsertDataToTable(ctx, &doc.TableInfo, parseResult.Slices, ids)
		if err != nil {
			logs.CtxErrorf(ctx, "[indexDocument] insert data to table failed, err: %v", err)
			return err
		}
	}
	slices := make([]*model.KnowledgeDocumentSlice, 0, len(parseResult.Slices))
	for i := range parseResult.Slices {
		now := time.Now().UnixMilli()
		slices = append(slices, &model.KnowledgeDocumentSlice{
			ID:          ids[i],
			KnowledgeID: doc.KnowledgeID,
			DocumentID:  doc.ID,
			Content:     parseResult.Slices[i].PlainText,
			Sequence:    float64(i),
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
			TableColumns: doc.TableInfo.Columns,
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

func (k *knowledgeSVC) upsertDataToTable(ctx context.Context, tableInfo *entity.TableInfo, slices []*entity.Slice, sliceIDs []int64) (err error) {
	if len(slices) == 0 {
		logs.CtxWarnf(ctx, "[insertDataToTable] slices not provided")
		return nil
	}
	if len(sliceIDs) != len(slices) {
		return errors.New("slice ids length not equal slices length")
	}
	insertData := packInsertData(tableInfo, slices, sliceIDs)
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

func packInsertData(tableInfo *entity.TableInfo, slices []*entity.Slice, ids []int64) (data []map[string]interface{}) {
	columnMap := make(map[string]int64, len(tableInfo.Columns))
	for i := range tableInfo.Columns {
		columnMap[tableInfo.Columns[i].Name] = tableInfo.Columns[i].ID
	}
	for i := range slices {
		dataMap := map[string]interface{}{
			consts.RDBFieldID: ids[i],
		}
		for j := range slices[i].RawContent[0].Table.Columns {
			physicalColumnName := convert.ColumnIDToRDBField(columnMap[slices[i].RawContent[0].Table.Columns[j].ColumnName])
			dataMap[physicalColumnName] = slices[i].RawContent[0].Table.Columns[j].GetValue()
		}
		data = append(data, dataMap)
	}
	return data
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
			TableColumns: event.Document.TableInfo.Columns,
		}); err != nil {
			return err
		}
	}

	if err = k.sliceRepo.BatchSetStatus(ctx, []int64{slice.ID}, int32(model.SliceStatusDone), ""); err != nil {
		return err
	}

	return nil
}
