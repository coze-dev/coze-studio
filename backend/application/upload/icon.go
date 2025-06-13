package upload

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"time"

	"code.byted.org/flow/opencoze/backend/api/model/flow/dataengine/dataset"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
	"code.byted.org/flow/opencoze/backend/application/base/ctxutil"
	"code.byted.org/flow/opencoze/backend/domain/upload/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/consts"
	"code.byted.org/flow/opencoze/backend/types/errno"
	"github.com/google/uuid"
)

func InitService(oss storage.Storage) {
	SVC.oss = oss
}

var SVC = &UploadService{}

type UploadService struct {
	oss storage.Storage
}

func (u *UploadService) GetIcon(ctx context.Context, req *developer_api.GetIconRequest) (
	resp *developer_api.GetIconResponse, err error,
) {
	iconURI := map[developer_api.IconType]string{
		developer_api.IconType_Bot:        consts.DefaultAgentIcon,
		developer_api.IconType_User:       consts.DefaultUserIcon,
		developer_api.IconType_Plugin:     consts.DefaultPluginIcon,
		developer_api.IconType_Dataset:    consts.DefaultDatasetIcon,
		developer_api.IconType_Workflow:   consts.DefaultWorkflowIcon,
		developer_api.IconType_Imageflow:  consts.DefaultPluginIcon,
		developer_api.IconType_Society:    consts.DefaultPluginIcon,
		developer_api.IconType_Connector:  consts.DefaultPluginIcon,
		developer_api.IconType_ChatFlow:   consts.DefaultPluginIcon,
		developer_api.IconType_Voice:      consts.DefaultPluginIcon,
		developer_api.IconType_Enterprise: consts.DefaultTeamIcon,
	}

	uri := iconURI[req.GetIconType()]
	if uri == "" {
		return nil, errorx.New(errno.ErrUploadInvalidType,
			errorx.KV("type", conv.Int64ToStr(int64(req.GetIconType()))))
	}

	url, err := u.oss.GetObjectUrl(ctx, iconURI[req.GetIconType()])
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

func (u *UploadService) UploadFile(ctx context.Context, data []byte, objKey string) (*developer_api.UploadFileResponse, error) {
	err := u.oss.PutObject(ctx, objKey, data)
	if err != nil {
		return nil, err
	}

	url, err := u.oss.GetObjectUrl(ctx, objKey)
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

func (u *UploadService) GetShortcutIcons(ctx context.Context) ([]*playground.FileInfo, error) {
	shortcutIcons := entity.GetDefaultShortcutIconURI()
	fileList := make([]*playground.FileInfo, 0, len(shortcutIcons))
	for _, uri := range shortcutIcons {
		url, err := u.oss.GetObjectUrl(ctx, uri)
		if err == nil {
			fileList = append(fileList, &playground.FileInfo{
				URL: url,
				URI: uri,
			})
		}
	}
	return fileList, nil

}

func parseMultipartFormData(ctx context.Context, req *playground.UploadFileOpenRequest) (*multipart.Form, error) {
	_, params, err := mime.ParseMediaType(req.ContentType)
	if err != nil {
		return nil, errorx.New(errno.ErrUploadInvalidContentTypeCode, errorx.KV("content-type", req.ContentType))
	}
	br := bytes.NewReader(req.Data)
	mr := multipart.NewReader(br, params["boundary"])

	form, err := mr.ReadForm(maxFileSize)
	if errors.Is(err, multipart.ErrMessageTooLarge) {
		return nil, errorx.New(errno.ErrUploadInvalidFileSizeCode)
	} else if err != nil {
		return nil, errorx.New(errno.ErrUploadMultipartFormDataReadFailedCode)
	}
	return form, nil
}
func genObjName(contentType, name string, uid string, id string) string {
	if len(uid) == 0 {
		uid = "default"
	}
	return fmt.Sprintf("%s/%s/%s/%s/%s",
		"bot_files",
		uid,
		contentType,
		id,
		name,
	)
}
func (u *UploadService) UploadFileOpen(ctx context.Context, req *playground.UploadFileOpenRequest) (*playground.UploadFileOpenResponse, error) {
	resp := playground.UploadFileOpenResponse{}
	resp.File = new(playground.File)
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrKnowledgePermissionCode, errorx.KV("msg", "session required"))
	}
	form, err := parseMultipartFormData(ctx, req)
	if err != nil {
		logs.CtxErrorf(ctx, "parse multipart form data failed, err: %v", err)
		return nil, err
	}
	if len(form.File["file"]) == 0 {
		return nil, errorx.New(errno.ErrUploadEmptyFileCode)
	} else if len(form.File["file"]) > 1 {
		return nil, errorx.New(errno.ErrUploadFileUploadGreaterOneCode)
	}
	fileHeader := form.File["file"][0]

	// open file
	file, err := fileHeader.Open()
	if err != nil {
		return nil, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", "fileHeader open failed"))
	}
	defer file.Close()
	data, err := io.ReadAll(file)
	if err != nil {
		return nil, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", "file upload io read failed"))
	}
	resp.File.Bytes = int64(len(data))
	randID := uuid.NewString()
	objName := genObjName(req.ContentType, fileHeader.Filename, fmt.Sprintf("%d", ptr.From(uid)), randID)
	resp.File.FileName = fileHeader.Filename
	resp.File.URI = objName
	err = u.oss.PutObject(ctx, objName, data)
	if err != nil {
		return nil, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", "file upload to oss failed"))
	}
	url, err := u.oss.GetObjectUrl(ctx, objName)
	if err != nil {
		return nil, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", "get object url failed"))

	}
	resp.File.CreatedAt = time.Now().Unix()
	resp.File.URL = url
	return &resp, nil
}

func (u *UploadService) GetIconForDataset(ctx context.Context, req *dataset.GetIconRequest) (*dataset.GetIconResponse, error) {
	resp := dataset.NewGetIconResponse()
	var uri string
	switch req.FormatType {
	case dataset.FormatType_Text:
		uri = TextKnowledgeDefaultIcon
	case dataset.FormatType_Table:
		uri = TableKnowledgeDefaultIcon
	case dataset.FormatType_Image:
		uri = ImageKnowledgeDefaultIcon
	case dataset.FormatType_Database:
		uri = DatabaseDefaultIcon
	default:
		uri = TextKnowledgeDefaultIcon
	}

	iconUrl, err := u.oss.GetObjectUrl(ctx, uri)
	if err != nil {
		return resp, err
	}
	resp.Icon = &dataset.Icon{
		URL: iconUrl,
		URI: uri,
	}
	return resp, nil
}
