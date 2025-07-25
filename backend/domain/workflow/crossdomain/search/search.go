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

package search

import (
	"context"
)

type OpType string

const (
	Created OpType = "created"
	Updated OpType = "updated"
	Deleted OpType = "deleted"
)

type PublishStatus int64

const (
	UnPublished PublishStatus = 1
	Published   PublishStatus = 2
)

type Resource struct {
	WorkflowID    int64
	Name          *string
	URI           *string
	Desc          *string
	APPID         *int64
	SpaceID       *int64
	OwnerID       *int64
	PublishStatus *PublishStatus
	Mode          *int32 // 0 workflow 3 chat_workflow
	CreatedAt     *int64
	UpdatedAt     *int64
	PublishedAt   *int64
}

func SetNotifier(n Notifier) {
	notifierImpl = n
}

func GetNotifier() Notifier {
	return notifierImpl
}

var notifierImpl Notifier

//go:generate  mockgen -destination searchmock/search_mock.go --package searchmock -source search.go
type Notifier interface {
	PublishWorkflowResource(ctx context.Context, OpType OpType, event *Resource) error
}
