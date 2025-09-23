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

package vo

type PluginEntity struct {
	PluginID      int64
	PluginVersion *string // nil or "0" means draft, "" means latest/online version, otherwise is specific version
}

type ExternalResourceRelated struct {
	PluginMap     map[int64]*PluginEntity
	PluginToolMap map[int64]int64

	KnowledgeMap map[int64]int64
	DatabaseMap  map[int64]int64
}

type CopyWorkflowPolicy struct {
	TargetSpaceID            *int64
	TargetAppID              *int64
	ModifiedCanvasSchema     *string
	ShouldModifyWorkflowName bool
}

type DependenceResource struct {
	PluginIDs    []int64
	KnowledgeIDs []int64
	DatabaseIDs  []int64
}
