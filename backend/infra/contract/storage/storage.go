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

package storage

import "context"

//go:generate  mockgen -destination ../../../internal/mock/infra/contract/storage/storage_mock.go -package mock -source storage.go Factory
type Storage interface {
	PutObject(ctx context.Context, objectKey string, content []byte, opts ...PutOptFn) error
	GetObject(ctx context.Context, objectKey string) ([]byte, error)
	DeleteObject(ctx context.Context, objectKey string) error
	GetObjectUrl(ctx context.Context, objectKey string, opts ...GetOptFn) (string, error)
}

type SecurityToken struct {
	AccessKeyID     string `thrift:"access_key_id,1" frugal:"1,default,string" json:"access_key_id"`
	SecretAccessKey string `thrift:"secret_access_key,2" frugal:"2,default,string" json:"secret_access_key"`
	SessionToken    string `thrift:"session_token,3" frugal:"3,default,string" json:"session_token"`
	ExpiredTime     string `thrift:"expired_time,4" frugal:"4,default,string" json:"expired_time"`
	CurrentTime     string `thrift:"current_time,5" frugal:"5,default,string" json:"current_time"`
}
