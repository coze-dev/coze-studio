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

package es

import (
	"context"
)

type Client interface {
	Create(ctx context.Context, index, id string, document any) error
	Update(ctx context.Context, index, id string, document any) error
	Delete(ctx context.Context, index, id string) error
	Search(ctx context.Context, index string, req *Request) (*Response, error)
	Exists(ctx context.Context, index string) (bool, error)
	CreateIndex(ctx context.Context, index string, properties map[string]any) error
	DeleteIndex(ctx context.Context, index string) error
	Types() Types
	NewBulkIndexer(index string) (BulkIndexer, error)
}

type Types interface {
	NewLongNumberProperty() any
	NewTextProperty() any
	NewUnsignedLongNumberProperty() any
}

type BulkIndexer interface {
	Add(ctx context.Context, item BulkIndexerItem) error
	Close(ctx context.Context) error
}
