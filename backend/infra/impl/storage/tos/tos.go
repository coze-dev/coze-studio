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

	"context"
	"fmt"
	"io"
	"os"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/gopkg/logs"
	"code.byted.org/gopkg/tos"
)

type tosClient struct {
	client *tos.Tos
}

func New(ctx context.Context, bucketName string, accessKey string, psm string) (storage.Storage, error) {
	logs.CtxInfo(ctx, "TOS GO SDK Version: %s", tos.Version)

	TosClient, err := tos.NewTos(tos.WithBucket(bucketName),
		tos.WithCredentials(&tos.BucketAccessKeyCredentials{
			BucketName: bucketName,
			AccessKey:  accessKey,
		}), tos.WithServiceName("toutiao.tos.tosapi"), tos.WithCluster("default"), tos.WithRemotePSM(psm))
	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(-1)
	}

	t := &tosClient{
		client: TosClient,
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
