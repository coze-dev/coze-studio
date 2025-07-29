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
	"bytes"
	"context"
	"fmt"
	"io"
	"net"
	"net/url"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type s3Client struct {
	client     *s3.Client
	bucketName string
}

func NewStorageImagex(ctx context.Context, ak, sk, bucketName, endpoint, region string) (imagex.ImageX, error) {
	t, err := getS3Client(ctx, ak, sk, bucketName, endpoint, region)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func getS3Client(ctx context.Context, ak, sk, bucketName, endpoint, region string) (*s3Client, error) {
	creds := credentials.NewStaticCredentialsProvider(ak, sk, "")
	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			PartitionID:       "aws",
			URL:               endpoint,
			SigningRegion:     region,
			HostnameImmutable: true,
			Source:            aws.EndpointSourceCustom,
		}, nil
	})
	cfg, err := config.LoadDefaultConfig(
		context.TODO(),
		config.WithCredentialsProvider(creds),
		config.WithEndpointResolverWithOptions(customResolver),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("init config failed, bucketName: %s, endpoint: %s, region: %s, err: %v", bucketName, endpoint, region, err)
	}

	c := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = false // virtual-host mode
		o.RequestChecksumCalculation = aws.RequestChecksumCalculationWhenRequired
	})

	t := &s3Client{
		client:     c,
		bucketName: bucketName,
	}

	err = t.CheckAndCreateBucket(ctx)
	if err != nil {
		return nil, err
	}

	return t, nil
}

func New(ctx context.Context, ak, sk, bucketName, endpoint, region string) (storage.Storage, error) {
	t, err := getS3Client(ctx, ak, sk, bucketName, endpoint, region)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (t *s3Client) test() {
	// test upload
	objectKey := fmt.Sprintf("test-%s.txt", time.Now().Format("20060102150405"))
	err := t.PutObject(context.Background(), objectKey, []byte("hello world"))
	if err != nil {
		logs.CtxErrorf(context.Background(), "PutObject failed, objectKey: %s, err: %v", objectKey, err)
	}

	// test download
	content, err := t.GetObject(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetObject failed, objectKey: %s, err: %v", objectKey, err)
	}

	logs.CtxInfof(context.Background(), "GetObject content: %s", string(content))

	// test get presigned url
	url, err := t.GetObjectUrl(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "GetObjectUrl failed, objectKey: %s, err: %v", objectKey, err)
	}

	logs.CtxInfof(context.Background(), "GetObjectUrl url: %s", url)

	// test delete
	err = t.DeleteObject(context.Background(), objectKey)
	if err != nil {
		logs.CtxErrorf(context.Background(), "DeleteObject failed, objectKey: %s, err: %v", objectKey, err)
	}
}

func (t *s3Client) CheckAndCreateBucket(ctx context.Context) error {
	client := t.client
	bucket := t.bucketName

	_, err := client.HeadBucket(ctx, &s3.HeadBucketInput{Bucket: aws.String(bucket)})
	if err == nil {
		return nil // already exist
	}

	if err != nil {
		// bucket not exist
		if awsErr, ok := err.(interface{ ErrorCode() string }); ok && awsErr.ErrorCode() == "404" {
			input := &s3.CreateBucketInput{
				Bucket: aws.String(bucket),
			}
			// create bucket
			_, err := client.CreateBucket(ctx, input)
			return err
		}
		// other case
		return err
	}

	return nil
}

func (t *s3Client) PutObject(ctx context.Context, objectKey string, content []byte, opts ...storage.PutOptFn) error {
	client := t.client
	body := bytes.NewReader(content)
	bucket := t.bucketName

	// upload object
	_, err := client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
		Body:   body,
	})
	return err
}

func (t *s3Client) GetObject(ctx context.Context, objectKey string) ([]byte, error) {
	client := t.client
	bucket := t.bucketName

	result, err := client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		return nil, fmt.Errorf("get object failed : %v", err)
	}
	defer result.Body.Close()

	body, err := io.ReadAll(result.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func (t *s3Client) DeleteObject(ctx context.Context, objectKey string) error {
	client := t.client
	bucket := t.bucketName

	_, err := client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
	})

	return err
}

func (t *s3Client) GetObjectUrl(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (string, error) {
	client := t.client
	bucket := t.bucketName
	presignClient := s3.NewPresignClient(client)

	req, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
	}, func(options *s3.PresignOptions) {
		options.Expires = time.Duration(60*60*24) * time.Second
	})
	if err != nil {
		return "", fmt.Errorf("get object presigned url failed: %v", err)
	}

	// url parse
	url, err := url.Parse(req.URL)
	if err != nil {
		logs.CtxWarnf(ctx, "[GetObjectUrl] url parse failed, err: %v", err)
		return req.URL, nil
	}

	proxyPort := os.Getenv(consts.MinIOProxyEndpoint) // :8889
	if len(proxyPort) > 0 {
		currentHost, ok := ctxcache.Get[string](ctx, consts.HostKeyInCtx)
		if !ok {
			return req.URL, nil
		}

		currentScheme, ok := ctxcache.Get[string](ctx, consts.RequestSchemeKeyInCtx)
		if !ok {
			return req.URL, nil
		}

		host, _, err := net.SplitHostPort(currentHost)
		if err != nil {
			host = currentHost
		}
		minioProxyHost := host + proxyPort
		url.Host = minioProxyHost
		url.Scheme = currentScheme
		logs.CtxInfof(ctx, "[GetObjectUrl] reset ORG.URL = %s  TOS.URL = %s", req.URL, url.String())
		return url.String(), nil
	}

	return req.URL, nil
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
