package service

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	knowledgeModel "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatacopy"
	"code.byted.org/flow/opencoze/backend/domain/datacopy"
	copyEntity "code.byted.org/flow/opencoze/backend/domain/datacopy/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/infra/contract/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/infra/contract/rdb/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"github.com/bytedance/sonic"
)

func (k *knowledgeSVC) CopyKnowledge(ctx context.Context, request *knowledge.CopyKnowledgeRequest) (*knowledge.CopyKnowledgeResponse, error) {
	if request == nil {
		return nil, errors.New("request is nil")
	}
	if len(request.TaskUniqKey) == 0 {
		return nil, errors.New("task uniq key is empty")
	}
	if request.KnowledgeID == 0 {
		return nil, errors.New("knowledge id is empty")
	}
	kn, err := k.knowledgeRepo.GetByID(ctx, request.KnowledgeID)
	if err != nil {
		return nil, err
	}
	if kn == nil || kn.ID == 0 {
		return nil, errors.New("knowledge not found")
	}
	newID, err := k.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	copyTaskEntity := copyEntity.CopyDataTask{
		ID:            0,
		TaskUniqKey:   request.TaskUniqKey,
		OriginDataID:  request.KnowledgeID,
		TargetDataID:  newID,
		OriginSpaceID: request.OriginSpaceID,
		TargetSpaceID: request.TargetSpaceID,
		OriginUserID:  kn.CreatorID,
		TargetUserID:  request.TargetUserID,
		OriginAppID:   request.OriginAppID,
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
		return nil, err
	}
	switch checkResult.CopyTaskStatus {
	case copyEntity.DataCopyTaskStatusSuccess:
		return &knowledge.CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledge.CopyStatus_Successful,
			ErrMsg:            "",
		}, nil
	case copyEntity.DataCopyTaskStatusInProgress:
		return &knowledge.CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledge.CopyStatus_Processing,
			ErrMsg:            "",
		}, nil
	case copyEntity.DataCopyTaskStatusFail:
		return &knowledge.CopyKnowledgeResponse{
			OriginKnowledgeID: request.KnowledgeID,
			TargetKnowledgeID: checkResult.TargetID,
			CopyStatus:        knowledge.CopyStatus_Failed,
			ErrMsg:            checkResult.FailReason,
		}, nil
	}
	copyTaskEntity.ID = checkResult.CopyTaskID
	copyResp, err := k.copyDo(ctx, &knowledgeCopyCtx{
		OriginData: kn,
		CopyTask:   &copyTaskEntity,
	})
	if err != nil {
		return nil, err
	}
	return copyResp, nil
}

func (k *knowledgeSVC) copyDo(ctx context.Context, copyCtx *knowledgeCopyCtx) (*knowledge.CopyKnowledgeResponse, error) {
	var err error
	defer func() {
		if e := recover(); e != nil {
			logs.CtxErrorf(ctx, "copy knowledge failed, err: %v", e)
			err = fmt.Errorf("copy knowledge failed, err: %v", e)
		}
		if err != nil {
			deleteErr := k.DeleteKnowledge(ctx, &knowledge.DeleteKnowledgeRequest{KnowledgeID: copyCtx.CopyTask.TargetDataID})
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
						logs.CtxErrorf(ctx, "drop table failed, err: %v", dropErr)
					}
				}
			}
		}
	}()
	copyCtx.CopyTask.Status = copyEntity.DataCopyTaskStatusInProgress
	err = crossdatacopy.DefaultSVC().UpdateCopyTask(ctx, &datacopy.UpdateCopyTaskReq{Task: copyCtx.CopyTask})
	if err != nil {
		return nil, err
	}
	err = k.copyKnowledge(ctx, copyCtx)
	if err != nil {
		return nil, err
	}
	err = k.copyKnowledgeDocuments(ctx, copyCtx)
	if err != nil {
		return nil, err
	}
	copyCtx.CopyTask.FinishTime = time.Now().UnixMilli()
	copyCtx.CopyTask.Status = copyEntity.DataCopyTaskStatusSuccess
	err = crossdatacopy.DefaultSVC().UpdateCopyTask(ctx, &datacopy.UpdateCopyTaskReq{
		Task: copyCtx.CopyTask,
	})
	if err != nil {
		logs.CtxWarnf(ctx, "update copy task failed, err: %v", err)
	}
	return &knowledge.CopyKnowledgeResponse{
		OriginKnowledgeID: copyCtx.OriginData.ID,
		TargetKnowledgeID: copyCtx.CopyTask.TargetDataID,
		CopyStatus:        knowledge.CopyStatus_Successful,
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
	return k.knowledgeRepo.Create(ctx, &copyKnowledgeInfo)
}

func (k *knowledgeSVC) copyKnowledgeDocuments(ctx context.Context, copyCtx *knowledgeCopyCtx) (err error) {
	// 查询document信息（仅处理完成的文档）
	documents, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		KnowledgeIDs: []int64{copyCtx.OriginData.ID},
		StatusIn:     []int32{int32(entity.DocumentStatusEnable)},
		SelectAll:    true,
	})
	if err != nil {
		return err
	}
	if len(documents) == 0 {
		logs.CtxInfof(ctx, "knowledge %d has no document", copyCtx.OriginData.ID)
		return nil
	}

	targetDocuments, _, err := k.documentRepo.FindDocumentByCondition(ctx, &dao.WhereDocumentOpt{
		KnowledgeIDs: []int64{copyCtx.CopyTask.TargetDataID},
		SelectAll:    true,
	})
	if err != nil {
		logs.CtxErrorf(ctx, "find target document failed, err: %v", err)
		return err
	}
	for i := range targetDocuments {
		err = k.DeleteDocument(ctx, &knowledge.DeleteDocumentRequest{DocumentID: targetDocuments[i].ID})
		if err != nil {
			return err
		}
	}
	// 表格类复制
	wg := sync.WaitGroup{}
	failList := []int64{}
	wg.Add(len(documents))
	newIDs, err := k.idgen.GenMultiIDs(ctx, len(documents))
	for i := range documents {
		go func() error {
			defer wg.Done()
			err = k.copyDocument(ctx, copyCtx, documents[i], newIDs[i])
			if err != nil {
				failList = append(failList, documents[i].ID)
			}
			return err
		}()
	}
	wg.Wait()
	if len(failList) > 0 {
		logs.CtxErrorf(ctx, "copy document failed, document ids: %v", failList)
		return errors.New("copy document failed")
	}
	return nil
}

func (k *knowledgeSVC) copyDocument(ctx context.Context, copyCtx *knowledgeCopyCtx, doc *model.KnowledgeDocument, newDocID int64) error {
	// 表格类文档复制
	var err error
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
	// 如果是表格型知识库->创建新的表格
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
	sliceIDs, err := k.sliceRepo.GetDocumentSliceIDs(ctx, []int64{doc.ID})
	if err != nil {
		return err
	}
	batchSize := 100
	for i := 0; i < len(sliceIDs); i += batchSize {
		end := i + batchSize
		if end > len(sliceIDs) {
			end = len(sliceIDs)
		}
		sliceIDs := sliceIDs[i:end]
		sliceInfo, err := k.sliceRepo.MGetSlices(ctx, sliceIDs)
		if err != nil {
			return err
		}
		newSliceModels := make([]*model.KnowledgeDocumentSlice, 0)
		newSliceIDs, err := k.idgen.GenMultiIDs(ctx, len(sliceInfo))
		if err != nil {
			return err
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
		}
		// todo，完成viking和es的复制
		for _, v := range newMap {
			newSliceModels = append(newSliceModels, v)
		}
		err = k.sliceRepo.BatchCreate(ctx, newSliceModels)
		if err != nil {
			return err
		}
	}

	return nil
}
func (k *knowledgeSVC) createTable(ctx context.Context, doc *model.KnowledgeDocument) error {
	// 表格型知识库，创建表
	rdbColumns := []*rdbEntity.Column{}
	tableColumns := doc.TableInfo.Columns
	columnIDs, err := k.idgen.GenMultiIDs(ctx, len(tableColumns)+1)
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
	// 为每个表格增加个主键ID
	rdbColumns = append(rdbColumns, &rdbEntity.Column{
		Name:     consts.RDBFieldID,
		DataType: rdbEntity.TypeBigInt,
		NotNull:  true,
	})
	// 创建一个数据表
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

func (k *knowledgeSVC) MigrateKnowledge(ctx context.Context, request *knowledge.MigrateKnowledgeRequest) error {
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
	if request.TargetAppID != nil {
		kn.AppID = ptr.From(request.TargetAppID)
	}
	kn.SpaceID = request.TargetSpaceID
	err = k.knowledgeRepo.Update(ctx, kn)
	return err
}
