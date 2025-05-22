package memory

import (
	"fmt"
	"strconv"
	"strings"

	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

func convertAddDatabase(req *table.AddDatabaseRequest) *database.CreateDatabaseRequest {
	fieldItems := make([]*entity.FieldItem, 0, len(req.FieldList))
	for _, field := range req.FieldList {
		fieldItems = append(fieldItems, &entity.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         convertFieldType(field.Type),
			MustRequired: field.MustRequired,
		})
	}

	return &database.CreateDatabaseRequest{
		Database: &entity.Database{
			Name:           req.TableName,
			Description:    req.TableDesc,
			IconURI:        req.IconURI,
			CreatorID:      req.CreatorID,
			SpaceID:        req.SpaceID,
			ProjectID:      req.ProjectID,
			TableName:      req.TableName,
			TableDesc:      req.TableDesc,
			FieldList:      fieldItems,
			RwMode:         entity.DatabaseRWMode(req.RwMode),
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
	fieldItems := make([]*entity.FieldItem, 0, len(req.FieldList))
	for _, field := range req.FieldList {
		fieldItems = append(fieldItems, &entity.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			AlterID:      field.AlterId,
			Type:         convertFieldType(field.Type),
			MustRequired: field.MustRequired,
		})
	}

	return &database.UpdateDatabaseRequest{
		Database: &entity.Database{
			ID:             req.ID,
			Name:           req.TableName,
			Description:    req.TableDesc,
			IconURI:        req.IconURI,
			TableName:      req.TableName,
			TableDesc:      req.TableDesc,
			FieldList:      fieldItems,
			RwMode:         entity.DatabaseRWMode(req.RwMode),
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
			Type:          convertToTableFieldType(field.Type),
			MustRequired:  field.MustRequired,
			AlterId:       field.AlterID,
			IsSystemField: field.IsSystemField,
		})
	}

	var draftID *int64
	if db.DraftID != nil {
		draftID = db.DraftID
	}

	var isAddedToBot *bool
	if db.IsAddedToAgent != nil {
		isAddedToBot = db.IsAddedToAgent
	}

	return &table.DatabaseInfo{
		ID:               db.ID,
		SpaceID:          db.SpaceID,
		ProjectID:        db.ProjectID,
		IconURI:          db.IconURI,
		IconURL:          db.IconUrl,
		TableName:        db.TableName,
		TableDesc:        db.TableDesc,
		Status:           table.BotTableStatus(db.Status),
		CreatorID:        db.CreatorID,
		CreateTime:       db.CreatedAtMs,
		UpdateTime:       db.UpdatedAtMs,
		FieldList:        fieldItems,
		ActualTableName:  db.ActualTableName,
		RwMode:           table.BotTableRWMode(db.RwMode),
		PromptDisabled:   db.PromptDisabled,
		IsVisible:        db.IsVisible,
		DraftID:          draftID,
		ExtraInfo:        db.ExtraInfo,
		IsAddedToBot:     isAddedToBot,
		DatamodelTableID: getDataModelTableID(db.ActualTableName),
	}
}

// convertFieldType converts table.FieldItemType to entity.FieldItemType
func convertFieldType(fieldType table.FieldItemType) entity.FieldItemType {
	switch fieldType {
	case table.FieldItemType_Text:
		return entity.FieldItemType_Text
	case table.FieldItemType_Number:
		return entity.FieldItemType_Number
	case table.FieldItemType_Date:
		return entity.FieldItemType_Date
	case table.FieldItemType_Float:
		return entity.FieldItemType_Float
	case table.FieldItemType_Boolean:
		return entity.FieldItemType_Boolean
	default:
		return entity.FieldItemType_Text
	}
}

// convertToTableFieldType converts entity.FieldItemType to table.FieldItemType
func convertToTableFieldType(fieldType entity.FieldItemType) table.FieldItemType {
	switch fieldType {
	case entity.FieldItemType_Text:
		return table.FieldItemType_Text
	case entity.FieldItemType_Number:
		return table.FieldItemType_Number
	case entity.FieldItemType_Date:
		return table.FieldItemType_Date
	case entity.FieldItemType_Float:
		return table.FieldItemType_Float
	case entity.FieldItemType_Boolean:
		return table.FieldItemType_Boolean
	default:
		return table.FieldItemType_Text
	}
}

// convertListDatabase converts the API list request to domain request
func convertListDatabase(req *table.ListDatabaseRequest) *database.ListDatabaseRequest {
	dRes := &database.ListDatabaseRequest{
		SpaceID:   req.SpaceID,
		TableName: req.TableName,
		TableType: entity.TableType(req.TableType),
		Limit:     int(req.GetLimit()),
		Offset:    int(req.GetOffset()),
	}

	if req.CreatorID != nil && *req.CreatorID != 0 {
		dRes.CreatorID = req.CreatorID
	}

	if len(req.OrderBy) > 0 {
		dRes.OrderBy = make([]*entity.OrderBy, len(req.OrderBy))
		for i, order := range req.OrderBy {
			dRes.OrderBy[i] = &entity.OrderBy{
				Field:     order.Field,
				Direction: entity.SortDirection(order.Direction),
			}
		}
	}

	return dRes
}

// convertListDatabaseRes converts the domain list response to API response
func convertListDatabaseRes(res *database.ListDatabaseResponse) *table.ListDatabaseResponse {
	databaseInfos := make([]*table.DatabaseInfo, 0, len(res.Databases))
	for _, db := range res.Databases {
		databaseInfos = append(databaseInfos, convertDatabaseRes(db))
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
			Type:         convertToTableFieldType(field.Type),
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

func convertToBotTableList(databases []*entity.Database, agentID int64, relationMap map[int64]*entity.AgentToDatabase) []*table.BotTable {
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
				Type:          convertToTableFieldType(field.Type),
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
