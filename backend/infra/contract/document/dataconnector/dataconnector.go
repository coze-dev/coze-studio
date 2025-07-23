package dataconnector

import (
	"context"
)

type ConnectorConfig struct {
	ConnectorName string      `json:"connector_name"`
	ConnectorID   ConnectorID `json:"connector_id"`
	AuthConfig    AuthConfig  `json:"auth_config"`
	BaseOpenURL   string      `json:"base_open_url"`
	AuthType      string      `json:"auth_type"`
}

type AuthConfig struct {
	ClientID         string `json:"client_id"`
	ClientSecret     string `json:"client_secret"`
	RedirectURI      string `json:"redirect_uri"`
	AuthorizationURI string `json:"authorization_uri"`
	GetTokenURI      string `json:"get_token_uri"`
}

type ConnectorID int64

const (
	ConnectorIDFeishuWeb ConnectorID = 103
)

type AuthTokenInfo struct {
	AccessToken     string      `json:"access_token"`
	RefreshToken    string      `json:"refresh_token"`
	TokenExpireIn   int64       `json:"token_expire_in"`
	RefreshExpireIn int64       `json:"refresh_expire_in"`
	Scope           string      `json:"scope"`
	Extra           interface{} `json:"extra"`
}

type AuthInfo struct {
	ID          int64         `json:"id"`           // 主键id
	CreatorID   int64         `json:"creator_id"`   // 用户id
	ConnectorID int64         `json:"connector_id"` // 数据来源ID
	AuthUniqID  string        `json:"auth_uniq_id"` // 令牌的uuid
	Name        string        `json:"name"`         // 名称
	Icon        string        `json:"icon"`         // icon
	AuthType    string        `json:"auth_type"`    // 鉴权类型["none"、"oauth"...]
	AuthInfo    AuthTokenInfo `json:"auth_info"`    // json 存储鉴权详细配置
}

type FileNodeType int

const (
	FileNodeTypeFolder   FileNodeType = 1
	FileNodeTypeDocument FileNodeType = 2
	FileNodeTypeSheet    FileNodeType = 3
	FileNodeTypeSpace    FileNodeType = 4
)

type DocSourceType int64

const (
	DocSourceTypeDrive = 1
	DocSourceTypeWiki  = 2
)

type SearchFileRequest struct {
	AuthID        int64          `json:"auth_id"`
	SearchQuery   *string        `json:"search_query"`
	NodeID        *string        `json:"node_id"`
	FileTypeList  []FileNodeType `json:"file_type_list"`
	DocSourceType DocSourceType  `json:"doc_source_type"`
	FolderID      *string        `json:"folder_id"`
	PageToken     *string        `json:"page_token"`
	SpaceID       *string        `json:"space_id"`
	OffSet        *int64         `json:"offset"`
	PageSize      *int64         `json:"page_size"`
}

type FileNode struct {
	FileID           string       `json:"file_id"`
	FileNodeType     FileNodeType `json:"file_node_type"`
	FileName         string       `json:"file_name"`
	HasChildrenNodes bool         `json:"has_children_nodes"`
	ChildrenNodes    []*FileNode  `json:"children_nodes"`
	Icon             string       `json:"icon"`
	FileType         FileType     `json:"file_type"`
	FileURL          string       `json:"file_url"`
	SpaceID          *string      `json:"space_id"`          // lark wiki space id
	SpaceType        *string      `json:"space_type"`        // wiki, 表示知识空间类型（团队空间 或 个人空间）
	SpaceDescription *string      `json:"space_description"` // wiki, 知识空间描述
	SpaceVisibility  *string      `json:"space_visibility"`  // wiki, wiki, 知识空间可见性（公开空间 或 私有空间）
	ObjToken         *string      `json:"obj_token"`         // wiki, 对应文档类型的token，可根据 obj_type 判断属于哪种文档类型
	ObjType          *string      `json:"obj_type"`          // wiki, 文档类型，对于快捷方式，该字段是对应的实体的obj_type
	CreateTime       int64        `json:"create_time"`
	UpdateTime       int64        `json:"update_time"`
}

type FileType string

const (
	FileTypeDoc   FileType = "doc"
	FileTypeDocx  FileType = "docx"
	FileTypeSheet FileType = "sheet"
)

type SearchFileResponse struct {
	FileList  []*FileNode `json:"file_list"`
	HasMore   bool        `json:"has_more"`
	PageToken string      `json:"page_token"`
	Total     int64       `json:"total"`
	Offset    int64       `json:"offset"`
}

type Fetcher interface {
	GetConsentURL(ctx context.Context) (string, error)
	AuthorizeCode(ctx context.Context, creatorID int64, code string) error
	GetAuthInfo(ctx context.Context, creatorID int64) ([]*AuthInfo, error)
	GetAccessTokenByAuthID(ctx context.Context, authID int64) (string, error)
	RefreshAccessToken(ctx context.Context, authID int64) (string, error)
	SearchFile(ctx context.Context, req *SearchFileRequest) (*SearchFileResponse, error)
}
