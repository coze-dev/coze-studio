package entity

const (
	ConnectorTypeWebSDK  = 999
	ConnectorTypeAPI     = 1024
	ConnectorTypeDefault = 1000010
)

var (
	ConnectorLists = []*Connector{
		{
			ID:              ConnectorTypeWebSDK,
			Name:            "Web SDK",
			Icon:            "",
			Desc:            "Web SDK",
			ConnectorStatus: 0,
		},
		{
			ID:              ConnectorTypeAPI,
			Name:            "OpenApi",
			Icon:            "",
			Desc:            "调用前需[创建访问凭证](https://www.coze.cn/open/oauth/apps)",
			ConnectorStatus: 0,
		},
		{
			ID:              ConnectorTypeDefault,
			Name:            "coze",
			Icon:            "",
			Desc:            "coze",
			ConnectorStatus: 0,
		},
	}
)
