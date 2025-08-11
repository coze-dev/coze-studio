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

package database

import (
	"context"

	model "github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
	crossdatabase "github.com/coze-dev/coze-studio/backend/crossdomain/contract/database"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
)

var defaultSVC crossdatabase.Database

type databaseImpl struct {
	DomainSVC database.Database
}

func InitDomainService(c database.Database) crossdatabase.Database {
	defaultSVC = &databaseImpl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *databaseImpl) ExecuteSQL(ctx context.Context, req *model.ExecuteSQLRequest) (*model.ExecuteSQLResponse, error) {
	return c.DomainSVC.ExecuteSQL(ctx, req)
}

func (c *databaseImpl) PublishDatabase(ctx context.Context, req *model.PublishDatabaseRequest) (resp *model.PublishDatabaseResponse, err error) {
	return c.DomainSVC.PublishDatabase(ctx, req)
}

func (c *databaseImpl) DeleteDatabase(ctx context.Context, req *model.DeleteDatabaseRequest) error {
	return c.DomainSVC.DeleteDatabase(ctx, req)
}

func (c *databaseImpl) BindDatabase(ctx context.Context, req *model.BindDatabaseToAgentRequest) error {
	return c.DomainSVC.BindDatabase(ctx, req)
}

func (c *databaseImpl) UnBindDatabase(ctx context.Context, req *model.UnBindDatabaseToAgentRequest) error {
	return c.DomainSVC.UnBindDatabase(ctx, req)
}

func (c *databaseImpl) MGetDatabase(ctx context.Context, req *model.MGetDatabaseRequest) (*model.MGetDatabaseResponse, error) {
	return c.DomainSVC.MGetDatabase(ctx, req)
}

func (c *databaseImpl) GetAllDatabaseByAppID(ctx context.Context, req *model.GetAllDatabaseByAppIDRequest) (*model.GetAllDatabaseByAppIDResponse, error) {
	return c.DomainSVC.GetAllDatabaseByAppID(ctx, req)
}
