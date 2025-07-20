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

package processor

import "github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"

type DocProcessor interface {
	BeforeCreate() error         // 获取数据源
	BuildDBModel() error         // 构建Doc记录
	InsertDBModel() error        // 向数据库中插入一条Doc记录
	Indexing() error             // 发起索引任务
	GetResp() []*entity.Document // 返回处理后的文档信息
	//GetColumnName()
}
