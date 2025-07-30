/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package upload

import (
	"bytes"
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"hash/crc32"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"math"
	"mime"
	"mime/multipart"
	"path"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	_ "golang.org/x/image/tiff"
	_ "golang.org/x/image/webp"

	"github.com/google/uuid"

	"github.com/coze-dev/coze-studio/backend/api/model/file/upload"
	"github.com/coze-dev/coze-studio/backend/api/model/flow/dataengine/dataset"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/developer_api"
	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/playground"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/upload/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func InitService(oss storage.Storage, cache cache.Cmdable) {
	SVC.cache = cache
	SVC.oss = oss
}

var SVC = &UploadService{}

type UploadService struct {
	oss   storage.Storage
	cache cache.Cmdable
}

const (
	uploadKey     = "UploadServiceUpload:%s"
	uploadPartKey = "UploadServiceUpload:%s/parts"
	partKey       = "UploadServiceUpload/%s/part-%s"
)

func (u *UploadService) PartUploadFileInit(ctx context.Context, objKey string) (uploadID string, err error) {
	uploadID = uuid.NewString()
	key := fmt.Sprintf(uploadKey, uploadID)
	err = u.cache.HSet(ctx,
		key,
		"objkey", objKey,
	).Err()
	if err != nil {
		return "", err
	}
	err = u.cache.Expire(ctx, key, time.Minute*10).Err()
	return
}

type PartUploadFileRequest struct {
	UploadID   string
	PartNumber string
	Data       []byte
}

type PartUploadFileResponse struct {
	Crc32 string
}

type PartUploadFileCompleteRequest struct {
	UploadID string
	ObjKey   string
	Crc32Map map[string]string
}

func (u *UploadService) PartUploadFile(ctx context.Context, req *PartUploadFileRequest) (resp *PartUploadFileResponse, err error) {
	key := fmt.Sprintf(uploadKey, req.UploadID)
	exists, err := u.cache.Exists(ctx, key).Result()
	if err != nil || exists == 0 {
		return nil, fmt.Errorf("upload session invalid: %v", err)
	}
	crc32Val := crc32.ChecksumIEEE(req.Data)
	partTosKey := fmt.Sprintf(partKey, req.UploadID, req.PartNumber)
	err = u.oss.PutObject(ctx, partTosKey, req.Data, storage.WithExpires(time.Now().Add(10*time.Minute)))
	if err != nil {
		return nil, err
	}
	partMeta := map[string]interface{}{
		"tos_key": partTosKey,
	}
	partMetaData, err := sonic.Marshal(partMeta)
	if err != nil {
		return nil, err
	}
	partKey := fmt.Sprintf(uploadPartKey, req.UploadID)
	err = u.cache.HSet(ctx, partKey, req.PartNumber, string(partMetaData)).Err()
	if err != nil {
		return nil, err
	}
	err = u.cache.Expire(ctx, partKey, time.Minute*10).Err()
	if err != nil {
		return nil, err
	}
	return &PartUploadFileResponse{
		Crc32: fmt.Sprintf("%08x", crc32Val),
	}, nil
}

type tosPart struct {
	PartNum int
	Data    []byte
}

func getContentType(uri string) (contentType string) {
	_ = mime.AddExtensionType(".svg", "image/svg+xml")
	_ = mime.AddExtensionType(".svgz", "image/svg+xml")
	_ = mime.AddExtensionType(".webp", "image/webp")
	_ = mime.AddExtensionType(".ico", "image/x-icon")
	fileExtension := path.Base(uri)
	ext := path.Ext(fileExtension)
	contentType = mime.TypeByExtension(ext)
	return
}

func (u *UploadService) PartUploadFileComplete(ctx context.Context, req *PartUploadFileCompleteRequest) error {
	partKey := fmt.Sprintf(uploadPartKey, req.UploadID)
	parts, err := u.cache.HGetAll(ctx, partKey).Result()
	if err != nil {
		return err
	}
	tosParts := []*tosPart{}
	for partNumStr, partData := range parts {
		var partMeta map[string]string
		if err := sonic.Unmarshal([]byte(partData), &partMeta); err != nil {
			return fmt.Errorf("failed to parse part metadata: %v", err)
		}
		partNum, err := strconv.ParseInt(partNumStr, 10, 64)
		if err != nil {
			return err
		}
		objKey, exist := partMeta["tos_key"]
		if !exist {
			return errors.New("tos key not exist")
		}
		byteData, err := u.oss.GetObject(ctx, objKey)
		if err != nil {
			return err
		}
		tosParts = append(tosParts, &tosPart{PartNum: int(partNum), Data: byteData})
	}
	if len(tosParts) == 0 {
		return errors.New("tos part is null")
	}
	sort.Slice(tosParts, func(i, j int) bool { return tosParts[i].PartNum < tosParts[j].PartNum })
	if tosParts[len(tosParts)-1].PartNum != len(tosParts) || len(tosParts) != len(req.Crc32Map) {
		return errors.New("check parts fail")
	}
	totalData := []byte{}
	for _, val := range tosParts {
		crc32 := fmt.Sprintf("%08x", crc32.ChecksumIEEE(val.Data))
		crc32Check := req.Crc32Map[strconv.Itoa(val.PartNum)]
		if crc32 != crc32Check {
			return errors.New("crc32 check fail")
		}
		totalData = append(totalData, val.Data...)
	}
	contentType := getContentType(req.ObjKey)
	if len(contentType) != 0 {
		err = u.oss.PutObject(ctx, req.ObjKey, totalData, storage.WithContentType(contentType))
	} else {
		err = u.oss.PutObject(ctx, req.ObjKey, totalData)
	}

	return err
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
func stringToMap(input string) map[string]string {
	result := make(map[string]string)

	pairs := strings.Split(input, ",")

	for _, pair := range pairs {
		parts := strings.Split(pair, ":")
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			result[key] = value
		}
	}

	return result
}
func (u *UploadService) UploadFileCommon(ctx context.Context, req *upload.CommonUploadRequest, fullPath string) (*upload.CommonUploadResponse, error) {
	resp := upload.NewCommonUploadResponse()
	re := regexp.MustCompile(consts.UploadURI + `/([^?]+)`)
	match := re.FindStringSubmatch(fullPath)
	if len(match) == 0 {
		return nil, errorx.New(errno.ErrUploadInvalidParamCode, errorx.KV("msg", "tos key not found"))
	}
	objKey := match[1]
	if strings.Contains(fullPath, "?uploads") {
		uploadID, err := u.PartUploadFileInit(ctx, objKey)
		if err != nil {
			return resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
		}
		resp.Error = &upload.Error{Code: 200}
		resp.Payload = &upload.Payload{UploadID: uploadID}
		return resp, nil
	}
	if len(ptr.From(req.PartNumber)) != 0 {
		_, err := u.PartUploadFile(ctx, &PartUploadFileRequest{
			UploadID:   ptr.From(req.UploadID),
			PartNumber: ptr.From(req.PartNumber),
			Data:       req.ByteData,
		})
		if err != nil {
			return resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
		}
		resp.Error = &upload.Error{Code: 200}
		return resp, nil
	}
	if len(ptr.From(req.UploadID)) != 0 {
		mp := stringToMap(string(req.ByteData))
		err := u.PartUploadFileComplete(ctx, &PartUploadFileCompleteRequest{
			UploadID: ptr.From(req.UploadID),
			ObjKey:   objKey,
			Crc32Map: mp,
		})
		if err != nil {
			return resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
		}
		resp.Error = &upload.Error{Code: 200}
		resp.Payload = &upload.Payload{Key: uuid.NewString()}
		return resp, nil
	}
	var err error
	contentType := getContentType(objKey)
	if len(contentType) != 0 {
		err = u.oss.PutObject(ctx, objKey, req.ByteData, storage.WithContentType(contentType))
	} else {
		err = u.oss.PutObject(ctx, objKey, req.ByteData)
	}
	if err != nil {
		return resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
	}
	resp.Error = &upload.Error{Code: 200}
	resp.Payload = &upload.Payload{Key: uuid.NewString()}
	return resp, err
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

func genObjName(name string, id string) string {

	return fmt.Sprintf("%s/%s/%s",
		"bot_files",
		id,
		name,
	)
}

func (u *UploadService) UploadFileOpen(ctx context.Context, req *playground.UploadFileOpenRequest) (*playground.UploadFileOpenResponse, error) {
	resp := playground.UploadFileOpenResponse{}
	resp.File = new(playground.File)
	uid := ctxutil.MustGetUIDFromApiAuthCtx(ctx)
	if uid == 0 {
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
	objName := genObjName(fileHeader.Filename, randID)
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

func (u *UploadService) UploadSessionKey(ctx context.Context, sessionKey string, tosKey string) error {
	return u.cache.Set(ctx, sessionKey, tosKey, time.Minute*30).Err()
}

type GetObjInfoBySessionKey struct {
	ObjKey string
	Width  int32
	Height int32
}

func isImageUri(uri string) bool {
	if uri == "" {
		return false
	}
	uri = strings.ToLower(uri)
	fileExtension := path.Base(uri)
	ext := path.Ext(fileExtension)
	ext = ext[1:]
	imageExtensions := map[string]bool{
		"jpg":  true,
		"jpeg": true,
		"png":  true,
		"gif":  true,
		"bmp":  true,
		"webp": true,
		"tiff": true,
		"svg":  true,
		"ico":  true,
	}

	// Check if the extension is in the picture extension list
	return imageExtensions[ext]
}
func (u *UploadService) GetObjInfoBySessionKey(ctx context.Context, sessionKey string) (*GetObjInfoBySessionKey, error) {
	resp := GetObjInfoBySessionKey{}
	objKey, err := u.cache.Get(ctx, sessionKey).Result()
	if err != nil {
		return nil, err
	}
	resp.ObjKey = objKey
	if isImageUri(objKey) {
		content, err := u.oss.GetObject(ctx, objKey)
		if err != nil {
			return nil, err
		}
		if isSVG(objKey) {
			width, height, err := getSVGDimensions(content)
			if err != nil {
				logs.CtxErrorf(ctx, "get svg dimensions failed, err: %v", err)
				// default val
				resp.Width = 100
				resp.Height = 100
				return &resp, nil
			}
			resp.Width = width
			resp.Height = height
		} else {
			img, _, err := image.Decode(bytes.NewReader(content))
			if err != nil {
				logs.CtxErrorf(ctx, "decode image failed, err: %v", err)
				// default val
				resp.Width = 100
				resp.Height = 100
				return &resp, nil
			}
			resp.Width = int32(img.Bounds().Dx())
			resp.Height = int32(img.Bounds().Dy())
		}
	}
	return &resp, nil
}

type SVG struct {
	Width   string `xml:"width,attr"`
	Height  string `xml:"height,attr"`
	ViewBox string `xml:"viewBox,attr"`
}

// Get SVG size
func getSVGDimensions(content []byte) (width, height int32, err error) {
	decoder := xml.NewDecoder(bytes.NewReader(content))

	var svg SVG
	if err := decoder.Decode(&svg); err != nil {
		return 100, 100, nil
	}

	// Try to get from the width property
	if svg.Width != "" {
		w, err := parseDimension(svg.Width)
		if err == nil {
			width = w
		}
	}

	// Try to get from the height property
	if svg.Height != "" {
		h, err := parseDimension(svg.Height)
		if err == nil {
			height = h
		}
	}

	// If width or height is not set, try getting it from the viewBox
	if width == 0 || height == 0 {
		if svg.ViewBox != "" {
			parts := strings.Fields(svg.ViewBox)
			if len(parts) >= 4 {
				if width == 0 {
					w, err := strconv.ParseInt(parts[2], 10, 32)
					if err == nil {
						width = int32(w)
					}
				}
				if height == 0 {
					h, err := strconv.ParseInt(parts[3], 10, 32)
					if err == nil {
						height = int32(h)
					}
				}
			}
		}
	}

	if width == 0 || height == 0 {
		return 100, 100, nil
	}

	return width, height, nil
}
func parseDimension(dim string) (int32, error) {
	// Remove units (px, pt, em,%, etc.) and spaces
	dim = strings.TrimSpace(dim)
	dim = strings.TrimRightFunc(dim, func(r rune) bool {
		return (r < '0' || r > '9') && r != '.' && r != '-' && r != '+'
	})

	// Resolve to float64
	value, err := strconv.ParseFloat(dim, 64)
	if err != nil {
		return 0, err
	}

	// Rounding converts to int32
	if value > math.MaxInt32 {
		return math.MaxInt32, nil
	}
	if value < math.MinInt32 {
		return math.MinInt32, nil
	}
	return int32(math.Round(value)), nil
}
func isSVG(uri string) bool {
	uri = strings.ToLower(uri)
	fileExtension := path.Base(uri)
	ext := path.Ext(fileExtension)
	ext = ext[1:]
	return ext == "svg"
}
func (u *UploadService) ApplyImageUpload(ctx context.Context, req *upload.ApplyUploadActionRequest, host string) (*upload.ApplyUploadActionResponse, error) {
	resp := upload.ApplyUploadActionResponse{}
	storeUri := "tos-cn-i-v4nquku3lp/" + uuid.NewString() + ptr.From(req.FileExtension)
	sessionKey := uuid.NewString()
	auth := uuid.NewString()
	uploadID := uuid.NewString()
	uploadHost := string(host) + consts.UploadURI
	resp.ResponseMetadata = &upload.ResponseMetadata{
		RequestId: uuid.NewString(),
		Action:    "ApplyImageUpload",
		Version:   "",
		Service:   "",
		Region:    "",
	}
	resp.Result = &upload.ApplyUploadActionResult{
		UploadAddress: &upload.UploadAddress{
			StoreInfos: []*upload.StoreInfo{
				{
					StoreUri: storeUri,
					Auth:     auth,
					UploadID: uploadID,
				},
			},
			UploadHosts: []string{uploadHost},
			SessionKey:  sessionKey,
		},
		InnerUploadAddress: &upload.InnerUploadAddress{
			UploadNodes: []*upload.UploadNode{
				{
					StoreInfos: []*upload.StoreInfo{
						{
							StoreUri: storeUri,
							Auth:     auth,
							UploadID: uploadID,
						},
					},
					UploadHost: uploadHost,
					SessionKey: sessionKey,
				},
			},
		},
		RequestId: ptr.Of(uuid.NewString()),
	}
	err := u.UploadSessionKey(ctx, sessionKey, storeUri)
	if err != nil {
		return &resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
	}
	return &resp, nil
}

func (u *UploadService) CommitImageUpload(ctx context.Context, req *upload.ApplyUploadActionRequest, host string) (*upload.ApplyUploadActionResponse, error) {
	resp := upload.ApplyUploadActionResponse{}
	type ssKey struct {
		SessionKey string `json:"SessionKey"`
	}
	sskey := ssKey{}
	err := sonic.Unmarshal(req.ByteData, &sskey)
	if err != nil {
		return &resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
	}
	objInfo, err := u.GetObjInfoBySessionKey(ctx, sskey.SessionKey)
	if err != nil {
		return &resp, errorx.New(errno.ErrUploadSystemErrorCode, errorx.KV("msg", err.Error()))
	}
	resp.ResponseMetadata = &upload.ResponseMetadata{
		RequestId: uuid.NewString(),
		Action:    "ApplyImageUpload",
		Version:   "",
		Service:   "",
		Region:    "",
	}
	resp.Result = &upload.ApplyUploadActionResult{
		Results: []*upload.UploadResult{
			{
				Uri:       objInfo.ObjKey,
				UriStatus: 2000,
			},
		},
		RequestId: ptr.Of(uuid.NewString()),
		PluginResult: []*upload.PluginResult{
			{
				FileName:    objInfo.ObjKey,
				SourceUri:   objInfo.ObjKey,
				ImageUri:    objInfo.ObjKey,
				ImageWidth:  objInfo.Width,
				ImageHeight: objInfo.Height,
			},
		},
	}

	return &resp, nil
}
