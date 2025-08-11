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

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/database"
)

type Database interface {
	ExecuteSQL(ctx context.Context, req *database.ExecuteSQLRequest) (*database.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *database.PublishDatabaseRequest) (resp *database.PublishDatabaseResponse, err error)
	DeleteDatabase(ctx context.Context, req *database.DeleteDatabaseRequest) error
	BindDatabase(ctx context.Context, req *database.BindDatabaseToAgentRequest) error
	UnBindDatabase(ctx context.Context, req *database.UnBindDatabaseToAgentRequest) error
	MGetDatabase(ctx context.Context, req *database.MGetDatabaseRequest) (*database.MGetDatabaseResponse, error)
	GetAllDatabaseByAppID(ctx context.Context, req *database.GetAllDatabaseByAppIDRequest) (*database.GetAllDatabaseByAppIDResponse, error)
}

var defaultSVC Database

func DefaultSVC() Database {
	return defaultSVC
}

func SetDefaultSVC(c Database) {
	defaultSVC = c
}
