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

package s3

import (
	"context"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func NewStorageImagex(ctx context.Context, ak, sk, bucketName, endpoint, region string) (imagex.ImageX, error) {
	t, err := getS3Client(ctx, ak, sk, bucketName, endpoint, region)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (t *s3Client) GetUploadAuth(ctx context.Context, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	scheme, ok := ctxcache.Get[string](ctx, consts.RequestSchemeKeyInCtx)
	if !ok {
		return nil, errorx.New(errno.ErrUploadHostSchemaNotExistCode)
	}
	return &imagex.SecurityToken{
		AccessKeyID:     "",
		SecretAccessKey: "",
		SessionToken:    "",
		ExpiredTime:     time.Now().Add(time.Hour).Format("2006-01-02 15:04:05"),
		CurrentTime:     time.Now().Format("2006-01-02 15:04:05"),
		HostScheme:      scheme,
	}, nil
}

func (t *s3Client) GetResourceURL(ctx context.Context, uri string, opts ...imagex.GetResourceOpt) (*imagex.ResourceURL, error) {
	url, err := t.GetObjectUrl(ctx, uri)
	if err != nil {
		return nil, err
	}
	return &imagex.ResourceURL{
		URL: url,
	}, nil
}

func (t *s3Client) Upload(ctx context.Context, data []byte, opts ...imagex.UploadAuthOpt) (*imagex.UploadResult, error) {
	return nil, nil
}

func (t *s3Client) GetUploadAuthWithExpire(ctx context.Context, expire time.Duration, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	return nil, nil
}

func (i *s3Client) GetUploadHost(ctx context.Context) string {
	currentHost, ok := ctxcache.Get[string](ctx, consts.HostKeyInCtx)
	if !ok {
		return ""
	}
	return currentHost + consts.ApplyUploadActionURI
}

func (t *s3Client) GetServerID() string {
	return ""
}
