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

	knowledgeModel "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/convert"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	rdbEntity "github.com/coze-dev/coze-studio/backend/infra/contract/rdb/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) selectTableData(ctx context.Context, tableInfo *entity.TableInfo, slices []*model.KnowledgeDocumentSlice) (sliceEntityMap map[int64]*entity.Slice, err error) {
	sliceEntityMap = map[int64]*entity.Slice{}
	var sliceIDs []int64
	for i := range slices {
		sliceIDs = append(sliceIDs, slices[i].ID)
	}
	resp, err := k.rdb.SelectData(ctx, &rdb.SelectDataRequest{
		TableName: tableInfo.PhysicalTableName,
		Fields:    nil,
		Where: &rdb.ComplexCondition{
			Conditions: []*rdb.Condition{
				{
					Field:    consts.RDBFieldID,
					Operator: rdbEntity.OperatorIn,
					Value:    sliceIDs,
				},
			},
		},
	})
	if err != nil {
		logs.CtxErrorf(ctx, "execute sql failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
	}
	rows := resp.ResultSet.Rows
	virtualColumnMap := map[string]*entity.TableColumn{}
	for i := range tableInfo.Columns {
		virtualColumnMap[convert.ColumnIDToRDBField(tableInfo.Columns[i].ID)] = tableInfo.Columns[i]
	}
	valMap := map[int64]map[string]interface{}{}
	for i := range rows {
		sliceID, ok := rows[i][consts.RDBFieldID].(int64)
		if !ok {
			logs.CtxErrorf(ctx, "slice id is not int64")
			return nil, errorx.New(errno.ErrKnowledgeSystemCode, errorx.KV("msg", "slice id is not int64"))
		}
		delete(rows[i], consts.RDBFieldID)
		valMap[sliceID] = resp.ResultSet.Rows[i]
	}
	for i := range slices {
		sliceEntity := k.fromModelSlice(ctx, slices[i])
		sliceEntity.RawContent = make([]*knowledgeModel.SliceContent, 0)
		sliceEntity.RawContent = append(sliceEntity.RawContent, &knowledgeModel.SliceContent{
			Type:  knowledgeModel.SliceContentTypeTable,
			Table: &knowledgeModel.SliceTable{},
		})
		for cName, val := range valMap[slices[i].ID] {
			column, found := virtualColumnMap[cName]
			if !found {
				logs.CtxInfof(ctx, "column not found, name: %s", cName)
				continue
			}
			columnData, err := convert.ParseAnyData(column, val)
			if err != nil {
				logs.CtxErrorf(ctx, "parse any data failed: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeColumnParseFailCode, errorx.KV("msg", err.Error()))
			}
			if columnData.Type == document.TableColumnTypeString {
				columnData.ValString = ptr.Of(k.formatSliceContent(ctx, columnData.GetStringValue()))
			}
			if columnData.Type == document.TableColumnTypeImage {
				columnData.ValImage = ptr.Of(k.formatSliceContent(ctx, columnData.GetStringValue()))
			}
			sliceEntity.RawContent[0].Table.Columns = append(sliceEntity.RawContent[0].Table.Columns, columnData)
		}
		sliceEntityMap[sliceEntity.ID] = sliceEntity
	}
	return
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
		if targetColumns[i].Name == consts.RDBFieldID {
			continue
		}
		if targetColumns[i].ID == 0 {
			// Columns to be added
			columnID, err := k.idgen.GenID(ctx)
			if err != nil {
				logs.CtxErrorf(ctx, "gen id failed, err: %v", err)
				return nil, errorx.New(errno.ErrKnowledgeIDGenCode)
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
				// Column to modify
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
		if beforeColumns[i].Name == consts.RDBFieldID {
			finalColumns = append(finalColumns, beforeColumns[i])
			continue
		}
		if !checkColumnExist(beforeColumns[i].ID, targetColumns) {
			// Column to delete
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
		logs.CtxErrorf(ctx, "[alterTableSchema] alter table failed, err: %v", err)
		return nil, errorx.New(errno.ErrKnowledgeCrossDomainCode, errorx.KV("msg", err.Error()))
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
