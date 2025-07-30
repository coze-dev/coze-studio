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
	"context"
	"errors"
	"strconv"
	"sync"
	"time"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/schema"
	"golang.org/x/sync/errgroup"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossdatacopy"
	"github.com/coze-dev/coze-studio/backend/domain/datacopy"
	copyEntity "github.com/coze-dev/coze-studio/backend/domain/datacopy/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context, request *CopyKnowledgeRequest) (*CopyKnowledgeResponse, error) {
	if request == nil {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "request is empty"))
	}
	if len(request.TaskUniqKey) == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "task uniq key is empty"))
	}
	if request.KnowledgeID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeInvalidParamCode, errorx.KV("msg", "knowledge id is empty"))
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if kn == nil || kn.ID == 0 {
		return nil, errorx.New(errno.ErrKnowledgeNotExistCode, errorx.KV("msg", "knowledge not exist"))
	}
	newID, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeIDGenCode)
	}
	copyTaskEntity := copyEntity.CopyDataTask{
		TaskUniqKey:   request.TaskUniqKey,
		OriginDataID:  request.KnowledgeID,
		TargetDataID:  newID,
		OriginSpaceID: kn.SpaceID,
		TargetSpaceID: request.TargetSpaceID,
		OriginUserID:  kn.CreatorID,
		TargetUserID:  request.TargetUserID,
		OriginAppID:   kn.AppID,
		TargetAppID:   request.TargetAppID,
		DataType:      copyEntity.DataTypeKnowledge,
		StartTime:     time.Now().UnixMilli(),
		FinishTime:    0,
		ExtInfo:       "",
		ErrorMsg:      "",
		Status:        copyEntity.DataCopyTaskStatusCreate,
	}
	checkResult, err := crossdatacopy.DefaultSVC().CheckAndGenCopyTask(ctx, &datacopy.CheckAndGenCopyTaskReq{Task: &copyTaskEntity})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
	}
	switch checkResult.CopyTaskStatus {
	case copyEntity.DataCopyTaskStatusSuccess:
		return &CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledgeModel.CopyStatus_Successful,
			ErrMsg:            "",
		}, nil
	case copyEntity.DataCopyTaskStatusInProgress:
		return &CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledgeModel.CopyStatus_Processing,
			ErrMsg:            "",
		}, nil
	case copyEntity.DataCopyTaskStatusFail:
		return &CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledgeModel.CopyStatus_Failed,
			ErrMsg:            checkResult.FailReason,
		}, nil
	}
	copyResp, err := k.copyDo(ctx, &knowledgeCopyCtx{
		OriginData: kn,
		CopyTask:   &copyTaskEntity,
	})
	if err != nil {
		return nil, err
	}
	return copyResp, nil
}

func (k *knowledgeSVC) copyDo(ctx context.Context, copyCtx *knowledgeCopyCtx) (*CopyKnowledgeResponse, error) {
	var err error
	defer func() {
		if e := recover(); e != nil {
			logs.CtxErrorf(ctx, "copy knowledge failed, err: %v", e)
			err = errorx.New(errno.ErrKnowledgeSystemCode, errorx.KVf("msg", "panic: %v", e))
		}
		if err != nil {
			deleteErr := k.DeleteKnowledge(ctx, &DeleteKnowledgeRequest{KnowledgeID: copyCtx.CopyTask.TargetDataID})
			if deleteErr != nil {
				logs.CtxErrorf(ctx, "delete knowledge failed, err: %v", deleteErr)
			}
			if len(copyCtx.NewRDBTableNames) != 0 {
				for i := range copyCtx.NewRDBTableNames {
					_, dropErr := k.rdb.DropTable(ctx, &rdb.DropTableRequest{
						TableName: copyCtx.NewRDBTableNames[i],
						IfExists:  true,
					})
					if dropErr != nil {
						logs.CtxErrorf(ctx, "[copyDo] drop table failed, err: %v", dropErr)
					}
				}
			}
			copyCtx.CopyTask.Status = copyEntity.DataCopyTaskStatusFail
			err = crossdatacopy.DefaultSVC().UpdateCopyTask(ctx, &datacopy.UpdateCopyTaskReq{Task: copyCtx.CopyTask})
			if err != nil {
				logs.CtxErrorf(ctx, "update copy task failed, err: %v", err)
			}
		}
	}()
	copyCtx.CopyTask.Status = copyEntity.DataCopyTaskStatusInProgress
	err = crossdatacopy.DefaultSVC().UpdateCopyTask(ctx, &datacopy.UpdateCopyTaskReq{Task: copyCtx.CopyTask})
	if err != nil {
		return nil, errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
	}
	err = k.copyKnowledge(ctx, copyCtx)
	if err != nil {
		logs.CtxErrorf(ctx, "copy knowledge failed, err: %v", err)
		return nil, err
	}
	err = k.copyKnowledgeDocuments(ctx, copyCtx)
	if err != nil {
		return nil, err
	}
	copyCtx.CopyTask.FinishTime = time.Now().UnixMilli()
	copyCtx.CopyTask.Status = copyEntity.DataCopyTaskStatusSuccess
	err = crossdatacopy.DefaultSVC().UpdateCopyTask(ctx, &datacopy.UpdateCopyTaskReq{Task: copyCtx.CopyTask})
	if err != nil {
		logs.CtxWarnf(ctx, "update copy task failed, err: %v", err)
	}
	return &CopyKnowledgeResponse{
		OriginKnowledgeID: copyCtx.OriginData.ID,
		TargetKnowledgeID: copyCtx.CopyTask.TargetDataID,
		CopyStatus:        knowledgeModel.CopyStatus_Successful,
		ErrMsg:            "",
	}, nil
}

func (k *knowledgeSVC) copyKnowledge(ctx context.Context, copyCtx *knowledgeCopyCtx) error {
	copyKnowledgeInfo := model.Knowledge{
		ID:          copyCtx.CopyTask.TargetDataID,
		Name:        copyCtx.OriginData.Name,
		AppID:       copyCtx.CopyTask.TargetAppID,
		CreatorID:   copyCtx.CopyTask.TargetUserID,
		SpaceID:     copyCtx.CopyTask.TargetSpaceID,
		CreatedAt:   time.Now().UnixMilli(),
		UpdatedAt:   time.Now().UnixMilli(),
		Status:      int32(knowledgeModel.KnowledgeStatusEnable),
		Description: copyCtx.OriginData.Description,
		IconURI:     copyCtx.OriginData.IconURI,
		FormatType:  copyCtx.OriginData.FormatType,
	}
	err := k.knowledgeRepo.Upsert(ctx, &copyKnowledgeInfo)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	return nil
}

func (k *knowledgeSVC) copyKnowledgeDocuments(ctx context.Context, copyCtx *knowledgeCopyCtx) (err error) {
	// Query document information (only processed documents)
	documents, _, err := k.documentRepo.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
		KnowledgeIDs: []int64{copyCtx.OriginData.ID},
		StatusIn:     []int32{int32(entity.DocumentStatusEnable), int32(entity.DocumentStatusInit)},
		SelectAll:    true,
	})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	if len(documents) == 0 {
		logs.CtxInfof(ctx, "knowledge %d has no document", copyCtx.OriginData.ID)
		return nil
	}

	// create search store collections
	docItem, err := k.fromModelDocument(ctx, documents[0])
	if err != nil {
		return err
	}
	fields, err := k.mapSearchFields(docItem)
	if err != nil {
		return err
	}
	collectionName := getCollectionName(copyCtx.CopyTask.TargetDataID)
	for _, ssMgr := range k.searchStoreManagers {
		if err = ssMgr.Create(ctx, &searchstore.CreateRequest{
			CollectionName: collectionName,
			Fields:         fields,
			CollectionMeta: nil,
		}); err != nil {
			return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", err.Error()))
		}
	}

	targetDocuments, _, err := k.documentRepo.FindDocumentByCondition(ctx, &entity.WhereDocumentOpt{
		KnowledgeIDs: []int64{copyCtx.CopyTask.TargetDataID},
		SelectAll:    true,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find target document failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	for i := range targetDocuments {
		err = k.DeleteDocument(ctx, &DeleteDocumentRequest{DocumentID: targetDocuments[i].ID})
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
	}
	// table copy
	eg := errgroup.Group{}
	eg.SetLimit(10)
	mu := sync.Mutex{}
	var failList []int64

	newIDs, err := k.genMultiIDs(ctx, len(documents))
	if err != nil {
		logs.CtxErrorf(ctx, "gen document id failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeIDGenCode)
	}

	for i := range documents {
		doc := documents[i]
		newID := newIDs[i]

		eg.Go(func() error {
			cpErr := k.copyDocument(ctx, copyCtx, doc, newID)
			if cpErr != nil {
				mu.Lock()
				failList = append(failList, doc.ID)
				mu.Unlock()
				logs.CtxErrorf(ctx, "copy document failed, src document id: %d, new id: %d, err: %v", doc.ID, newID, err)
				return cpErr
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		logs.CtxErrorf(ctx, "copy document failed, document ids: %v, first-err: %v", failList, err)
		return errorx.New(errno.ErrKnowledgeCopyFailCode, errorx.KV("msg", err.Error()))
	}

	return nil
}

func (k *knowledgeSVC) copyDocument(ctx context.Context, copyCtx *knowledgeCopyCtx, doc *model.KnowledgeDocument, newDocID int64) (err error) {
	// tabular document replication
	newDoc := model.KnowledgeDocument{
		ID:            newDocID,
		KnowledgeID:   copyCtx.CopyTask.TargetDataID,
		Name:          doc.Name,
		FileExtension: doc.FileExtension,
		DocumentType:  doc.DocumentType,
		URI:           doc.URI,
		Size:          doc.Size,
		SliceCount:    doc.SliceCount,
		CharCount:     doc.CharCount,
		CreatorID:     copyCtx.CopyTask.TargetUserID,
		SpaceID:       copyCtx.CopyTask.TargetSpaceID,
		CreatedAt:     time.Now().UnixMilli(),
		UpdatedAt:     time.Now().UnixMilli(),
		SourceType:    doc.SourceType,
		Status:        int32(entity.DocumentStatusChunking),
		FailReason:    "",
		ParseRule:     doc.ParseRule,
	}
	columnMap := map[int64]int64{}
	// If it is a tabular knowledge base - > create a new table
	if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
		if doc.TableInfo != nil {
			newTableInfo := entity.TableInfo{}
			data, err := sonic.Marshal(doc.TableInfo)
			if err != nil {
				return err
			}
			err = sonic.Unmarshal(data, &newTableInfo)
			if err != nil {
				return err
			}
			newDoc.TableInfo = &newTableInfo
		}
		err = k.createTable(ctx, &newDoc)
		if err != nil {
			return err
		}
		newColumnName2IDMap := map[string]int64{}
		for i := range newDoc.TableInfo.Columns {
			newColumnName2IDMap[newDoc.TableInfo.Columns[i].Name] = newDoc.TableInfo.Columns[i].ID
		}
		oldColumnName2IDMap := map[string]int64{}
		for i := range doc.TableInfo.Columns {
			oldColumnName2IDMap[doc.TableInfo.Columns[i].Name] = doc.TableInfo.Columns[i].ID
			newDoc.TableInfo.Columns[i].ID = newColumnName2IDMap[doc.TableInfo.Columns[i].Name]
		}
		for i := range doc.TableInfo.Columns {
			columnMap[oldColumnName2IDMap[doc.TableInfo.Columns[i].Name]] = newDoc.TableInfo.Columns[i].ID
		}
		copyCtx.NewRDBTableNames = append(copyCtx.NewRDBTableNames, newDoc.TableInfo.PhysicalTableName)
	}

	docEntity, err := k.fromModelDocument(ctx, &newDoc)
	if err != nil {
		return err
	}
	fields, err := k.mapSearchFields(docEntity)
	if err != nil {
		logs.CtxErrorf(ctx, "map search fields failed, err: %v", err)
		return errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", err.Error()))
	}
	indexingFields := getIndexingFields(fields)
	collectionName := getCollectionName(newDoc.KnowledgeID)

	sliceIDs, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{doc.ID})
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	err = k.documentRepo.Create(ctx, &newDoc)
	if err != nil {
		return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
	}
	defer func() {
		status := int32(entity.DocumentStatusEnable)
		msg := ""
		if err != nil {
			status = int32(entity.DocumentStatusFailed)
			msg = err.Error()
		}
		updateErr := k.documentRepo.SetStatus(ctx, newDoc.ID, status, msg)
		if updateErr != nil {
			logs.CtxErrorf(ctx, "update document status failed, err: %v", updateErr)
		}
	}()
	batchSize := 100
	for i := 0; i < len(sliceIDs); i += batchSize {
		end := i + batchSize
		if end > len(sliceIDs) {
			end = len(sliceIDs)
		}
		sliceInfo, err := k.sliceRepo.MGetSlices(ctx, sliceIDs[i:end])
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		newSliceModels := make([]*model.KnowledgeDocumentSlice, 0)
		newSliceIDs, err := k.genMultiIDs(ctx, len(sliceInfo))
		if err != nil {
			return errorx.New(errno.ErrKnowledgeIDGenCode, errorx.KV("msg", err.Error()))
		}
		old2NewIDMap := map[int64]int64{}
		newMap := map[int64]*model.KnowledgeDocumentSlice{}
		for t := range sliceInfo {
			old2NewIDMap[sliceInfo[t].ID] = newSliceIDs[t]
			newSliceModel := model.KnowledgeDocumentSlice{
				ID:          old2NewIDMap[sliceInfo[t].ID],
				KnowledgeID: copyCtx.CopyTask.TargetDataID,
				DocumentID:  newDocID,
				Content:     sliceInfo[t].Content,
				Sequence:    sliceInfo[t].Sequence,
				CreatedAt:   time.Now().UnixMilli(),
				UpdatedAt:   time.Now().UnixMilli(),
				CreatorID:   copyCtx.CopyTask.TargetUserID,
				SpaceID:     copyCtx.CopyTask.TargetSpaceID,
				Status:      int32(model.SliceStatusDone),
				FailReason:  "",
				Hit:         0,
			}
			newMap[newSliceIDs[t]] = &newSliceModel
		}

		var sliceEntities []*entity.Slice
		if doc.DocumentType == int32(knowledgeModel.DocumentTypeTable) {
			sliceMap, err := k.selectTableData(ctx, doc.TableInfo, sliceInfo)
			if err != nil {
				logs.CtxErrorf(ctx, "select table data failed, err: %v", err)
				return err
			}
			newSlices := make([]*entity.Slice, 0)
			for id, info := range sliceMap {
				info.DocumentID = newDocID
				info.Hit = 0
				info.DocumentName = doc.Name
				info.ID = old2NewIDMap[id]
				for t := range info.RawContent[0].Table.Columns {
					info.RawContent[0].Table.Columns[t].ColumnID = columnMap[info.RawContent[0].Table.Columns[t].ColumnID]
				}
				newSlices = append(newSlices, info)
			}
			err = k.upsertDataToTable(ctx, newDoc.TableInfo, newSlices)
			if err != nil {
				logs.CtxErrorf(ctx, "upsert data to table failed, err: %v", err)
				return err
			}
			sliceEntities = newSlices
		}

		for _, v := range newMap {
			cpSlice := v
			newSliceModels = append(newSliceModels, cpSlice)
			if doc.DocumentType != int32(knowledgeModel.DocumentTypeTable) {
				sliceEntities = append(sliceEntities, k.fromModelSlice(ctx, cpSlice))
			}
		}

		ssDocs, err := slices.TransformWithErrorCheck(sliceEntities, func(a *entity.Slice) (*schema.Document, error) {
			return k.slice2Document(ctx, docEntity, a)
		})
		if err != nil {
			return err
		}
		for _, mgr := range k.searchStoreManagers {
			ss, err := mgr.GetSearchStore(ctx, collectionName)
			if err != nil {
				return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", err.Error()))
			}

			if _, err = ss.Store(ctx, ssDocs,
				searchstore.WithIndexerPartitionKey(fieldNameDocumentID),
				searchstore.WithPartition(strconv.FormatInt(newDoc.ID, 10)),
				searchstore.WithIndexingFields(indexingFields),
			); err != nil {
				return errorx.New(errno.ErrKnowledgeSearchStoreCode, errorx.KV("msg", err.Error()))
			}
		}

		err = k.sliceRepo.BatchCreate(ctx, newSliceModels)
		if err != nil {
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
	}

	return nil
}
func (k *knowledgeSVC) createTable(ctx context.Context, doc *model.KnowledgeDocument) error {
	// Tabular knowledge base, creating tables
	rdbColumns := []*rdbEntity.Column{}
	tableColumns := doc.TableInfo.Columns
	columnIDs, err := k.genMultiIDs(ctx, len(tableColumns)+1)
	if err != nil {
		return err
	}
	for i := range tableColumns {
		tableColumns[i].ID = columnIDs[i]
		rdbColumns = append(rdbColumns, &rdbEntity.Column{
			Name:     convert.ColumnIDToRDBField(columnIDs[i]),
			DataType: convert.ConvertColumnType(tableColumns[i].Type),
			NotNull:  tableColumns[i].Indexing,
		})
	}
	doc.TableInfo.Columns = append(doc.TableInfo.Columns, &entity.TableColumn{
		ID:          columnIDs[len(columnIDs)-1],
		Name:        consts.RDBFieldID,
		Type:        document.TableColumnTypeInteger,
		Description: "主键ID",
		Indexing:    false,
		Sequence:    -1,
	})
	// Add a primary key ID to each table
	rdbColumns = append(rdbColumns, &rdbEntity.Column{
		Name:     consts.RDBFieldID,
		DataType: rdbEntity.TypeBigInt,
		NotNull:  true,
	})
	// Create a data table
	resp, err := k.rdb.CreateTable(ctx, &rdb.CreateTableRequest{
		Table: &rdbEntity.Table{
			Columns: rdbColumns,
			Indexes: []*rdbEntity.Index{
				{
					Name:    "pk",
					Type:    rdbEntity.PrimaryKey,
					Columns: []string{consts.RDBFieldID},
				},
			},
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "create table failed, err: %v", err)
		return err
	}
	doc.TableInfo = &entity.TableInfo{
		VirtualTableName:  doc.Name,
		PhysicalTableName: resp.Table.Name,
		TableDesc:         doc.TableInfo.TableDesc,
		Columns:           doc.TableInfo.Columns,
	}
	return nil
}

type knowledgeCopyCtx struct {
	OriginData       *model.Knowledge
	CopyTask         *copyEntity.CopyDataTask
	NewRDBTableNames []string
}

func (k *knowledgeSVC) MoveKnowledgeToLibrary(ctx context.Context, request *MoveKnowledgeToLibraryRequest) error {
	if request == nil || request.KnowledgeID == 0 {
		return errors.New("invalid request")
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return err
	}
	if kn == nil || kn.ID == 0 {
		return errors.New("knowledge not found")
	}
	kn.AppID = 0
	err = k.knowledgeRepo.Update(ctx, kn)
	return err
}
