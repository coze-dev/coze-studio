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

package model

type PublishStatus int

const (
	PublishStatusOfPacking             PublishStatus = 0
	PublishStatusOfPackFailed          PublishStatus = 1
	PublishStatusOfAuditing            PublishStatus = 2
	PublishStatusOfAuditNotPass        PublishStatus = 3
	PublishStatusOfConnectorPublishing PublishStatus = 4
	PublishStatusOfPublishDone         PublishStatus = 5
)

type ConnectorPublishStatus int

const (
	ConnectorPublishStatusOfDefault  ConnectorPublishStatus = 0
	ConnectorPublishStatusOfAuditing ConnectorPublishStatus = 1
	ConnectorPublishStatusOfSuccess  ConnectorPublishStatus = 2
	ConnectorPublishStatusOfFailed   ConnectorPublishStatus = 3
	ConnectorPublishStatusOfDisable  ConnectorPublishStatus = 4
)

type ResourceType string

const (
	ResourceTypeOfPlugin    ResourceType = "plugin"
	ResourceTypeOfWorkflow  ResourceType = "workflow"
	ResourceTypeOfKnowledge ResourceType = "knowledge"
	ResourceTypeOfDatabase  ResourceType = "database"
)

type ResourceCopyStatus int

const (
	ResourceCopyStatusOfSuccess    ResourceCopyStatus = 1
	ResourceCopyStatusOfProcessing ResourceCopyStatus = 2
	ResourceCopyStatusOfFailed     ResourceCopyStatus = 3
)
