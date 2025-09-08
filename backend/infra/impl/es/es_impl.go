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
	"fmt"
	"github.com/coze-dev/coze-studio/backend/infra/contract/es"
	"os"
)

type (
	Client          = es.Client
	Types           = es.Types
	BulkIndexer     = es.BulkIndexer
	BulkIndexerItem = es.BulkIndexerItem
	BoolQuery       = es.BoolQuery
	Query           = es.Query
	Response        = es.Response
	Request         = es.Request
)

func New() (Client, error) {
	v := os.Getenv("ES_VERSION")
	if v == "v8" {
		return newES8()
	} else if v == "v7" {
		return newES7()
	}

	return nil, fmt.Errorf("unsupported es version %s", v)
}
