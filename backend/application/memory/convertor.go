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

package memory

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/coze-dev/coze-studio/backend/api/model/base"
	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	model "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

func convertAddDatabase(req *table.AddDatabaseRequest) *database.CreateDatabaseRequest {
	fieldItems := make([]*model.FieldItem, 0, len(req.FieldList))
	for _, field := range req.FieldList {
		fieldItems = append(fieldItems, &model.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         field.Type,
			MustRequired: field.MustRequired,
		})
	}

	return &database.CreateDatabaseRequest{
		Database: &entity.Database{
			IconURI:        req.IconURI,
			CreatorID:      req.CreatorID,
			SpaceID:        req.SpaceID,
			AppID:          req.ProjectID,
			TableName:      req.TableName,
			TableDesc:      req.TableDesc,
			FieldList:      fieldItems,
			RwMode:         req.RwMode,
			PromptDisabled: req.PromptDisabled,
			ExtraInfo:      req.ExtraInfo,
		},
	}
}

func ConvertDatabaseRes(res *entity.Database) *table.SingleDatabaseResponse {
	return &table.SingleDatabaseResponse{
		DatabaseInfo: convertDatabaseRes(res),

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}
}

// ConvertUpdateDatabase converts the API update request to domain request
func ConvertUpdateDatabase(req *table.UpdateDatabaseRequest) *database.UpdateDatabaseRequest {
	fieldItems := make([]*model.FieldItem, 0, len(req.FieldList))
	for _, field := range req.FieldList {
		fieldItems = append(fieldItems, &model.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			AlterID:      field.AlterId,
			Type:         field.Type,
			MustRequired: field.MustRequired,
		})
	}

	return &database.UpdateDatabaseRequest{
		Database: &entity.Database{
			ID:             req.ID,
			IconURI:        req.IconURI,
			TableName:      req.TableName,
			TableDesc:      req.TableDesc,
			FieldList:      fieldItems,
			RwMode:         req.RwMode,
			PromptDisabled: req.PromptDisabled,
			ExtraInfo:      req.ExtraInfo,
		},
	}
}

// convertUpdateDatabaseResult converts the domain update response to API response
func convertUpdateDatabaseResult(res *database.UpdateDatabaseResponse) *table.SingleDatabaseResponse {
	return &table.SingleDatabaseResponse{
		DatabaseInfo: convertDatabaseRes(res.Database),

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}
}

func convertDatabaseRes(db *entity.Database) *table.DatabaseInfo {
	fieldItems := make([]*table.FieldItem, 0, len(db.FieldList))
	for _, field := range db.FieldList {
		fieldItems = append(fieldItems, &table.FieldItem{
			Name:          field.Name,
			Desc:          field.Desc,
			Type:          field.Type,
			MustRequired:  field.MustRequired,
			AlterId:       field.AlterID,
			IsSystemField: field.IsSystemField,
		})
	}

	return &table.DatabaseInfo{
		ID:               db.ID,
		SpaceID:          db.SpaceID,
		ProjectID:        db.AppID,
		IconURI:          db.IconURI,
		IconURL:          db.IconURL,
		TableName:        db.TableName,
		TableDesc:        db.TableDesc,
		Status:           db.Status,
		CreatorID:        db.CreatorID,
		CreateTime:       db.CreatedAtMs,
		UpdateTime:       db.UpdatedAtMs,
		FieldList:        fieldItems,
		ActualTableName:  db.ActualTableName,
		RwMode:           table.BotTableRWMode(db.RwMode),
		PromptDisabled:   db.PromptDisabled,
		IsVisible:        db.IsVisible,
		DraftID:          db.DraftID,
		ExtraInfo:        db.ExtraInfo,
		IsAddedToBot:     db.IsAddedToAgent,
		DatamodelTableID: getDataModelTableID(db.ActualTableName),
	}
}

// convertListDatabase converts the API list request to domain request
func convertListDatabase(req *table.ListDatabaseRequest) *database.ListDatabaseRequest {
	dRes := &database.ListDatabaseRequest{
		SpaceID:   req.SpaceID,
		TableName: req.TableName,
		TableType: req.TableType,
		AppID:     req.GetProjectID(),
		Limit:     int(req.GetLimit()),
		Offset:    int(req.GetOffset()),
	}

	if req.CreatorID != nil && *req.CreatorID != 0 {
		dRes.CreatorID = req.CreatorID
	}

	if len(req.OrderBy) > 0 {
		dRes.OrderBy = make([]*model.OrderBy, len(req.OrderBy))
		for i, order := range req.OrderBy {
			dRes.OrderBy[i] = &model.OrderBy{
				Field:     order.Field,
				Direction: order.Direction,
			}
		}
	}

	return dRes
}

// convertListDatabaseRes converts the domain list response to API response
func convertListDatabaseRes(res *database.ListDatabaseResponse, bindDatabases []*entity.Database) *table.ListDatabaseResponse {
	databaseInfos := make([]*table.DatabaseInfo, 0, len(res.Databases))
	dbMap := slices.ToMap(bindDatabases, func(e *entity.Database) (int64, *entity.Database) {
		return e.ID, e
	})
	for _, db := range res.Databases {
		databaseInfo := convertDatabaseRes(db)
		if _, ok := dbMap[db.ID]; ok {
			databaseInfo.IsAddedToBot = ptr.Of(true)
		}
		databaseInfos = append(databaseInfos, databaseInfo)
	}

	return &table.ListDatabaseResponse{
		DatabaseInfoList: databaseInfos,
		TotalCount:       res.TotalCount,

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}
}

// convertListDatabaseRecordsRes converts domain ListDatabaseRecordResponse to API ListDatabaseRecordsResponse
func convertListDatabaseRecordsRes(res *database.ListDatabaseRecordResponse) *table.ListDatabaseRecordsResponse {
	apiRes := &table.ListDatabaseRecordsResponse{
		Data:      res.Records,
		TotalNum:  int32(res.TotalCount),
		HasMore:   res.HasMore,
		FieldList: make([]*table.FieldItem, 0, len(res.FieldList)),

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}

	for _, field := range res.FieldList {
		apiRes.FieldList = append(apiRes.FieldList, &table.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         field.Type,
			MustRequired: field.MustRequired,
		})
	}

	return apiRes
}

func getDataModelTableID(actualTableName string) string {
	tableID := ""
	tableIDStr := strings.Split(actualTableName, "_")
	if len(tableIDStr) < 2 {
		return tableID
	}

	return tableIDStr[1]
}

func convertToBotTableList(databases []*entity.Database, agentID int64, relationMap map[int64]*model.AgentToDatabase) []*table.BotTable {
	if len(databases) == 0 {
		return []*table.BotTable{}
	}

	botTables := make([]*table.BotTable, 0, len(databases))
	for _, db := range databases {
		fieldItems := make([]*table.FieldItem, 0, len(db.FieldList))
		for _, field := range db.FieldList {
			fieldItems = append(fieldItems, &table.FieldItem{
				Name:          field.Name,
				Desc:          field.Desc,
				Type:          field.Type,
				MustRequired:  field.MustRequired,
				AlterId:       field.AlterID,
				IsSystemField: field.IsSystemField,
			})
		}

		botTable := &table.BotTable{
			ID:              db.ID,
			BotID:           agentID,
			TableID:         strconv.FormatInt(db.ID, 10),
			TableName:       db.TableName,
			TableDesc:       db.TableDesc,
			Status:          table.BotTableStatus(db.Status),
			CreatorID:       db.CreatorID,
			CreateTime:      db.CreatedAtMs,
			UpdateTime:      db.UpdatedAtMs,
			FieldList:       fieldItems,
			ActualTableName: db.ActualTableName,
			RwMode:          table.BotTableRWMode(db.RwMode),
		}

		if r, ok := relationMap[db.ID]; ok {
			botTable.ExtraInfo = map[string]string{
				"prompt_disabled": fmt.Sprintf("%t", r.PromptDisabled),
			}
		}

		botTables = append(botTables, botTable)
	}

	return botTables
}
