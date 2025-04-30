package imagex

import (
	"context"
	"time"
)

//go:generate mockgen -destination ../../../internal/mock/infra/contract/imagex/imagex_mock.go --package imagex -source imagex.go
type ImageX interface {
	GetUploadAuth(ctx context.Context, opt ...UploadAuthOpt) (*SecurityToken, error)
	GetUploadAuthWithExpire(ctx context.Context, expire time.Duration, opt ...UploadAuthOpt) (*SecurityToken, error)
	GetResourceURL(ctx context.Context, uri string, opts ...GetResourceOpt) (*ResourceURL, error)
	Upload(ctx context.Context, data []byte, opts ...UploadAuthOpt) (*UploadResult, error)
}

type SecurityToken struct {
	AccessKeyID     string `thrift:"access_key_id,1" frugal:"1,default,string" json:"access_key_id"`
	SecretAccessKey string `thrift:"secret_access_key,2" frugal:"2,default,string" json:"secret_access_key"`
	SessionToken    string `thrift:"session_token,3" frugal:"3,default,string" json:"session_token"`
	ExpiredTime     string `thrift:"expired_time,4" frugal:"4,default,string" json:"expired_time"`
	CurrentTime     string `thrift:"current_time,5" frugal:"5,default,string" json:"current_time"`
}

type ResourceURL struct {
	// REQUIRED; 结果图访问精简地址，与默认地址相比缺少 Bucket 部分。
	CompactURL string `json:"CompactURL"`
	// REQUIRED; 结果图访问默认地址。
	URL string `json:"URL"`
}

type UploadResult struct {
	Result    *Result   `json:"Results"`
	RequestId string    `json:"RequestId"`
	FileInfo  *FileInfo `json:"PluginResult"`
}

type Result struct {
	Uri       string `json:"Uri"`
	UriStatus int    `json:"UriStatus"` // 2000表示上传成功
}

type FileInfo struct {
	Name        string `json:"FileName"`
	Uri         string `json:"ImageUri"`
	ImageWidth  int    `json:"ImageWidth"`
	ImageHeight int    `json:"ImageHeight"`
	Md5         string `json:"ImageMd5"`
	ImageFormat string `json:"ImageFormat"`
	ImageSize   int    `json:"ImageSize"`
	FrameCnt    int    `json:"FrameCnt"`
	Duration    int    `json:"Duration"`
}
