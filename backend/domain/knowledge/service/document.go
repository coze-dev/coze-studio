package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/consts"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
	rdbEntity "code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func (k *knowledgeSVC) deleteDocument(ctx context.Context, knowledgeID int64, docIDs []int64, userID int64) (err error) {
	option := dao.WhereDocumentOpt{
		IDs: docIDs,
	}
	if knowledgeID != 0 {
		option.KnowledgeIDs = []int64{knowledgeID}
	}
	if userID != 0 {
		option.CreatorID = userID
	}
	docs, _, err := k.documentRepo.FindDocumentByCondition(ctx, &option)
	if err != nil {
		logs.CtxErrorf(ctx, "find document failed, err: %v", err)
		return err
	}
	if docIDs == nil {
		docIDs = []int64{}
	}
	for i := range docs {
		if docs[i] == nil {
			continue
		}
		docIDs = append(docIDs, docs[i].ID)
	}
	if len(docIDs) == 0 {
		return nil
	}
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
		Type:        entity.EventTypeDeleteKnowledgeData,
		SliceIDs:    sliceIDs,
		KnowledgeID: knowledgeID,
	}
	eventData, err := json.Marshal(deleteDocumentEvent)
	if err != nil {
		logs.CtxErrorf(ctx, "marshal event failed, err: %v", err)
		return err
	}
	err = k.producer.Send(ctx, eventData, eventbus.WithShardingKey(strconv.FormatInt(knowledgeID, 10)))
	if err != nil {
		logs.CtxErrorf(ctx, "send event failed, err: %v", err)
		return err
	}
	return nil
}

func (k *knowledgeSVC) selectTableData(ctx context.Context, tableInfo *entity.TableInfo, slices []*model.KnowledgeDocumentSlice) (err error) {
	sliceIDs := []int64{}
	for i := range slices {
		sliceIDs = append(sliceIDs, slices[i].ID)
	}
	resp, err := k.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		SQL:    fmt.Sprintf("SELECT * FROM `%s` WHERE id IN ?", tableInfo.PhysicalTableName),
		Params: []interface{}{sliceIDs},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "execute sql failed, err: %v", err)
		return err
	}
	rows := resp.ResultSet.Rows
	virtualColumnMap := map[string]string{}
	for i := range tableInfo.Columns {
		virtualColumnMap[convert.ColumnIDToRDBField(tableInfo.Columns[i].ID)] = tableInfo.Columns[i].Name
	}
	contentMap := map[int64]string{}
	for i := range rows {
		sliceID, ok := rows[i][consts.RDBFieldID].(int64)
		if !ok {
			logs.CtxErrorf(ctx, "slice id is not int64")
			return fmt.Errorf("slice id is not int64")
		}
		rowNew := map[string]string{}
		for k, v := range rows[i] {
			if k == consts.RDBFieldID {
				continue
			}
			rowNew[virtualColumnMap[k]] = interface2String(v)
		}
		rowStr, err := json.Marshal(rowNew)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal row failed, err: %v", err)
			return err
		}
		contentMap[sliceID] = string(rowStr)
	}
	for i := range slices {
		slices[i].Content = contentMap[slices[i].ID]
	}
	return nil
}

func (k *knowledgeSVC) alterTableSchema(ctx context.Context, beforeColumns []*entity.TableColumn, targetColumns []*entity.TableColumn, physicalTableName string) (finalColumns []*entity.TableColumn, err error) {
	alterRequest := &rdb.AlterTableRequest{
		TableName:  physicalTableName,
		Operations: []*rdb.AlterTableOperation{},
	}
	finalColumns = make([]*entity.TableColumn, 0)
	for i := range targetColumns {
		if targetColumns[i] == nil {
			continue
		}
		if targetColumns[i].Name == "id" {
			continue
		}
		if targetColumns[i].ID == 0 {
			// 要新增的列
			columnID, err := k.idgen.GenID(ctx)
			if err != nil {
				logs.CtxErrorf(ctx, "gen id failed, err: %v", err)
				return nil, err
			}
			targetColumns[i].ID = columnID
			alterRequest.Operations = append(alterRequest.Operations, &rdb.AlterTableOperation{
				Action: rdbEntity.AddColumn,
				Column: &rdbEntity.Column{
					Name:     convert.ColumnIDToRDBField(columnID),
					DataType: convert.ConvertColumnType(targetColumns[i].Type),
				},
			})
		} else {
			if checkColumnExist(targetColumns[i].ID, beforeColumns) {
				// 要修改的列
				alterRequest.Operations = append(alterRequest.Operations, &rdb.AlterTableOperation{
					Action: rdbEntity.ModifyColumn,
					Column: &rdbEntity.Column{
						Name:     convert.ColumnIDToRDBField(targetColumns[i].ID),
						DataType: convert.ConvertColumnType(targetColumns[i].Type),
					},
				})
			}
		}
		finalColumns = append(finalColumns, targetColumns[i])
	}
	for i := range beforeColumns {
		if beforeColumns[i] == nil {
			continue
		}
		if beforeColumns[i].Name == "id" {
			finalColumns = append(finalColumns, beforeColumns[i])
			continue
		}
		if !checkColumnExist(beforeColumns[i].ID, targetColumns) {
			// 要删除的列
			alterRequest.Operations = append(alterRequest.Operations, &rdb.AlterTableOperation{
				Action: rdbEntity.DropColumn,
				Column: &rdbEntity.Column{
					Name: convert.ColumnIDToRDBField(beforeColumns[i].ID),
				},
			})
		}
	}
	if len(alterRequest.Operations) == 0 {
		return targetColumns, nil
	}
	_, err = k.rdb.AlterTable(ctx, alterRequest)
	if err != nil {
		logs.CtxErrorf(ctx, "alter table failed, err: %v", err)
		return nil, err
	}
	return finalColumns, nil
}

func checkColumnExist(columnID int64, columns []*entity.TableColumn) bool {
	for i := range columns {
		if columns[i] == nil {
			continue
		}
		if columns[i].ID == columnID {
			return true
		}
	}
	return false
}

func interface2String(i interface{}) string {
	if i == nil {
		return ""
	}
	switch v := i.(type) {
	case string:
		return v
	case []uint8:
		return string(v)
	case int64:
		return fmt.Sprintf("%d", v)
	case float32:
		return fmt.Sprintf("%f", v)
	case float64:
		return fmt.Sprintf("%f", v)
	case time.Time:
		return v.Format("2006-01-02 15:04:05")
	case bool:
		return fmt.Sprintf("%t", v)
	default:
		return ""
	}
}
