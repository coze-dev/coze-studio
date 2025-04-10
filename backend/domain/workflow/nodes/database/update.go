package database

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/workflow/nodes"
)

type Updater interface {
	Update(context.Context, *UpdateRequest) (*Response, error)
}

type UpdateConfig struct {
	DatabaseInfoID string
	ClauseGroup    *ClauseGroup
	UpdateFields   map[string]nodes.TypeInfo
	OutputConfig   OutputConfig
	Updater        Updater
}

type Update struct {
	config *UpdateConfig
}

type UpdateRequest struct {
	DatabaseInfoID string
	ConditionGroup *ConditionGroup
	Fields         map[string]any
}

type UpdateInventory struct {
	ConditionGroup *ConditionGroup
	Fields         map[string]any
}

func (u *Update) Update(ctx context.Context, inventory *UpdateInventory) (map[string]any, error) {

	req := &UpdateRequest{
		DatabaseInfoID: u.config.DatabaseInfoID,
		ConditionGroup: inventory.ConditionGroup,
		Fields:         inventory.Fields,
	}

	response, err := u.config.Updater.Update(ctx, req)

	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(u.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}

	return ret, nil

}
