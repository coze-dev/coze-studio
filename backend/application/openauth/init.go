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

package openauth

import (
	"gorm.io/gorm"

	openapiauth2 "github.com/coze-dev/coze-studio/backend/domain/openauth/openapiauth"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

var (
	openapiAuthDomainSVC openapiauth2.APIAuth
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator) *OpenAuthApplicationService {
	openapiAuthDomainSVC = openapiauth2.NewService(&openapiauth2.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	OpenAuthApplication.OpenAPIDomainSVC = openapiAuthDomainSVC

	return OpenAuthApplication
}
