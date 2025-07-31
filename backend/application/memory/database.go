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
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/base"
	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/api/model/knowledge/document"
	resCommon "github.com/coze-dev/coze-studio/backend/api/model/resource/common"
	"github.com/coze-dev/coze-studio/backend/api/model/table"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/search"
	"github.com/coze-dev/coze-studio/backend/crossdomain/contract/crossuser"
	"github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	databaseEntity "github.com/coze-dev/coze-studio/backend/domain/memory/database/entity"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	searchEntity "github.com/coze-dev/coze-studio/backend/domain/search/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type DatabaseApplicationService struct {
	DomainSVC database.Database
	eventbus  search.ResourceEventBus
}

var DatabaseApplicationSVC = DatabaseApplicationService{}

func (d *DatabaseApplicationService) GetModeConfig(ctx context.Context, req *table.GetModeConfigRequest) (*table.GetModeConfigResponse, error) {
	return &table.GetModeConfigResponse{
		Code:          0,
		Msg:           "success",
		BotID:         req.BotID,
		Mode:          "expert",
		MaxTableNum:   3,
		MaxColumnNum:  20,
		MaxCapacityKb: 512000,
		MaxRowNum:     100000,
	}, nil
}

func (d *DatabaseApplicationService) ListDatabase(ctx context.Context, req *table.ListDatabaseRequest) (*table.ListDatabaseResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.SpaceID == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "space id is required"))
	}

	spaces, err := crossuser.DefaultSVC().GetUserSpaceList(ctx, *uid)
	if err != nil {
		return nil, err
	}
	if len(spaces) == 0 || spaces[0].ID != *req.SpaceID {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "space id is invalid"))
	}

	res, err := d.DomainSVC.ListDatabase(ctx, convertListDatabase(req))
	if err != nil {
		return nil, err
	}

	bindDatabases := make([]*databaseEntity.Database, 0)
	if req.GetBotID() != 0 {
		resp, err := d.DomainSVC.MGetDatabaseByAgentID(ctx, &database.MGetDatabaseByAgentIDRequest{
			AgentID:       req.GetBotID(),
			TableType:     req.GetTableType(),
			NeedSysFields: false,
		})
		if err != nil {
			return nil, err
		}

		bindDatabases = resp.Databases
	}

	return convertListDatabaseRes(res, bindDatabases), nil
}

func (d *DatabaseApplicationService) GetDatabaseByID(ctx context.Context, req *table.SingleDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	basics := make([]*model.DatabaseBasic, 1)
	b := &model.DatabaseBasic{
		ID: req.ID,
	}
	if req.IsDraft {
		b.TableType = table.TableType_DraftTable
	} else {
		b.TableType = table.TableType_OnlineTable
	}

	b.NeedSysFields = req.NeedSysFields
	basics[0] = b

	res, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: basics,
	})
	if err != nil {
		return nil, err
	}

	if len(res.Databases) == 0 {
		return nil, fmt.Errorf("database %d not found", req.GetID())
	}

	return ConvertDatabaseRes(res.Databases[0]), nil
}

func (d *DatabaseApplicationService) AddDatabase(ctx context.Context, req *table.AddDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}
	if *uid != req.CreatorID {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "creator id is invalid"))
	}

	if req.GetTableName() == "database" {
		return nil, errorx.New(errno.ErrMemoryDatabaseNameInvalid)
	}

	spaces, err := crossuser.DefaultSVC().GetUserSpaceList(ctx, *uid)
	if err != nil {
		return nil, err
	}
	if len(spaces) == 0 || spaces[0].ID != req.SpaceID {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "space id is invalid"))
	}

	res, err := d.DomainSVC.CreateDatabase(ctx, convertAddDatabase(req))
	if err != nil {
		return nil, err
	}

	databaseRes := res.Database
	var ptrAppID *int64
	if databaseRes.AppID != 0 {
		ptrAppID = ptr.Of(databaseRes.AppID)
	}
	err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Created,
		Resource: &searchEntity.ResourceDocument{
			ResType:       resCommon.ResType_Database,
			ResID:         databaseRes.ID,
			Name:          &databaseRes.TableName,
			APPID:         ptrAppID,
			SpaceID:       &databaseRes.SpaceID,
			OwnerID:       &databaseRes.CreatorID,
			PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
			CreateTimeMS:  ptr.Of(databaseRes.CreatedAtMs),
			UpdateTimeMS:  ptr.Of(databaseRes.UpdatedAtMs),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource failed, err=%w", err)
	}

	return ConvertDatabaseRes(databaseRes), nil
}

func (d *DatabaseApplicationService) UpdateDatabase(ctx context.Context, req *table.UpdateDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	err := d.ValidateAccess(ctx, req.ID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	res, err := d.DomainSVC.UpdateDatabase(ctx, ConvertUpdateDatabase(req))
	if err != nil {
		return nil, err
	}

	databaseRes := res.Database
	err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Updated,
		Resource: &searchEntity.ResourceDocument{
			ResType:      resCommon.ResType_Database,
			ResID:        databaseRes.ID,
			Name:         &databaseRes.TableName,
			UpdateTimeMS: ptr.Of(databaseRes.UpdatedAtMs),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("publish resource failed, err=%w", err)
	}

	return convertUpdateDatabaseResult(res), nil
}

func (d *DatabaseApplicationService) DeleteDatabase(ctx context.Context, req *table.DeleteDatabaseRequest) (*table.DeleteDatabaseResponse, error) {
	err := d.ValidateAccess(ctx, req.ID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	err = d.DomainSVC.DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
		ID: req.ID,
	})
	if err != nil {
		return nil, err
	}

	err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
		OpType: searchEntity.Deleted,
		Resource: &searchEntity.ResourceDocument{
			ResType: resCommon.ResType_Database,
			ResID:   req.ID,
		},
	})
	if err != nil {
		return nil, err
	}

	return &table.DeleteDatabaseResponse{
		Code:     0,
		Msg:      "success",
		BaseResp: base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) ListDatabaseRecords(ctx context.Context, req *table.ListDatabaseRecordsRequest) (*table.ListDatabaseRecordsResponse, error) {
	tableType := table.TableType_OnlineTable
	if req.GetBotID() > 0 {
		tableType = table.TableType_DraftTable
	}
	err := d.ValidateAccess(ctx, req.DatabaseID, tableType)
	if err != nil {
		return nil, err
	}

	databaseID := req.DatabaseID
	if req.GetBotID() == 0 {
		databaseID, err = getDatabaseID(ctx, req.TableType, req.DatabaseID)
		if err != nil {
			return nil, err
		}
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	domainReq := &database.ListDatabaseRecordRequest{
		DatabaseID: databaseID,
		TableType:  req.TableType,
		Limit:      int(req.Limit),
		Offset:     int(req.Offset),
		UserID:     *uid,
	}
	// FilterCriterion, NotFilterByUserID, OrderByList not use

	res, err := d.DomainSVC.ListDatabaseRecord(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	return convertListDatabaseRecordsRes(res), nil
}

func (d *DatabaseApplicationService) UpdateDatabaseRecords(ctx context.Context, req *table.UpdateDatabaseRecordsRequest) (*table.UpdateDatabaseRecordsResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	err := d.ValidateAccess(ctx, req.DatabaseID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	databaseID, err := getDatabaseID(ctx, req.GetTableType(), req.GetDatabaseID())
	if err != nil {
		return nil, err
	}

	dataRes := make([]map[string]string, 0)
	if len(req.GetRecordDataAdd()) > 0 {
		err := d.DomainSVC.AddDatabaseRecord(ctx, &database.AddDatabaseRecordRequest{
			DatabaseID: databaseID,
			TableType:  req.GetTableType(),
			Records:    req.GetRecordDataAdd(),
			UserID:     *uid,
		})
		if err != nil {
			return nil, err
		}

		dataRes = append(dataRes, req.GetRecordDataAdd()...)
	}

	if len(req.GetRecordDataAlter()) > 0 {
		err := d.DomainSVC.UpdateDatabaseRecord(ctx, &database.UpdateDatabaseRecordRequest{
			DatabaseID: databaseID,
			TableType:  req.GetTableType(),
			Records:    req.GetRecordDataAlter(),
			UserID:     *uid,
		})
		if err != nil {
			return nil, err
		}

		dataRes = append(dataRes, req.GetRecordDataAlter()...)
	}

	if len(req.GetRecordDataDelete()) > 0 {
		err := d.DomainSVC.DeleteDatabaseRecord(ctx, &database.DeleteDatabaseRecordRequest{
			DatabaseID: databaseID,
			TableType:  req.GetTableType(),
			Records:    req.GetRecordDataDelete(),
			UserID:     *uid,
		})
		if err != nil {
			return nil, err
		}

		dataRes = append(dataRes, req.GetRecordDataDelete()...)
	}

	return &table.UpdateDatabaseRecordsResponse{
		Data: dataRes,

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}, nil
}

func (d *DatabaseApplicationService) GetOnlineDatabaseId(ctx context.Context, req *table.GetOnlineDatabaseIdRequest) (*table.GetOnlineDatabaseIdResponse, error) {
	basics := make([]*model.DatabaseBasic, 1)
	basics[0] = &model.DatabaseBasic{
		ID:        req.ID,
		TableType: table.TableType_DraftTable,
	}

	res, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: basics,
	})
	if err != nil {
		return nil, err
	}

	if len(res.Databases) == 0 {
		return nil, fmt.Errorf("database %d not found", req.ID)
	}

	return &table.GetOnlineDatabaseIdResponse{
		ID: res.Databases[0].OnlineID,

		Code: 0,
		Msg:  "success",
	}, nil
}

func (d *DatabaseApplicationService) ResetBotTable(ctx context.Context, req *table.ResetBotTableRequest) (*table.ResetBotTableResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	tableType := table.TableType_OnlineTable
	if req.GetBotID() > 0 {
		tableType = table.TableType_DraftTable
	}
	err := d.ValidateAccess(ctx, req.GetDatabaseInfoID(), tableType)
	if err != nil {
		return nil, err
	}

	databaseID := req.GetDatabaseInfoID()
	if req.GetBotID() == 0 {
		databaseID, err = getDatabaseID(ctx, req.TableType, req.GetDatabaseInfoID())
		if err != nil {
			return nil, err
		}
	}

	executeDeleteReq := &database.ExecuteSQLRequest{
		DatabaseID:  databaseID,
		TableType:   req.GetTableType(),
		OperateType: model.OperateType_Delete,
		UserID:      conv.Int64ToStr(*uid),
		Condition: &model.ComplexCondition{
			Conditions: []*model.Condition{
				{
					Left:      model.DefaultIDColName,
					Operation: model.Operation_GREATER_THAN,
					Right:     "?",
				},
			},
			Logic: model.Logic_And,
		},
		SQLParams: []*model.SQLParamVal{
			{
				ValueType: table.FieldItemType_Number,
				Value:     ptr.Of("0"),
			},
		},
	}

	_, err = d.DomainSVC.ExecuteSQL(ctx, executeDeleteReq)
	if err != nil {
		return nil, err
	}

	return &table.ResetBotTableResponse{
		Code:     ptr.Of(int64(0)),
		Msg:      ptr.Of("success"),
		BaseResp: base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) GetDatabaseTemplate(ctx context.Context, req *table.GetDatabaseTemplateRequest) (*table.GetDatabaseTemplateResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	databaseID, err := getDatabaseID(ctx, req.TableType, req.DatabaseID)
	if err != nil {
		return nil, err
	}

	err = d.ValidateAccess(ctx, req.DatabaseID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	var fields []*model.FieldItem
	var tableName string
	if req.GetTableType() == table.TableType_DraftTable {
		basics := make([]*model.DatabaseBasic, 1)
		basics[0] = &model.DatabaseBasic{
			ID:        databaseID,
			TableType: table.TableType_DraftTable,
		}
		info, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
			Basics: basics,
		})
		if err != nil {
			return nil, err
		}

		fields = info.Databases[0].FieldList
		tableName = info.Databases[0].TableName
	} else {
		basics := make([]*model.DatabaseBasic, 1)
		basics[0] = &model.DatabaseBasic{
			ID:        databaseID,
			TableType: table.TableType_OnlineTable,
		}
		info, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
			Basics: basics,
		})
		if err != nil {
			return nil, err
		}

		fields = info.Databases[0].FieldList
		tableName = info.Databases[0].TableName
	}

	items := make([]*table.FieldItem, 0, len(fields))
	for _, field := range fields {
		items = append(items, &table.FieldItem{
			Name:         field.Name,
			Desc:         field.Desc,
			Type:         field.Type,
			MustRequired: field.MustRequired,
		})
	}

	resp, err := d.DomainSVC.GetDatabaseTemplate(ctx, &database.GetDatabaseTemplateRequest{
		UserID:     *uid,
		TableName:  tableName,
		FieldItems: items,
	})
	if err != nil {
		return nil, err
	}

	return &table.GetDatabaseTemplateResponse{
		TosUrl: resp.Url,

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}, nil
}

func (d *DatabaseApplicationService) GetConnectorName(ctx context.Context, req *table.GetSpaceConnectorListRequest) (*table.GetSpaceConnectorListResponse, error) {
	return &table.GetSpaceConnectorListResponse{
		ConnectorList: []*table.ConnectorInfo{
			{
				ConnectorID:   consts.CozeConnectorID,
				ConnectorName: "Coze",
			},
			{
				ConnectorID:   consts.WebSDKConnectorID,
				ConnectorName: "Chat SDK",
			},
			{
				ConnectorID:   consts.APIConnectorID,
				ConnectorName: "API",
			},
		},

		Code: 0,
		Msg:  "success",
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}, nil
}

func (d *DatabaseApplicationService) GetBotDatabase(ctx context.Context, req *table.GetBotTableRequest) (*table.GetBotTableResponse, error) {
	relationResp, err := d.DomainSVC.MGetRelationsByAgentID(ctx, &database.MGetRelationsByAgentIDRequest{
		AgentID:   req.GetBotID(),
		TableType: req.GetTableType(),
	})
	if err != nil {
		return nil, err
	}

	relationMap := slices.ToMap(relationResp.Relations, func(d *model.AgentToDatabase) (int64, *model.AgentToDatabase) {
		return d.DatabaseID, d
	})

	resp, err := d.DomainSVC.MGetDatabaseByAgentID(ctx, &database.MGetDatabaseByAgentIDRequest{
		AgentID:       req.GetBotID(),
		TableType:     req.GetTableType(),
		NeedSysFields: false,
	})
	if err != nil {
		return nil, err
	}

	return &table.GetBotTableResponse{
		BotTableList: convertToBotTableList(resp.Databases, req.GetBotID(), relationMap),
		Code:         0,
		Msg:          "success",
		BaseResp:     base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) ValidateDatabaseTableSchema(ctx context.Context, req *table.ValidateTableSchemaRequest) (*table.ValidateTableSchemaResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.GetSourceInfo() == nil || req.GetTableSheet() == nil {
		return nil, fmt.Errorf("source file and table sheet required")
	}

	databaseID, err := getDatabaseID(ctx, req.TableType, req.DatabaseID)
	if err != nil {
		return nil, err
	}

	err = d.ValidateAccess(ctx, req.DatabaseID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	basics := make([]*model.DatabaseBasic, 1)
	basics[0] = &model.DatabaseBasic{
		ID:        databaseID,
		TableType: req.TableType,
	}
	info, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: basics,
	})
	if err != nil {
		return nil, err
	}
	if len(info.Databases) == 0 {
		return nil, fmt.Errorf("database %d not found", req.DatabaseID)
	}

	res, err := d.DomainSVC.ValidateDatabaseTableSchema(ctx, &database.ValidateDatabaseTableSchemaRequest{
		DatabaseID: req.GetDatabaseID(),
		UserID:     *uid,
		TosURL:     req.GetSourceInfo().GetTosURI(),
		TableSheet: databaseEntity.TableSheet{
			SheetID:       req.GetTableSheet().GetSheetID(),
			HeaderLineIdx: req.GetTableSheet().GetHeaderLineIdx(),
			StartLineIdx:  req.GetTableSheet().GetStartLineIdx(),
		},
		Fields: info.Databases[0].FieldList,
	})
	if err != nil {
		return nil, err
	}

	if !res.Valid {
		return nil, errorx.New(errno.ErrMemoryInvalidParamCode,
			errorx.KV("msg", res.GetInvalidMsg()))
	}

	return &table.ValidateTableSchemaResponse{
		Code:     0,
		Msg:      "success",
		BaseResp: base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) GetDatabaseTableSchema(ctx context.Context, req *table.GetTableSchemaRequest) (*document.GetTableSchemaInfoResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	if req.GetSourceFile() == nil || req.GetTableSheet() == nil {
		return nil, fmt.Errorf("source file and table sheet required")
	}

	tableType := table.TableDataType_AllData
	if req.TableDataType != nil {
		tableType = req.GetTableDataType()
	}

	schema, err := d.DomainSVC.GetDatabaseTableSchema(ctx, &database.GetDatabaseTableSchemaRequest{
		DatabaseID: req.GetDatabaseID(),
		UserID:     *uid,
		TosURL:     req.GetSourceFile().GetTosURI(),
		TableSheet: databaseEntity.TableSheet{
			SheetID:       req.GetTableSheet().GetSheetID(),
			HeaderLineIdx: req.GetTableSheet().GetHeaderLineIdx(),
			StartLineIdx:  req.GetTableSheet().GetStartLineIdx(),
		},
		// All data is returned by default without passing it on.
		TableDataType: tableType,
	})
	if err != nil {
		return nil, err
	}

	return &document.GetTableSchemaInfoResponse{
		TableMeta:   schema.TableMeta,
		SheetList:   schema.SheetList,
		PreviewData: schema.PreviewData,
		BaseResp:    base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) SubmitDatabaseInsertTask(ctx context.Context, req *table.SubmitDatabaseInsertRequest) (*table.SubmitDatabaseInsertResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	databaseID, err := getDatabaseID(ctx, req.TableType, req.DatabaseID)
	if err != nil {
		return nil, err
	}

	err = d.ValidateAccess(ctx, req.DatabaseID, table.TableType_OnlineTable)
	if err != nil {
		return nil, err
	}

	err = d.DomainSVC.SubmitDatabaseInsertTask(ctx, &database.SubmitDatabaseInsertTaskRequest{
		DatabaseID: databaseID,
		UserID:     *uid,
		FileURI:    req.GetFileURI(),
		TableSheet: databaseEntity.TableSheet{
			SheetID:       req.GetTableSheet().GetSheetID(),
			HeaderLineIdx: req.GetTableSheet().GetHeaderLineIdx(),
			StartLineIdx:  req.GetTableSheet().GetStartLineIdx(),
		},
		ConnectorID: req.ConnectorID,
		TableType:   req.TableType,
	})
	if err != nil {
		return nil, err
	}

	return &table.SubmitDatabaseInsertResponse{
		Code:     0,
		Msg:      "success",
		BaseResp: base.NewBaseResp(),
	}, nil
}

func (d *DatabaseApplicationService) DatabaseFileProgressData(ctx context.Context, req *table.GetDatabaseFileProgressRequest) (*table.GetDatabaseFileProgressResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session required"))
	}

	databaseID, err := getDatabaseID(ctx, req.TableType, req.DatabaseID)
	if err != nil {
		return nil, err
	}

	res, err := d.DomainSVC.GetDatabaseFileProgressData(ctx, &database.GetDatabaseFileProgressDataRequest{
		DatabaseID: databaseID,
		UserID:     *uid,
		TableType:  req.TableType,
	})
	if err != nil {
		return nil, err
	}

	return &table.GetDatabaseFileProgressResponse{
		Data: &table.DatabaseFileProgressData{
			FileName:       res.FileName,
			Progress:       res.Progress,
			StatusDescript: res.StatusDescript,
		},
		Code:     0,
		Msg:      "success",
		BaseResp: base.NewBaseResp(),
	}, nil
}

func getDatabaseID(ctx context.Context, tableType table.TableType, onlineID int64) (int64, error) {
	if tableType == table.TableType_OnlineTable {
		return onlineID, nil
	}

	online, err := DatabaseApplicationSVC.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: []*model.DatabaseBasic{
			{
				ID:        onlineID,
				TableType: table.TableType_OnlineTable,
			},
		},
	})
	if err != nil {
		return -1, err
	}
	if len(online.Databases) == 0 {
		return -1, fmt.Errorf("online table not found, id: %d", onlineID)
	}

	return online.Databases[0].GetDraftID(), nil
}

func (d *DatabaseApplicationService) ValidateAccess(ctx context.Context, databaseID int64, tableType table.TableType) error {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "session uid not found"))
	}

	do, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
		Basics: []*model.DatabaseBasic{
			{
				ID:        databaseID,
				TableType: tableType,
			},
		},
	})
	if err != nil {
		return err
	}
	if len(do.Databases) == 0 {
		return errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("msg", "database not found"))
	}

	if do.Databases[0].CreatorID != *uid {
		logs.CtxErrorf(ctx, "user(%d) is not the creator(%d) of the database(%d)", *uid, do.Databases[0].CreatorID, databaseID)
		return errorx.New(errno.ErrMemoryPermissionCode, errorx.KV("detail", "you are not the creator of the database"))
	}

	return nil
}

func (d *DatabaseApplicationService) DeleteDatabaseByAppID(ctx context.Context, appID int64) error {
	resp, err := d.DomainSVC.DeleteDatabaseByAppID(ctx, &database.DeleteDatabaseByAppIDRequest{
		AppID: appID,
	})
	if err != nil {
		return err
	}

	deletedIDs := resp.DeletedDatabaseIDs
	for _, deletedID := range deletedIDs {
		err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Deleted,
			Resource: &searchEntity.ResourceDocument{
				ResType: resCommon.ResType_Database,
				ResID:   deletedID,
			},
		})
		if err != nil {
			return err
		}
	}

	return nil
}

func (d *DatabaseApplicationService) CopyDatabase(ctx context.Context, req *CopyDatabaseRequest) (*CopyDatabaseResponse, error) {
	var err error

	basics := make([]*model.DatabaseBasic, 0, len(req.DatabaseIDs))
	for _, id := range req.DatabaseIDs {
		basics = append(basics, &model.DatabaseBasic{
			ID:        id,
			TableType: req.TableType,
		})
	}

	res, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{Basics: basics})
	if err != nil {
		return nil, err
	}

	copyDatabases := make(map[int64]*entity.Database, len(res.Databases))
	draftMaps := make(map[int64]int64)
	onlineMaps := make(map[int64]int64)

	for _, srcDB := range res.Databases {
		if req.Suffix != nil {
			srcDB.TableName += *req.Suffix
		} else {
			srcDB.TableName += "_copy"
		}
		if req.TargetSpaceID != nil {
			srcDB.SpaceID = *req.TargetSpaceID
		}

		originalID := srcDB.ID
		originalDraftID := srcDB.GetDraftID()
		originalOnlineID := srcDB.GetOnlineID()
		srcDB.AppID = req.TargetAppID
		srcDB.CreatorID = req.CreatorID
		if req.TargetSpaceID != nil {

		}
		createDatabaseResp, err := d.DomainSVC.CreateDatabase(ctx, &database.CreateDatabaseRequest{
			Database: srcDB,
		})
		if err != nil {
			return nil, err
		}

		onlineDatabase := createDatabaseResp.Database
		draftResp, err := d.DomainSVC.GetDraftDatabaseByOnlineID(ctx, &database.GetDraftDatabaseByOnlineIDRequest{
			OnlineID: onlineDatabase.ID,
		})
		if err != nil {
			return nil, err
		}

		copyDatabases[originalID] = onlineDatabase
		draftDatabase := draftResp.Database
		draftMaps[originalDraftID] = draftDatabase.ID
		onlineMaps[originalOnlineID] = onlineDatabase.ID

		err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Created,
			Resource: &searchEntity.ResourceDocument{
				ResType:       resCommon.ResType_Database,
				ResID:         onlineDatabase.ID,
				Name:          &onlineDatabase.TableName,
				APPID:         &onlineDatabase.AppID,
				SpaceID:       &onlineDatabase.SpaceID,
				OwnerID:       &onlineDatabase.CreatorID,
				PublishStatus: ptr.Of(resCommon.PublishStatus_Published),
				CreateTimeMS:  ptr.Of(onlineDatabase.CreatedAtMs),
				UpdateTimeMS:  ptr.Of(onlineDatabase.UpdatedAtMs),
			},
		})
		if err != nil {
			return nil, fmt.Errorf("publish resource failed, err=%w", err)
		}
	}

	if !req.IsCopyData {
		return &CopyDatabaseResponse{
			Databases: copyDatabases,
		}, nil
	}

	for srcID, targetID := range draftMaps {
		err = d.duplicateRecords(ctx, srcID, targetID, req.CreatorID, table.TableType_DraftTable)
		if err != nil {
			return nil, err
		}
	}
	for srcID, targetID := range onlineMaps {
		err = d.duplicateRecords(ctx, srcID, targetID, req.CreatorID, table.TableType_OnlineTable)
		if err != nil {
			return nil, err
		}
	}

	return &CopyDatabaseResponse{
		Databases: copyDatabases,
	}, nil
}

func (d *DatabaseApplicationService) duplicateRecords(ctx context.Context, srcDatabaseID, targetDatabaseID, userID int64, tableType table.TableType) error {
	listReq := &database.ListDatabaseRecordRequest{
		DatabaseID: srcDatabaseID,
		TableType:  tableType,
		UserID:     userID,
		Limit:      1000,
		Offset:     0,
	}
	for {
		listResp, err := d.DomainSVC.ListDatabaseRecord(ctx, listReq)
		if err != nil {
			return fmt.Errorf("list source database records failed: %v", err)
		}

		if len(listResp.Records) == 0 {
			break
		}
		addReq := &database.AddDatabaseRecordRequest{
			DatabaseID: targetDatabaseID,
			TableType:  tableType,
			UserID:     userID,
			Records:    listResp.Records,
		}
		err = d.DomainSVC.AddDatabaseRecord(ctx, addReq)
		if err != nil {
			return fmt.Errorf("copy data failed: %v", err)
		}

		if !listResp.HasMore {
			break
		}
		listReq.Offset += listReq.Limit
	}

	return nil
}

type CopyDatabaseRequest struct {
	DatabaseIDs []int64
	TableType   table.TableType // table type of the source databases
	CreatorID   int64

	IsCopyData    bool    // is need to copy data
	TargetSpaceID *int64  // if is nil, it will be set to the same space as the original database
	TargetAppID   int64   // if is nil, it will be set to the same app as the original database; if copy to resource, set to 0
	Suffix        *string // table name suffix for the copied table, default is "_copy"
}

type CopyDatabaseResponse struct {
	Databases map[int64]*entity.Database // key is original database id (online id or draft id), value is the new online database
}

func (d *DatabaseApplicationService) MoveDatabaseToLibrary(ctx context.Context, req *MoveDatabaseToLibraryRequest) (*MoveDatabaseToLibraryResponse, error) {
	basics := make([]*model.DatabaseBasic, 0, len(req.DatabaseIDs))
	for _, id := range req.DatabaseIDs {
		basics = append(basics, &model.DatabaseBasic{
			ID:        id,
			TableType: req.TableType,
		})
	}

	res, err := d.DomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{Basics: basics})
	if err != nil {
		return nil, err
	}

	moveDatabases := make([]*entity.Database, 0, len(req.DatabaseIDs))
	for _, srcDB := range res.Databases {

		srcDB.AppID = 0
		moveDatabaseResp, err := d.DomainSVC.UpdateDatabase(ctx, &database.UpdateDatabaseRequest{
			Database: srcDB,
		})
		if err != nil {
			return nil, err
		}

		onlineDatabase := moveDatabaseResp.Database
		moveDatabases = append(moveDatabases, onlineDatabase)
		// publish resource event
		err = d.eventbus.PublishResources(ctx, &searchEntity.ResourceDomainEvent{
			OpType: searchEntity.Updated,
			Resource: &searchEntity.ResourceDocument{
				ResType:      resCommon.ResType_Database,
				ResID:        onlineDatabase.ID,
				Name:         &onlineDatabase.TableName,
				APPID:        &onlineDatabase.AppID,
				SpaceID:      &onlineDatabase.SpaceID,
				UpdateTimeMS: &onlineDatabase.UpdatedAtMs,
			},
		})
		if err != nil {
			return nil, fmt.Errorf("publish resource failed, err=%w", err)
		}
	}

	return &MoveDatabaseToLibraryResponse{
		Databases: moveDatabases,
	}, nil
}

type MoveDatabaseToLibraryRequest struct {
	DatabaseIDs []int64
	TableType   table.TableType // table type of the source databases
}

type MoveDatabaseToLibraryResponse struct {
	Databases []*entity.Database // the online databases after move
}
