package storage

import "context"

// TODO: 支持流式上传下载、文件信息查询

type Storage interface {
	PutObject(ctx context.Context, objectKey string, content []byte) error
	GetObject(ctx context.Context, objectKey string) ([]byte, error)
	DeleteObject(ctx context.Context, objectKey string) error
	GetObjectUrl(ctx context.Context, objectKey string, opts ...Opt) (string, error)
}
