package storage

import "context"

// TODO: 支持流式上传下载、文件信息查询
//
//go:generate  mockgen -destination ../../../internal/mock/infra/contract/storage/storage_mock.go -package mock -source storage.go Factory
type Storage interface {
	PutObject(ctx context.Context, objectKey string, content []byte, opts ...PutOptFn) error
	GetObject(ctx context.Context, objectKey string) ([]byte, error)
	DeleteObject(ctx context.Context, objectKey string) error
	GetObjectUrl(ctx context.Context, objectKey string, opts ...GetOptFn) (string, error)
}
