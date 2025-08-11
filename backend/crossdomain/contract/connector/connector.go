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

package connector

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/connector"
)

type Connector interface {
	List(ctx context.Context) ([]*connector.Connector, error)
	GetByIDs(ctx context.Context, ids []int64) (map[int64]*connector.Connector, error)
	GetByID(ctx context.Context, id int64) (*connector.Connector, error)
}

var defaultSVC Connector

func DefaultSVC() Connector {
	return defaultSVC
}

func SetDefaultSVC(c Connector) {
	defaultSVC = c
}
