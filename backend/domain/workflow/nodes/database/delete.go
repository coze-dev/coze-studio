package database

import "context"

type Deleter interface {
	Delete(context.Context, *DeleteRequest) (*Response, error)
}

type DeleteConfig struct {
	DatabaseInfoID string
	ClauseGroup    *ClauseGroup
	OutputConfig   OutputConfig
	Limit          uint
	Deleter        Deleter
}
type Delete struct {
	config *DeleteConfig
}

type DeleteRequest struct {
	DatabaseInfoID string
	Limit          uint
	ConditionGroup *ConditionGroup
}

func (d *Delete) Delete(ctx context.Context, conditionGroup *ConditionGroup) (map[string]any, error) {

	request := &DeleteRequest{
		DatabaseInfoID: d.config.DatabaseInfoID,
		ConditionGroup: conditionGroup,
	}

	response, err := d.config.Deleter.Delete(ctx, request)
	if err != nil {
		return nil, err
	}

	ret, err := responseFormatted(d.config.OutputConfig.OutputList, response)
	if err != nil {
		return nil, err
	}
	ret[rowNum] = response.RowNumber

	return ret, nil
}
