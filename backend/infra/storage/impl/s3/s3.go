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
	"errors"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"

	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/infra/storage/impl/internal/fileutil"
	"github.com/coze-dev/coze-studio/backend/pkg/goutil"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"
)

type s3Client struct {
	client     *s3.Client
	bucketName string
}

func New(ctx context.Context, ak, sk, bucketName, endpoint, region string) (storage.Storage, error) {
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

	awsErr, ok := err.(interface{ ErrorCode() string })
	if !ok || awsErr.ErrorCode() != "404" {
		return err
	}

	// bucket not exist
	input := &s3.CreateBucketInput{
		Bucket: aws.String(bucket),
	}
	_, err = client.CreateBucket(ctx, input)
	return err
}

func (t *s3Client) PutObject(ctx context.Context, objectKey string, content []byte, opts ...storage.PutOptFn) error {
	opts = append(opts, storage.WithObjectSize(int64(len(content))))
	return t.PutObjectWithReader(ctx, objectKey, bytes.NewReader(content), opts...)
}

func (t *s3Client) PutObjectWithReader(ctx context.Context, objectKey string, content io.Reader, opts ...storage.PutOptFn) error {
	client := t.client
	bucket := t.bucketName

	option := storage.PutOption{}
	for _, opt := range opts {
		opt(&option)
	}

	input := &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
		Body:   content,
	}

	if option.ContentType != nil {
		input.ContentType = option.ContentType
	}
	if option.ContentEncoding != nil {
		input.ContentEncoding = option.ContentEncoding
	}
	if option.ContentDisposition != nil {
		input.ContentDisposition = option.ContentDisposition
	}
	if option.ContentLanguage != nil {
		input.ContentLanguage = option.ContentLanguage
	}
	if option.Expires != nil {
		input.Expires = option.Expires
	}

	if option.ObjectSize > 0 {
		input.ContentLength = aws.Int64(option.ObjectSize)
	}

	if option.Tagging != nil {
		input.Tagging = aws.String(goutil.MapToQuery(option.Tagging))
	}

	// upload object
	_, err := client.PutObject(ctx, input)
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

	opt := storage.GetOption{}
	for _, optFn := range opts {
		optFn(&opt)
	}

	expire := int64(60 * 60 * 24)
	if opt.Expire > 0 {
		expire = opt.Expire
	}

	req, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(objectKey),
	}, func(options *s3.PresignOptions) {
		options.Expires = time.Duration(expire) * time.Second
	})
	if err != nil {
		return "", fmt.Errorf("get object presigned url failed: %v", err)
	}

	return req.URL, nil
}

func (t *s3Client) ListAllObjects(ctx context.Context, prefix string, opts ...storage.GetOptFn) ([]*storage.FileInfo, error) {
	const (
		DefaultPageSize = 100
		MaxListObjects  = 10000
	)

	var files []*storage.FileInfo
	var cursor string
	for {
		output, err := t.ListObjectsPaginated(ctx, &storage.ListObjectsPaginatedInput{
			Prefix:   prefix,
			PageSize: DefaultPageSize,
			Cursor:   cursor,
		}, opts...)

		if err != nil {
			return nil, err
		}

		cursor = output.Cursor

		files = append(files, output.Files...)

		if len(files) >= MaxListObjects {
			logs.CtxErrorf(ctx, "list objects failed, max list objects: %d", MaxListObjects)
			break
		}

		if !output.IsTruncated {
			break
		}
	}

	return files, nil
}

func (t *s3Client) ListObjectsPaginated(ctx context.Context, input *storage.ListObjectsPaginatedInput, opts ...storage.GetOptFn) (*storage.ListObjectsPaginatedOutput, error) {
	if input == nil {
		return nil, fmt.Errorf("input cannot be nil")
	}
	if input.PageSize <= 0 {
		return nil, fmt.Errorf("page size must be positive")
	}

	client := t.client
	bucket := t.bucketName

	listObjectsInput := &s3.ListObjectsV2Input{
		Bucket:            aws.String(bucket),
		Prefix:            aws.String(input.Prefix),
		MaxKeys:           aws.Int32(int32(input.PageSize)),
		ContinuationToken: aws.String(input.Cursor),
	}

	p, err := client.ListObjectsV2(ctx, listObjectsInput)
	if err != nil {
		return nil, err
	}

	var files []*storage.FileInfo
	for _, obj := range p.Contents {
		f := &storage.FileInfo{}
		if obj.Key != nil {
			f.Key = *obj.Key
		}
		if obj.LastModified != nil {
			f.LastModified = *obj.LastModified
		}
		if obj.ETag != nil {
			f.ETag = *obj.ETag
		}
		if obj.Size != nil {
			f.Size = *obj.Size
		}
		files = append(files, f)
	}

	output := &storage.ListObjectsPaginatedOutput{
		Files: files,
	}
	if p.IsTruncated != nil {
		output.IsTruncated = *p.IsTruncated
	}
	if p.NextContinuationToken != nil {
		output.Cursor = *p.NextContinuationToken
	}

	opt := storage.GetOption{}
	for _, optFn := range opts {
		optFn(&opt)
	}

	if opt.WithTagging {
		taskGroup := taskgroup.NewTaskGroup(ctx, 5)
		for idx := range files {
			f := files[idx]
			taskGroup.Go(func() error {
				tagging, err := client.GetObjectTagging(ctx, &s3.GetObjectTaggingInput{
					Bucket: aws.String(bucket),
					Key:    aws.String(f.Key),
				})
				if err != nil {
					return err
				}

				f.Tagging = tagsToMap(tagging.TagSet)
				return nil
			})
		}

		if err := taskGroup.Wait(); err != nil {
			return nil, err
		}
	}

	if opt.WithURL {
		files, err = fileutil.AssembleFileUrl(ctx, &opt.Expire, files, t)
		if err != nil {
			return nil, err
		}
	}

	return output, nil
}

func (t *s3Client) HeadObject(ctx context.Context, objectKey string, opts ...storage.GetOptFn) (*storage.FileInfo, error) {
	obj, err := t.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(t.bucketName),
		Key:    aws.String(objectKey),
	})
	if err != nil {
		var nsk *types.NotFound
		if errors.As(err, &nsk) {
			return nil, storage.ErrObjectNotFound
		}
		return nil, err
	}

	f := &storage.FileInfo{
		Key: objectKey,
	}
	if obj.LastModified != nil {
		f.LastModified = *obj.LastModified
	}

	if obj.ETag != nil {
		f.ETag = *obj.ETag
	}

	if obj.ContentLength != nil {
		f.Size = *obj.ContentLength
	}

	opt := storage.GetOption{}
	for _, optFn := range opts {
		optFn(&opt)
	}

	if opt.WithTagging {
		tagging, err := t.client.GetObjectTagging(ctx, &s3.GetObjectTaggingInput{
			Bucket: aws.String(t.bucketName),
			Key:    aws.String(objectKey),
		})
		if err != nil {
			return nil, err
		}

		f.Tagging = tagsToMap(tagging.TagSet)
	}

	if opt.WithURL {
		f.URL, err = t.GetObjectUrl(ctx, objectKey, opts...)
		if err != nil {
			return nil, err
		}
	}

	return f, nil
}

func tagsToMap(tags []types.Tag) map[string]string {
	if len(tags) == 0 {
		return nil
	}
	m := make(map[string]string, len(tags))
	for _, tag := range tags {
		if tag.Key != nil && tag.Value != nil {
			m[*tag.Key] = *tag.Value
		}
	}
	return m
}
