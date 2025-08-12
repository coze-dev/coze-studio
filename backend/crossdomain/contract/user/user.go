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

package crossuser

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
)

type EntitySpace = entity.Space

//go:generate mockgen -destination ../../../internal/mock/crossdomain/crossuser/crossuser.go --package mockCrossUser -source crossuser.go
type User interface {
	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*EntitySpace, err error)
}

var defaultSVC User

func DefaultSVC() User {
	return defaultSVC
}

func SetDefaultSVC(u User) {
	defaultSVC = u
}
