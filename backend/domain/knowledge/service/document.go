package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/dao"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb"
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
	sliceStr := ""
	for i := range sliceIDs {
		sliceStr += fmt.Sprintf("%d,", sliceIDs[i])
	}
	sliceStr = sliceStr[:len(sliceStr)-1] // 去掉最后一个逗号
	resp, err := k.rdb.ExecuteSQL(ctx, &rdb.ExecuteSQLRequest{
		TableName: tableInfo.PhysicalTableName,
		// todo，这里能不能实现
		SQL:    fmt.Sprintf("SELECT * FROM %s WHERE id IN (%s)", tableInfo.PhysicalTableName, sliceStr),
		Params: []interface{}{sliceIDs},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "execute sql failed, err: %v", err)
		return err
	}
	rows := resp.ResultSet.Rows
	virtualColumnMap := map[string]string{}
	for i := range tableInfo.Columns {
		virtualColumnMap[fmt.Sprintf("c_%d", tableInfo.Columns[i].ID)] = tableInfo.Columns[i].Name
	}
	contentMap := map[int64]string{}
	for i := range rows {
		sliceID, ok := rows[i]["id"].(int64)
		if !ok {
			logs.CtxErrorf(ctx, "slice id is not int64")
			return fmt.Errorf("slice id is not int64")
		}
		rowNew := map[string]string{}
		for k, v := range rows[i] {
			if k == "id" {
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
