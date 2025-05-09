package connector

import (
	"context"
	"strconv"

	"code.byted.org/flow/opencoze/backend/api/model/developer/connector"
	"code.byted.org/flow/opencoze/backend/domain/connector/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
)

type ConnectorApplication struct{}

var ConnectorApplicationService = new(ConnectorApplication)

func (c *ConnectorApplication) List(ctx context.Context) ([]*connector.PublishConnectorInfo, error) {

	// TODO::mock api &web sdk

	connectorList, err := connectorDomainSVC.List(ctx)
	if err != nil {
		return nil, err
	}
	return c.connectorDO2VO(connectorList), nil

}

func (c *ConnectorApplication) connectorDO2VO(do []*entity.Connector) []*connector.PublishConnectorInfo {

	return slices.Transform(do, func(a *entity.Connector) *connector.PublishConnectorInfo {
		return &connector.PublishConnectorInfo{
			ID:   strconv.FormatInt(a.ID, 10),
			Name: a.Name,
			Desc: a.Desc,
			Icon: a.Icon,
		}
	})
}
