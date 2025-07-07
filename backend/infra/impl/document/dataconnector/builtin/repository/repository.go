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

package repository

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/contract/document/dataconnector"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/dao"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/dataconnector/builtin/internal/dal/query"
	"gorm.io/gorm"
)

func NewAuthDAO(db *gorm.DB) AuthRepo {
	return &dao.AuthDAO{DB: db, Query: query.Use(db)}
}

type AuthRepo interface {
	GetAuthInfoByCreatorIDAndConnectorID(ctx context.Context, creatorID int64, connectorID dataconnector.ConnectorID) (*dataconnector.AuthInfo, error)
}
