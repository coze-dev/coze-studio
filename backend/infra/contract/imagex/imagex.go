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
	GetServerID() string
	GetUploadHost(ctx context.Context) string
}

type SecurityToken struct {
	AccessKeyID     string `thrift:"access_key_id,1" frugal:"1,default,string" json:"access_key_id"`
	SecretAccessKey string `thrift:"secret_access_key,2" frugal:"2,default,string" json:"secret_access_key"`
	SessionToken    string `thrift:"session_token,3" frugal:"3,default,string" json:"session_token"`
	ExpiredTime     string `thrift:"expired_time,4" frugal:"4,default,string" json:"expired_time"`
	CurrentTime     string `thrift:"current_time,5" frugal:"5,default,string" json:"current_time"`
	HostScheme      string `thrift:"host_scheme,6" frugal:"6,default,string" json:"host_scheme"`
}

type ResourceURL struct {
	// REQUIRED; The resulting graph accesses the thin address, missing the bucket part compared to the default address.
	CompactURL string `json:"CompactURL"`
	// REQUIRED; Result graph access default address.
	URL string `json:"URL"`
}

type UploadResult struct {
	Result    *Result   `json:"Results"`
	RequestId string    `json:"RequestId"`
	FileInfo  *FileInfo `json:"PluginResult"`
}

type Result struct {
	Uri       string `json:"Uri"`
	UriStatus int    `json:"UriStatus"` // 2000 means the upload was successful.
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
