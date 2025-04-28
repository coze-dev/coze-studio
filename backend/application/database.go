package application

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/base"
	"code.byted.org/flow/opencoze/backend/api/model/table"
	"code.byted.org/flow/opencoze/backend/application/convertor"
	"code.byted.org/flow/opencoze/backend/domain/memory/database"
	entity2 "code.byted.org/flow/opencoze/backend/domain/memory/database/entity"
	"code.byted.org/flow/opencoze/backend/domain/memory/infra/rdb/entity"
	userEntity "code.byted.org/flow/opencoze/backend/domain/user/entity"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type DatabaseApplicationService struct{}

var DatabaseSVC = DatabaseApplicationService{}

func (d *DatabaseApplicationService) ListDatabase(ctx context.Context, req *table.ListDatabaseRequest) (*table.ListDatabaseResponse, error) {
	res, err := databaseDomainSVC.ListDatabase(ctx, convertor.ConvertListDatabase(req))
	if err != nil {
		return nil, err
	}

	return convertor.ConvertListDatabaseRes(res), nil
}

func (d *DatabaseApplicationService) GetDatabaseByID(ctx context.Context, req *table.SingleDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	basics := make([]*entity2.DatabaseBasic, 1)
	b := &entity2.DatabaseBasic{
		ID: req.ID,
	}
	if req.IsDraft {
		b.TableType = entity2.TableType_DraftTable
	} else {
		b.TableType = entity2.TableType_OnlineTable
	}

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

	return convertor.ConvertDatabaseRes(res.Databases[0]), nil
}

func (d *DatabaseApplicationService) AddDatabase(ctx context.Context, req *table.AddDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	res, err := databaseDomainSVC.CreateDatabase(ctx, convertor.ConvertAddDatabase(req))
	if err != nil {
		return nil, err
	}

	return convertor.ConvertDatabaseRes(res.Database), nil
}

func (d *DatabaseApplicationService) UpdateDatabase(ctx context.Context, req *table.UpdateDatabaseRequest) (*table.SingleDatabaseResponse, error) {
	res, err := databaseDomainSVC.UpdateDatabase(ctx, convertor.ConvertUpdateDatabase(req))
	if err != nil {
		return nil, err
	}

	return convertor.ConvertUpdateDatabaseRes(res), nil
}

func (d *DatabaseApplicationService) DeleteDatabase(ctx context.Context, req *table.DeleteDatabaseRequest) (*table.DeleteDatabaseResponse, error) {
	err := databaseDomainSVC.DeleteDatabase(ctx, &database.DeleteDatabaseRequest{
		Database: &entity2.Database{
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
	res, err := databaseDomainSVC.ListDatabaseRecord(ctx, convertor.ConvertListDatabaseRecords(req))
	if err != nil {
		return nil, err
	}

	return convertor.ConvertListDatabaseRecordsRes(res), nil
}

func (d *DatabaseApplicationService) UpdateDatabaseRecords(ctx context.Context, req *table.UpdateDatabaseRecordsRequest) (*table.UpdateDatabaseRecordsResponse, error) {
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	dataRes := make([]map[string]string, 0)
	if len(req.GetRecordDataAdd()) > 0 {
		err := databaseDomainSVC.AddDatabaseRecord(ctx, &database.AddDatabaseRecordRequest{
			DatabaseID: req.DatabaseID,
			TableType:  entity2.TableType(req.GetTableType()),
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
			TableType:  entity2.TableType(req.GetTableType()),
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
			TableType:  entity2.TableType(req.GetTableType()),
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
	basics := make([]*entity2.DatabaseBasic, 1)
	basics[0] = &entity2.DatabaseBasic{
		ID:        req.ID,
		TableType: entity2.TableType_DraftTable,
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
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	executeDeleteReq := &database.ExecuteSQLRequest{
		DatabaseID:  req.GetDatabaseInfoID(),
		TableType:   entity2.TableType(req.GetTableType()),
		OperateType: entity2.OperateType_Delete,
		User: &userEntity.UserIdentity{
			UserID: *uid,
		},
		Condition: &database.ComplexCondition{
			Conditions: []*database.Condition{
				{
					Left:      entity.DefaultIDColName,
					Operation: entity2.Operation_GREATER_THAN,
					Right:     "0",
				},
			},
			Logic: entity2.Logic_And,
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
	uid := getUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionCode, errorx.KV("msg", "session required"))
	}

	var fields []*entity2.FieldItem
	var tableName string
	if req.GetTableType() == table.TableType_DraftTable {
		basics := make([]*entity2.DatabaseBasic, 1)
		basics[0] = &entity2.DatabaseBasic{
			ID:        req.GetDatabaseID(),
			TableType: entity2.TableType_DraftTable,
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
		basics := make([]*entity2.DatabaseBasic, 1)
		basics[0] = &entity2.DatabaseBasic{
			ID:        req.GetDatabaseID(),
			TableType: entity2.TableType_OnlineTable,
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
			Type:         convertor.ConvertToTableFieldType(field.Type),
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
