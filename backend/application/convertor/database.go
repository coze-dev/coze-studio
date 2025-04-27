package convertor

import (
	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
)

func ConvertAddDatabase(req *table.AddDatabaseRequest) *database.CreateDatabaseRequest {
	fieldItems := make([]*entity.FieldItem, 0, len(req.FieldList))
	for _, field := range req.FieldList {
		fieldItems = append(fieldItems, &entity.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         ConvertFieldType(field.Type),
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
			Type:         ConvertFieldType(field.Type),
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

// ConvertUpdateDatabaseRes converts the domain update response to API response
func ConvertUpdateDatabaseRes(res *database.UpdateDatabaseResponse) *table.SingleDatabaseResponse {
	return &table.SingleDatabaseResponse{
		DatabaseInfo: convertDatabaseRes(res.Database),
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
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         ConvertToTableFieldType(field.Type),
			MustRequired: field.MustRequired,
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
		ID:              db.ID,
		SpaceID:         db.SpaceID,
		ProjectID:       db.ProjectID,
		IconURI:         db.IconURI,
		IconURL:         db.IconUrl,
		TableName:       db.TableName,
		TableDesc:       db.TableDesc,
		Status:          table.BotTableStatus(db.Status),
		CreatorID:       db.CreatorID,
		CreateTime:      db.CreatedAtMs,
		UpdateTime:      db.UpdatedAtMs,
		FieldList:       fieldItems,
		ActualTableName: db.ActualTableName,
		RwMode:          table.BotTableRWMode(db.RwMode),
		PromptDisabled:  db.PromptDisabled,
		IsVisible:       db.IsVisible,
		DraftID:         draftID,
		ExtraInfo:       db.ExtraInfo,
		IsAddedToBot:    isAddedToBot,
	}
}

// ConvertFieldType converts table.FieldItemType to entity.FieldItemType
func ConvertFieldType(fieldType table.FieldItemType) entity.FieldItemType {
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

// ConvertToTableFieldType converts entity.FieldItemType to table.FieldItemType
func ConvertToTableFieldType(fieldType entity.FieldItemType) table.FieldItemType {
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

// ConvertListDatabase converts the API list request to domain request
func ConvertListDatabase(req *table.ListDatabaseRequest) *database.ListDatabaseRequest {
	dRes := &database.ListDatabaseRequest{
		SpaceID:   req.SpaceID,
		CreatorID: req.CreatorID,
		TableName: req.TableName,
		TableType: entity.TableType(req.TableType),
		Limit:     int(req.GetLimit()),
		Offset:    int(req.GetOffset()),
	}

	if len(req.OrderBy) > 0 {
		dRes.OrderBy = make([]*database.OrderBy, len(req.OrderBy))
		for i, order := range req.OrderBy {
			dRes.OrderBy[i] = &database.OrderBy{
				Field:     order.Field,
				Direction: entity.SortDirection(order.Direction),
			}
		}
	}

	return dRes
}

// ConvertListDatabaseRes converts the domain list response to API response
func ConvertListDatabaseRes(res *database.ListDatabaseResponse) *table.ListDatabaseResponse {
	databaseInfos := make([]*table.DatabaseInfo, 0, len(res.Databases))
	for _, db := range res.Databases {
		databaseInfos = append(databaseInfos, convertDatabaseRes(db))
	}

	return &table.ListDatabaseResponse{
		DatabaseInfoList: databaseInfos,
		TotalCount:       res.TotalCount,
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}
}

// ConvertListDatabaseRecords converts API ListDatabaseRecordsRequest to domain ListDatabaseRecordRequest
func ConvertListDatabaseRecords(req *table.ListDatabaseRecordsRequest) *database.ListDatabaseRecordRequest {
	domainReq := &database.ListDatabaseRecordRequest{
		DatabaseID: req.DatabaseID,
		TableType:  entity.TableType(req.TableType),
		Limit:      int(req.Limit),
		Offset:     int(req.Offset),
	}
	// FilterCriterion, NotFilterByUserID, OrderByList not use
	return domainReq
}

// ConvertListDatabaseRecordsRes converts domain ListDatabaseRecordResponse to API ListDatabaseRecordsResponse
func ConvertListDatabaseRecordsRes(res *database.ListDatabaseRecordResponse) *table.ListDatabaseRecordsResponse {
	apiRes := &table.ListDatabaseRecordsResponse{
		Data:      res.Records,
		TotalNum:  int32(res.TotalCount),
		HasMore:   res.HasMore,
		FieldList: make([]*table.FieldItem, 0, len(res.FieldList)),
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}

	for _, field := range res.FieldList {
		apiRes.FieldList = append(apiRes.FieldList, &table.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         ConvertToTableFieldType(field.Type),
			MustRequired: field.MustRequired,
		})
	}

	return apiRes
}
