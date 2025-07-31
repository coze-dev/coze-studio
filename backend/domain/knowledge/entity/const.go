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

package entity

type DocumentStatus int64

const (
	DocumentStatusInit      DocumentStatus = -1 // initialization
	DocumentStatusUploading DocumentStatus = 0  // Uploading
	DocumentStatusEnable    DocumentStatus = 1  // take effect
	DocumentStatusDisable   DocumentStatus = 2  // failure
	DocumentStatusDeleted   DocumentStatus = 3  // deleted
	DocumentStatusChunking  DocumentStatus = 4  // Slicing
	// DocumentStatusRefreshing DocumentStatus = 5//Refreshing
	DocumentStatusFailed DocumentStatus = 9 // fail
)

func (s DocumentStatus) String() string {
	switch s {
	case DocumentStatusInit:
		return "初始化"
	case DocumentStatusUploading:
		return "上传中"
	case DocumentStatusEnable:
		return "生效"
	case DocumentStatusDisable:
		return "失效"
	case DocumentStatusDeleted:
		return "已删除"
	case DocumentStatusChunking:
		return "切片中"
	// case DocumentStatusRefreshing:
	//	Returns "Refreshing"
	case DocumentStatusFailed:
		return "失败"
	default:
		return "未知"
	}
}

type DocumentSource int64

const (
	DocumentSourceLocal  DocumentSource = 0 // local file upload
	DocumentSourceCustom DocumentSource = 2 // custom text
)
