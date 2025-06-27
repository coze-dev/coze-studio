package tos

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/volcengine/ve-tos-golang-sdk/v2/tos"
	"github.com/volcengine/ve-tos-golang-sdk/v2/tos/enum"

	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"code.byted.org/flow/opencoze/backend/pkg/lang/conv"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type tosClient struct {
	client     *tos.ClientV2
	bucketName string
}

func New(ctx context.Context, ak, sk, bucketName, endpoint, region string) (storage.Storage, error) {
	logs.CtxInfof(ctx, "TOS GO SDK Version: %s", tos.Version)
	credential := tos.NewStaticCredentials(ak, sk)
	client, err := tos.NewClientV2(endpoint,
		tos.WithCredentials(credential), tos.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("new tos client failed, bucketName: %s, endpoint: %s, region: %s, err: %v", bucketName, endpoint, region, err)
	}

	t := &tosClient{
		client:     client,
		bucketName: bucketName,
	}

	// 创建存储桶
	err = t.CheckAndCreateBucket(ctx)
	if err != nil {
		return nil, err
	}

	// t.test()

	return t, nil
}

func (t *tosClient) test() {
	// 测试上传
	objectKey := fmt.Sprintf("test-%s.txt", time.Now().Format("20060102150405"))
	err := t.PutObject(context.Background(), objectKey, []byte("hello world"))
	if err != nil {
		logs.CtxErrorf(context.Background(), "PutObject failed, objectKey: %s, err: %v", objectKey, err)
	}

	// 测试下载
	content, err := t.GetObject(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetObject failed, objectKey: %s, err: %v", objectKey, err)
	}

	logs.CtxInfof(context.Background(), "GetObject content: %s", string(content))

	// 测试获取URL
	url, err := t.GetObjectUrl(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetObjectUrl failed, objectKey: %s, err: %v", objectKey, err)
	}

	logs.CtxInfof(context.Background(), "GetObjectUrl url: %s", url)

	// 测试删除
	err = t.DeleteObject(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "DeleteObject failed, objectKey: %s, err: %v", objectKey, err)
	}
}

func (t *tosClient) CheckAndCreateBucket(ctx context.Context) error {
	client := t.client
	bucketName := t.bucketName

	_, err := client.HeadBucket(ctx, &tos.HeadBucketInput{Bucket: bucketName})
	if err == nil {
		return nil // already exist
	}

	serverErr, ok := err.(*tos.TosServerError)
	if !ok {
		return err
	}

	if serverErr.StatusCode == http.StatusNotFound {
		// 存储桶不存在
		logs.CtxInfof(ctx, "Bucket not found.")
		resp, err := client.CreateBucketV2(context.Background(), &tos.CreateBucketV2Input{
			Bucket: bucketName,
			ACL:    enum.ACLPrivate,
		})

		logs.CtxInfof(ctx, "Bucket Create resp: %v, err: %v", conv.DebugJsonToStr(resp), err)
		return err
	}

	return err
}

func (t *tosClient) PutObject(ctx context.Context, objectKey string, content []byte, opts ...storage.PutOptFn) error {
	client := t.client
	body := bytes.NewReader(content)
	bucketName := t.bucketName

	_, err := client.PutObjectV2(ctx, &tos.PutObjectV2Input{
		PutObjectBasicInput: tos.PutObjectBasicInput{
			Bucket: bucketName,
			Key:    objectKey,
		},
		Content: body,
	})

	// logs.CtxDebugf(ctx, "PutObject resp: %v, err: %v", conv.DebugJsonToStr(output), err)

	return err
}

func (t *tosClient) GetObject(ctx context.Context, objectKey string) ([]byte, error) {
	client := t.client
	bucketName := t.bucketName

	// 下载数据到内存
	getOutput, err := client.GetObjectV2(ctx, &tos.GetObjectV2Input{
		Bucket:                  bucketName,
		Key:                     objectKey,
		ResponseContentType:     "application/json",
		ResponseContentEncoding: "deflate",
	})
	if err != nil {
		return nil, err
	}

	// logs.CtxDebugf(ctx, "GetObject resp: %v, err: %v", conv.DebugJsonToStr(getOutput), err)

	body, err := io.ReadAll(getOutput.Content)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func (t *tosClient) DeleteObject(ctx context.Context, objectKey string) error {
	client := t.client
	bucketName := t.bucketName

	// 删除存储桶中指定对象
	_, err := client.DeleteObjectV2(ctx, &tos.DeleteObjectV2Input{
		Bucket: bucketName,
		Key:    objectKey,
	})

	return err
}

func (t *tosClient) GetObjectUrl(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (string, error) {
	client := t.client
	bucketName := t.bucketName

	output, err := client.PreSignedURL(&tos.PreSignedURLInput{
		HTTPMethod: enum.HttpMethodGet,
		Expires:    60 * 60 * 24,
		Bucket:     bucketName,
		Key:        objectKey,
	})
	if err != nil {
		return "", err
	}

	return output.SignedUrl, nil
}
