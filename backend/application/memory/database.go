package memory

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database"
	databaseEntity "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type DatabaseApplicationService struct{}

var DatabaseSVC = DatabaseApplicationService{}

func (d *DatabaseApplicationService) ListDatabase(ctx context.Context, req *table.ListDatabaseRequest) (*table.ListDatabaseResponse, error) {
	res, err := databaseDomainSVC.ListDatabase(ctx, convertListDatabase(req))
	if err != nil {
		return nil, err
	}

	return convertListDatabaseRes(res), nil
}

func (d *DatabaseApplicationService) GetDatabaseByID(ctx context.Context, req *table.SingleDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	basics := make([]*databaseEntity.DatabaseBasic, 1)
	b := &databaseEntity.DatabaseBasic{
		ID: req.ID,
	}
	if req.IsDraft {
		b.TableType = databaseEntity.TableType_DraftTable
	} else {
		b.TableType = databaseEntity.TableType_OnlineTable
	}

	b.NeedSysFields = req.NeedSysFields
	basics[0] = b

	res, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
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
	res, err := databaseDomainSVC.CreateDatabase(ctx, convertAddDatabase(req))
	if err != nil {
		return nil, err
	}

	return ConvertDatabaseRes(res.Database), nil
}

func (d *DatabaseApplicationService) UpdateDatabase(ctx context.Context, req *table.UpdateDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	res, err := databaseDomainSVC.UpdateDatabase(ctx, ConvertUpdateDatabase(req))
	if err != nil {
		return nil, err
	}

	return convertUpdateDatabaseResult(res), nil
}

func (d *DatabaseApplicationService) DeleteDatabase(ctx context.Context, req *table.DeleteDatabaseRequest) (*table.DeleteDatabaseResponse, error) {
	err := databaseDomainSVC.DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
		Database: &databaseEntity.Database{
			ID: req.ID,
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

func (d *DatabaseApplicationService) BindDatabase(ctx context.Context, req *table.BindDatabaseToBotRequest) (*table.BindDatabaseToBotResponse, error) {
	// todo

	return &table.BindDatabaseToBotResponse{}, nil
}

func (d *DatabaseApplicationService) UnBindDatabase(ctx context.Context, req *table.BindDatabaseToBotRequest) (*table.BindDatabaseToBotResponse, error) {
	// todo

	return &table.BindDatabaseToBotResponse{}, nil
}

func (d *DatabaseApplicationService) ListDatabaseRecords(ctx context.Context, req *table.ListDatabaseRecordsRequest) (*table.ListDatabaseRecordsResponse, error) {
	databaseID := req.DatabaseID
	if req.TableType == table.TableType_DraftTable {
		online, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
			Basics: []*databaseEntity.DatabaseBasic{
				{
					ID:        databaseID,
					TableType: databaseEntity.TableType_OnlineTable,
				},
			},
		})
		if err != nil {
			return nil, err
		}
		if len(online.Databases) == 0 {
			return nil, fmt.Errorf("online table not found, id: %d", databaseID)
		}

		databaseID = online.Databases[0].GetDraftID()
	}

	domainReq := &database.ListDatabaseRecordRequest{
		DatabaseID: databaseID,
		TableType:  databaseEntity.TableType(req.TableType),
		Limit:      int(req.Limit),
		Offset:     int(req.Offset),
	}
	// FilterCriterion, NotFilterByUserID, OrderByList not use

	res, err := databaseDomainSVC.ListDatabaseRecord(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	return convertListDatabaseRecordsRes(res), nil
}

func (d *DatabaseApplicationService) UpdateDatabaseRecords(ctx context.Context, req *table.UpdateDatabaseRecordsRequest) (*table.UpdateDatabaseRecordsResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	dataRes := make([]map[string]string, 0)
	if len(req.GetRecordDataAdd()) > 0 {
		err := databaseDomainSVC.AddDatabaseRecord(ctx, &database.AddDatabaseRecordRequest{
			DatabaseID: req.DatabaseID,
			TableType:  databaseEntity.TableType(req.GetTableType()),
			Records:    req.GetRecordDataAdd(),
			UserID:     *uid,
		})
		if err != nil {
			return nil, err
		}

		dataRes = append(dataRes, req.GetRecordDataAdd()...)
	}

	if len(req.GetRecordDataAlter()) > 0 {
		err := databaseDomainSVC.UpdateDatabaseRecord(ctx, &database.UpdateDatabaseRecordRequest{
			DatabaseID: req.DatabaseID,
			TableType:  databaseEntity.TableType(req.GetTableType()),
			Records:    req.GetRecordDataAlter(),
			UserID:     *uid,
		})
		if err != nil {
			return nil, err
		}

		dataRes = append(dataRes, req.GetRecordDataAlter()...)
	}

	if len(req.GetRecordDataDelete()) > 0 {
		err := databaseDomainSVC.DeleteDatabaseRecord(ctx, &database.DeleteDatabaseRecordRequest{
			DatabaseID: req.DatabaseID,
			TableType:  databaseEntity.TableType(req.GetTableType()),
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
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}, nil
}

func (d *DatabaseApplicationService) GetOnlineDatabaseId(ctx context.Context, req *table.GetOnlineDatabaseIdRequest) (*table.GetOnlineDatabaseIdResponse, error) {
	basics := make([]*databaseEntity.DatabaseBasic, 1)
	basics[0] = &databaseEntity.DatabaseBasic{
		ID:        req.ID,
		TableType: databaseEntity.TableType_DraftTable,
	}

	res, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
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
	}, nil
}

func (d *DatabaseApplicationService) ResetBotTable(ctx context.Context, req *table.ResetBotTableRequest) (*table.ResetBotTableResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	databaseID := req.GetDatabaseInfoID()
	if req.TableType == table.TableType_DraftTable {
		online, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
			Basics: []*databaseEntity.DatabaseBasic{
				{
					ID:        req.GetDatabaseInfoID(),
					TableType: databaseEntity.TableType_OnlineTable,
				},
			},
		})
		if err != nil {
			return nil, err
		}
		if len(online.Databases) == 0 {
			return nil, fmt.Errorf("online table not found, id: %d", databaseID)
		}

		databaseID = online.Databases[0].GetDraftID()
	}

	executeDeleteReq := &database.ExecuteSQLRequest{
		DatabaseID:  databaseID,
		TableType:   databaseEntity.TableType(req.GetTableType()),
		OperateType: databaseEntity.OperateType_Delete,
		User: &userEntity.UserIdentity{
			UserID: *uid,
		},
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      entity.DefaultIDColName,
					Operation: databaseEntity.Operation_GREATER_THAN,
					Right:     "0",
				},
			},
			Logic: databaseEntity.Logic_And,
		},
	}

	_, err := databaseDomainSVC.ExecuteSQL(ctx, executeDeleteReq)
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
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	var fields []*databaseEntity.FieldItem
	var tableName string
	if req.GetTableType() == table.TableType_DraftTable {
		basics := make([]*databaseEntity.DatabaseBasic, 1)
		basics[0] = &databaseEntity.DatabaseBasic{
			ID:        req.GetDatabaseID(),
			TableType: databaseEntity.TableType_DraftTable,
		}
		info, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
			Basics: basics,
		})
		if err != nil {
			return nil, err
		}

		fields = info.Databases[0].FieldList
		tableName = info.Databases[0].TableName
	} else {
		basics := make([]*databaseEntity.DatabaseBasic, 1)
		basics[0] = &databaseEntity.DatabaseBasic{
			ID:        req.GetDatabaseID(),
			TableType: databaseEntity.TableType_OnlineTable,
		}
		info, err := databaseDomainSVC.MGetDatabase(ctx, &database.MGetDatabaseRequest{
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
			Type:         convertToTableFieldType(field.Type),
			MustRequired: field.MustRequired,
		})
	}

	resp, err := databaseDomainSVC.GetDatabaseTemplate(ctx, &database.GetDatabaseTemplateRequest{
		UserID:     *uid,
		TableName:  tableName,
		FieldItems: items,
	})
	if err != nil {
		return nil, err
	}

	return &table.GetDatabaseTemplateResponse{
		TosUrl: resp.Url,
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
				ConnectorID:   consts.AgentAsAPIConnectorID,
				ConnectorName: "API",
			},
		},
		BaseResp: &base.BaseResp{
			StatusCode:    0,
			StatusMessage: "success",
		},
	}, nil
}
