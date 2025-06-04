package database

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type UpdateConfig struct {
	DatabaseInfoID int64
	ClauseGroup    *database.ClauseGroup
	OutputConfig   map[string]*vo.TypeInfo
	Updater        database.DatabaseOperator
}

type Update struct {
	config *UpdateConfig
}
type UpdateInventory struct {
	ConditionGroup *database.ConditionGroup
	Fields         map[string]any
}

func NewUpdate(ctx context.Context, cfg *UpdateConfig) (*Update, error) {
	if cfg == nil {
		return nil, errors.New("config is required")
	}
	if cfg.DatabaseInfoID == 0 {
		return nil, errors.New("database info id is required and greater than 0")
	}

	if cfg.ClauseGroup == nil {
		return nil, errors.New("clause group is required and greater than 0")
	}

	if cfg.Updater == nil {
		return nil, errors.New("updater is required")
	}

	return &Update{config: cfg}, nil
}

func (u *Update) Update(ctx context.Context, inventory *UpdateInventory) (map[string]any, error) {

	req := &database.UpdateRequest{
		DatabaseInfoID: u.config.DatabaseInfoID,
		ConditionGroup: inventory.ConditionGroup,
		Fields:         inventory.Fields,
		IsDebugRun:     isDebugExecute(ctx),
	}

	response, err := u.config.Updater.Update(ctx, req)

	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(u.config.OutputConfig, response)
	if err != nil {
		return nil, err
	}

	return ret, nil

}
