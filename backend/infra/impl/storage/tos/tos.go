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

package tos

import (
	"bytes"
	"time"

	"context"
	"io"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/imagex"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/data_edc/workflow_engine_next/pkg/ctxcache"
	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
	"code.byted.org/data_edc/workflow_engine_next/pkg/logs"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
	"code.byted.org/data_edc/workflow_engine_next/types/errno"
	"code.byted.org/gopkg/logs"
	"code.byted.org/gopkg/tos"
)

type tosClient struct {
	client *tos.Tos
}

func NewStorageImagex(ctx context.Context, bucketName, ak, region, psm string) (imagex.ImageX, error) {
	t, err := getTosClient(ctx, bucketName, ak, region, psm)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func getTosClient(ctx context.Context, bucketName, ak, region, psm string) (*tosClient, error) {
	logs.CtxInfo(ctx, "TOS GO SDK Version: %s", tos.Version)

	TosClient, err := tos.NewTos(tos.WithBucket(bucketName),
		tos.WithCredentials(&tos.BucketAccessKeyCredentials{
			BucketName: bucketName,
			AccessKey:  ak,
		}), tos.WithServiceName("toutiao.tos.tosapi"), tos.WithCluster("default"), tos.WithIDC(region), tos.WithRemotePSM(psm))
	if err != nil {
		return nil, err
	}

	t := &tosClient{
		client: TosClient,
	}
	return t, nil
}

func New(ctx context.Context, bucketName, ak, region, psm string) (storage.Storage, error) {
	t, err := getTosClient(ctx, bucketName, ak, region, psm)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (t *tosClient) PutObject(ctx context.Context, objectKey string, content []byte, opts ...storage.PutOptFn) error {
	client := t.client

	o := storage.PutOption{}
	for _, opt := range opts {
		opt(&o)
	}
	tosOptions := storagePutOptToBytedanceTosOpt(o)

	err := client.PutObject(ctx, objectKey, int64(len(content)), bytes.NewBuffer(content), tosOptions...)
	if err != nil {
		logs.CtxError(ctx, "PutObject failed: %v, objectKey: %v", err, objectKey)
	}

	return err
}

func (t *tosClient) GetObject(ctx context.Context, objectKey string) ([]byte, error) {
	client := t.client

	// 下载数据到内存
	getOutput, err := client.GetObject(ctx, objectKey)
	if err != nil {
		logs.CtxError(ctx, "GetObject failed: %v, objectKey: %v", err, objectKey)
		return nil, err
	}

	body, err := io.ReadAll(getOutput.R)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func (t *tosClient) DeleteObject(ctx context.Context, objectKey string) error {
	client := t.client
	// 删除存储桶中指定对象
	err := client.DelObject(ctx, objectKey)
	if err != nil {
		logs.CtxError(ctx, "DeleteObject failed: %v, objectKey: %v", err, objectKey)
		return err
	}
	return nil
}

func (t *tosClient) GetObjectUrl(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (string, error) {
	// 内网临时域名
	// TODO:: 后续看是否需要支持子域名签名认证
	// 先返回办公网能够访问的地址，后续可以进行区分返回两种不同地址
	productEnvUrl := "https://tosv-va.tiktok-row.org/obj/" + t.client.BucketName() + "/" + objectKey
	return productEnvUrl, nil
}

func storagePutOptToBytedanceTosOpt(o storage.PutOption) []tos.ObjOption {
	var tosOpts []tos.ObjOption
	if o.ContentType != nil {
		tosOpts = append(tosOpts, tos.ContentType(*o.ContentType))
	}
	return tosOpts
}

func (i *tosClient) GetUploadHost(ctx context.Context) string {

	currentHost, ok := ctxcache.Get[string](ctx, consts.HostKeyInCtx)
	if !ok {
		return ""
	}
	return currentHost + consts.ApplyUploadActionURI

}

func (t *tosClient) GetServerID() string {
	return ""
}

func (t *tosClient) GetUploadAuth(ctx context.Context, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
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

func (t *tosClient) GetResourceURL(ctx context.Context, uri string, opts ...imagex.GetResourceOpt) (*imagex.ResourceURL, error) {
	url, err := t.GetObjectUrl(ctx, uri)
	if err != nil {
		return nil, err
	}
	return &imagex.ResourceURL{
		URL: url,
	}, nil
}

func (t *tosClient) Upload(ctx context.Context, data []byte, opts ...imagex.UploadAuthOpt) (*imagex.UploadResult, error) {
	return nil, nil
}

func (t *tosClient) GetUploadAuthWithExpire(ctx context.Context, expire time.Duration, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	return nil, nil
}
