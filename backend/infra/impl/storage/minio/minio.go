package minio

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
)

type minioClient struct {
	host            string
	client          *minio.Client
	accessKeyID     string
	secretAccessKey string
	bucketName      string
	endpoint        string
}

func New(ctx context.Context, endpoint, accessKeyID, secretAccessKey, bucketName string, useSSL bool) (storage.Storage, error) {
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

	m.Test() // TODO: remove me later

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

// TODO: 测试代码,remove me later
func (m *minioClient) Test() {
	ctx := context.Background()
	objectName := fmt.Sprintf("test-file-%d.txt", rand.Int())

	// 上传文件
	err := m.PutObject(ctx, objectName, []byte("hello content"), storage.WithContentType("text/plain"))
	if err != nil {
		log.Fatalf("文件上传失败: %v", err)
	}
	log.Printf("文件上传成功")

	url, err := m.GetObjectUrl(ctx, objectName)
	if err != nil {
		log.Fatalf("获取文件地址失败 : %v", err)
	}

	log.Printf("文件地址: %s", url)

	// 下载文件

	content, err := m.GetObject(ctx, objectName)
	if err != nil {
		log.Fatalf("文件下载失败: %v", err)
	}

	log.Printf("文件已下载: %s", string(content))

	// 删除对象
	// err = m.DeleteObject(ctx, objectName)
	// if err != nil {
	// 	log.Fatalf("删除对象失败: %v", err)
	// }
	//
	// log.Println("对象已成功删除")
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
		option.Expire = 3600 * 24
	}

	reqParams := make(url.Values)
	presignedURL, err := m.client.PresignedGetObject(ctx, m.bucketName, objectKey, time.Duration(option.Expire)*time.Second, reqParams)
	if err != nil {
		return "", fmt.Errorf("GetObjectUrl failed: %v", err)
	}

	return presignedURL.String(), nil
}
