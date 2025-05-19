package icon

import (
	"context"
	"errors"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

func InitService(oss storage.Storage) {
	SVC.oss = oss
}

var SVC = &Icon{}

type Icon struct {
	oss storage.Storage
}

func (i *Icon) GetIcon(ctx context.Context, req *developer_api.GetIconRequest) (
	resp *developer_api.GetIconResponse, err error,
) {
	iconURI := map[developer_api.IconType]string{
		developer_api.IconType_Bot:        "default_icon/user_default_icon.png",
		developer_api.IconType_User:       "default_icon/user_default_icon.png",
		developer_api.IconType_Plugin:     "default_icon/plugin_default_icon.png",
		developer_api.IconType_Dataset:    "default_icon/plugin_default_icon.png",
		developer_api.IconType_Workflow:   "default_icon/plugin_default_icon.png",
		developer_api.IconType_Imageflow:  "default_icon/plugin_default_icon.png",
		developer_api.IconType_Society:    "default_icon/plugin_default_icon.png",
		developer_api.IconType_Connector:  "default_icon/plugin_default_icon.png",
		developer_api.IconType_ChatFlow:   "default_icon/plugin_default_icon.png",
		developer_api.IconType_Voice:      "default_icon/plugin_default_icon.png",
		developer_api.IconType_Enterprise: "default_icon/team_default_icon.png",
	}

	uri := iconURI[req.GetIconType()]
	if uri == "" {
		return nil, errors.New("invalid icon type")
	}

	url, err := i.oss.GetObjectUrl(ctx, iconURI[req.GetIconType()])
	if err != nil {
		return nil, err
	}

	return &developer_api.GetIconResponse{
		Data: &developer_api.GetIconResponseData{
			IconList: []*developer_api.Icon{
				{
					URL: url,
					URI: uri,
				},
			},
		},
	}, nil
}

func (i *Icon) UploadFile(ctx context.Context, data []byte, objKey string) (*developer_api.UploadFileResponse, error) {
	err := i.oss.PutObject(ctx, objKey, data)
	if err != nil {
		return nil, err
	}
	url, err := i.oss.GetObjectUrl(ctx, objKey)
	if err != nil {
		return nil, err
	}
	return &developer_api.UploadFileResponse{
		Data: &developer_api.UploadFileData{
			UploadURL: url,
			UploadURI: objKey,
		},
	}, nil
}
