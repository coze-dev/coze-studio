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

package modelmgr

import (
	"context"
)

type Manager interface {
	ListModel(ctx context.Context, req *ListModelRequest) (*ListModelResponse, error)
	ListInUseModel(ctx context.Context, limit int, Cursor *string) (*ListModelResponse, error)
	MGetModelByID(ctx context.Context, req *MGetModelRequest) ([]*Model, error)
	RefreshCache(ctx context.Context, modelID int64) error
}

type ListModelRequest struct {
	FuzzyModelName *string
	Status         []ModelStatus // default is default and in_use status
	Limit          int
	Cursor         *string
}

type ListModelResponse struct {
	ModelList  []*Model
	HasMore    bool
	NextCursor *string
}

type MGetModelRequest struct {
	IDs []int64
}
