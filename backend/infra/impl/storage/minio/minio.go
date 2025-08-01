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

package minio

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage/proxy"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type minioClient struct {
	host            string
	client          *minio.Client
	accessKeyID     string
	secretAccessKey string
	bucketName      string
	endpoint        string
}

func NewStorageImagex(ctx context.Context, endpoint, accessKeyID, secretAccessKey, bucketName string, useSSL bool) (imagex.ImageX, error) {
	m, err := getMinioClient(ctx, endpoint, accessKeyID, secretAccessKey, bucketName, useSSL)
	if err != nil {
		return nil, err
	}
	return m, nil
}

func getMinioClient(_ context.Context, endpoint, accessKeyID, secretAccessKey, bucketName string, useSSL bool) (*minioClient, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("init minio client failed %v", err)
	}

	m := &minioClient{
		client:          client,
		accessKeyID:     accessKeyID,
		secretAccessKey: secretAccessKey,
		bucketName:      bucketName,
		endpoint:        endpoint,
	}

	err = m.createBucketIfNeed(context.Background(), client, bucketName, "cn-north-1")
	if err != nil {
		return nil, fmt.Errorf("init minio client failed %v", err)
	}
	return m, nil
}

func New(ctx context.Context, endpoint, accessKeyID, secretAccessKey, bucketName string, useSSL bool) (storage.Storage, error) {
	m, err := getMinioClient(ctx, endpoint, accessKeyID, secretAccessKey, bucketName, useSSL)
	if err != nil {
		return nil, err
	}
	return m, nil
}

func (m *minioClient) createBucketIfNeed(ctx context.Context, client *minio.Client, bucketName, region string) error {
	exists, err := client.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("check bucket %s exist failed %v", bucketName, err)
	}

	if exists {
		return nil
	}

	err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: region})
	if err != nil {
		return fmt.Errorf("create bucket %s failed %v", bucketName, err)
	}

	return nil
}

func (m *minioClient) test() {
	ctx := context.Background()
	objectName := fmt.Sprintf("test-file-%d.txt", rand.Int())

	err := m.PutObject(ctx, objectName, []byte("hello content"), storage.WithContentType("text/plain"))
	if err != nil {
		log.Fatalf("upload file failed: %v", err)
	}
	log.Printf("upload file success")

	url, err := m.GetObjectUrl(ctx, objectName)
	if err != nil {
		log.Fatalf("get file url failed: %v", err)
	}

	log.Printf("get file url success, url: %s", url)

	content, err := m.GetObject(ctx, objectName)
	if err != nil {
		log.Fatalf("download file failed: %v", err)
	}

	log.Printf("download file success, content: %s", string(content))

	err = m.DeleteObject(ctx, objectName)
	if err != nil {
		log.Fatalf("delete object failed: %v", err)
	}

	log.Printf("delete object success")
}

func (m *minioClient) PutObject(ctx context.Context, objectKey string, content []byte, opts ...storage.PutOptFn) error {
	option := storage.PutOption{}
	for _, opt := range opts {
		opt(&option)
	}

	minioOpts := minio.PutObjectOptions{}
	if option.ContentType != nil {
		minioOpts.ContentType = *option.ContentType
	}

	if option.ContentEncoding != nil {
		minioOpts.ContentEncoding = *option.ContentEncoding
	}

	if option.ContentDisposition != nil {
		minioOpts.ContentDisposition = *option.ContentDisposition
	}

	if option.ContentLanguage != nil {
		minioOpts.ContentLanguage = *option.ContentLanguage
	}

	if option.Expires != nil {
		minioOpts.Expires = *option.Expires
	}

	_, err := m.client.PutObject(ctx, m.bucketName, objectKey,
		bytes.NewReader(content), int64(len(content)), minioOpts)
	if err != nil {
		return fmt.Errorf("PutObject failed: %v", err)
	}
	return nil
}

func (m *minioClient) GetObject(ctx context.Context, objectKey string) ([]byte, error) {
	obj, err := m.client.GetObject(ctx, m.bucketName, objectKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("GetObject failed: %v", err)
	}
	defer obj.Close()
	data, err := io.ReadAll(obj)
	if err != nil {
		return nil, fmt.Errorf("ReadObject failed: %v", err)
	}
	return data, nil
}

func (m *minioClient) DeleteObject(ctx context.Context, objectKey string) error {
	err := m.client.RemoveObject(ctx, m.bucketName, objectKey, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("DeleteObject failed: %v", err)
	}
	return nil
}

func (m *minioClient) GetObjectUrl(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (string, error) {
	option := storage.GetOption{}
	for _, opt := range opts {
		opt(&option)
	}

	if option.Expire == 0 {
		option.Expire = 3600 * 24 * 7
	}

	reqParams := make(url.Values)
	presignedURL, err := m.client.PresignedGetObject(ctx, m.bucketName, objectKey, time.Duration(option.Expire)*time.Second, reqParams)
	if err != nil {
		return "", fmt.Errorf("GetObjectUrl failed: %v", err)
	}

	// logs.CtxDebugf(ctx, "[GetObjectUrl] origin presignedURL.String = %s", presignedURL.String())
	ok, proxyURL := proxy.CheckIfNeedReplaceHost(ctx, presignedURL.String())
	if ok {
		return proxyURL, nil
	}

	return presignedURL.String(), nil
}

func (m *minioClient) GetUploadHost(ctx context.Context) string {
	currentHost, ok := ctxcache.Get[string](ctx, consts.HostKeyInCtx)
	if !ok {
		return ""
	}
	return currentHost + consts.ApplyUploadActionURI
}

func (m *minioClient) GetServerID() string {
	return ""
}

func (m *minioClient) GetUploadAuth(ctx context.Context, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	scheme := strings.ToLower(os.Getenv(consts.StorageUploadHTTPScheme))
	if scheme == "" {
		scheme = "http"
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

func (m *minioClient) GetResourceURL(ctx context.Context, uri string, opts ...imagex.GetResourceOpt) (*imagex.ResourceURL, error) {
	url, err := m.GetObjectUrl(ctx, uri)
	if err != nil {
		return nil, err
	}
	return &imagex.ResourceURL{
		URL: url,
	}, nil
}

func (m *minioClient) Upload(ctx context.Context, data []byte, opts ...imagex.UploadAuthOpt) (*imagex.UploadResult, error) {
	return nil, nil
}

func (m *minioClient) GetUploadAuthWithExpire(ctx context.Context, expire time.Duration, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	return nil, nil
}
