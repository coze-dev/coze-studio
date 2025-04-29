package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/developer/connector"
)

type ConnectorApplication struct{}

var ConnectorApplicationService = new(ConnectorApplication)

func (c *ConnectorApplication) List(ctx context.Context) ([]*connector.PublishConnectorInfo, error) {

	// TODO::mock api &web sdk
	return []*connector.PublishConnectorInfo{
		{
			ID:   "999",
			Name: "Web SDK",
			Desc: "将Bot部署为Web SDK",
			Icon: "",
		},
		{
			ID:   "1024",
			Name: "OpenApi",
			Desc: "调用前需[创建访问凭证](https://www.coze.cn/open/oauth/apps)，支持 OAuth 2.0 和个人访问令牌",
			Icon: "",
		},
	}, nil
}
