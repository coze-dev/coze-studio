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

package permission

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/data/database/table"
	"github.com/coze-dev/coze-studio/backend/crossdomain/agent"
	"github.com/coze-dev/coze-studio/backend/crossdomain/app"
	"github.com/coze-dev/coze-studio/backend/crossdomain/database"
	"github.com/coze-dev/coze-studio/backend/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin"
	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/user"
	crossworkflow "github.com/coze-dev/coze-studio/backend/crossdomain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"

	databaseModel "github.com/coze-dev/coze-studio/backend/crossdomain/database/model"
	knowledgeModel "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
)

type AgentResourceQueryer struct {
	agentService agent.SingleAgent
}

func NewAgentResourceQueryer() *AgentResourceQueryer {
	return &AgentResourceQueryer{
		agentService: agent.DefaultSVC(),
	}
}

func (q *AgentResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	var result []*ResourceInfo

	for _, id := range resourceIDs {
		agentInfo, err := q.agentService.GetSingleAgentDraft(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("failed to query bot %d: %w", id, err)
		}

		if agentInfo != nil {
			result = append(result, &ResourceInfo{
				ID:        id,
				CreatorID: agentInfo.CreatorID,
				SpaceID:   &agentInfo.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *AgentResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeAgent
}

type PluginResourceQueryer struct {
	pluginService plugin.PluginService
}

func NewPluginResourceQueryer() *PluginResourceQueryer {
	return &PluginResourceQueryer{
		pluginService: plugin.DefaultSVC(),
	}
}

func (q *PluginResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {

	plugins, err := q.pluginService.MGetDraftPlugins(ctx, resourceIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to query draft plugins: %w", err)
	}
	var result []*ResourceInfo
	for _, plugin := range plugins {
		result = append(result, &ResourceInfo{
			ID:        plugin.ID,
			CreatorID: plugin.DeveloperID,
			SpaceID:   &plugin.SpaceID,
		})
	}

	return result, nil
}

func (q *PluginResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypePlugin
}

type WorkflowResourceQueryer struct {
	workflowService crossworkflow.Workflow
}

func NewWorkflowResourceQueryer() *WorkflowResourceQueryer {
	return &WorkflowResourceQueryer{
		workflowService: crossworkflow.DefaultSVC(),
	}
}

func (q *WorkflowResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {

	workflows, _, err := q.workflowService.MGet(ctx, &vo.MGetPolicy{

		QType:    crossworkflow.FromDraft,
		MetaOnly: true,
		MetaQuery: vo.MetaQuery{
			IDs: resourceIDs,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query workflows: %w", err)
	}
	var result []*ResourceInfo
	for _, workflow := range workflows {
		result = append(result, &ResourceInfo{
			ID:        workflow.ID,
			CreatorID: workflow.CreatorID,
			SpaceID:   &workflow.SpaceID,
		})
	}

	return result, nil
}

func (q *WorkflowResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeWorkflow
}

type KnowledgeResourceQueryer struct {
	knowledgeService knowledge.Knowledge
}

func NewKnowledgeResourceQueryer() *KnowledgeResourceQueryer {
	return &KnowledgeResourceQueryer{
		knowledgeService: knowledge.DefaultSVC(),
	}
}

func (q *KnowledgeResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {

	resp, err := q.knowledgeService.MGetKnowledgeByID(ctx, &knowledgeModel.MGetKnowledgeByIDRequest{
		KnowledgeIDs: resourceIDs,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query knowledge: %w", err)
	}

	var result []*ResourceInfo
	for _, knowledgeInfo := range resp.Knowledge {
		if knowledgeInfo != nil {
			result = append(result, &ResourceInfo{
				ID:        knowledgeInfo.ID,
				CreatorID: knowledgeInfo.CreatorID,
				SpaceID:   &knowledgeInfo.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *KnowledgeResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeKnowledge
}

type DatabaseResourceQueryer struct {
	databaseService database.Database
}

func NewDatabaseResourceQueryer() *DatabaseResourceQueryer {
	return &DatabaseResourceQueryer{
		databaseService: database.DefaultSVC(),
	}
}

func (q *DatabaseResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	var basics []*databaseModel.DatabaseBasic
	for _, id := range resourceIDs {
		basic := &databaseModel.DatabaseBasic{
			ID:        id,
			TableType: table.TableType_DraftTable,
		}
		if isDraft != nil && !*isDraft {
			basic.TableType = table.TableType_OnlineTable
		}
		basics = append(basics, basic)
	}

	resp, err := q.databaseService.MGetDatabase(ctx, &databaseModel.MGetDatabaseRequest{
		Basics: basics,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %w", err)
	}

	var result []*ResourceInfo
	for _, dbInfo := range resp.Databases {
		if dbInfo != nil {
			result = append(result, &ResourceInfo{
				ID:        dbInfo.ID,
				CreatorID: dbInfo.CreatorID,
				SpaceID:   &dbInfo.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *DatabaseResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeDatabase
}

type AppResourceQueryer struct {
	appService app.AppService
}

func NewAppResourceQueryer() *AppResourceQueryer {
	return &AppResourceQueryer{
		appService: app.DefaultSVC(),
	}
}

func (q *AppResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	var result []*ResourceInfo

	for _, id := range resourceIDs {
		appInfo, err := q.appService.GetDraftAPP(ctx, id)
		if err != nil {
			return nil, fmt.Errorf("failed to query app %d: %w", id, err)
		}

		if appInfo != nil {
			result = append(result, &ResourceInfo{
				ID:        id,
				CreatorID: appInfo.OwnerID,
				SpaceID:   &appInfo.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *AppResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeApp
}

type KnowledgeSliceResourceQueryer struct {
	knowledgeService knowledge.Knowledge
}

func NewKnowledgeSliceResourceQueryer() *KnowledgeSliceResourceQueryer {
	return &KnowledgeSliceResourceQueryer{
		knowledgeService: knowledge.DefaultSVC(),
	}
}

func (q *KnowledgeSliceResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	resp, err := q.knowledgeService.MGetSlice(ctx, &knowledgeModel.MGetSliceRequest{
		SliceIDs: resourceIDs,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query knowledge slice: %w", err)
	}

	var result []*ResourceInfo
	for _, slice := range resp.Slices {
		if slice != nil {
			result = append(result, &ResourceInfo{
				ID:        slice.ID,
				CreatorID: slice.CreatorID,
				SpaceID:   &slice.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *KnowledgeSliceResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeKnowledgeSlice
}

type KnowledgeDocumentResourceQueryer struct {
	knowledgeService knowledge.Knowledge
}

func NewKnowledgeDocumentResourceQueryer() *KnowledgeDocumentResourceQueryer {
	return &KnowledgeDocumentResourceQueryer{
		knowledgeService: knowledge.DefaultSVC(),
	}
}

func (q *KnowledgeDocumentResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	resp, err := q.knowledgeService.MGetDocument(ctx, &knowledgeModel.MGetDocumentRequest{
		DocumentIDs: resourceIDs,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to query knowledge document: %w", err)
	}

	var result []*ResourceInfo
	for _, document := range resp.Documents {
		if document != nil {
			result = append(result, &ResourceInfo{
				ID:        document.ID,
				CreatorID: document.CreatorID,
				SpaceID:   &document.SpaceID,
			})
		}
	}

	return result, nil
}

func (q *KnowledgeDocumentResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeKnowledgeDocument
}

type WorkspaceResourceQueryer struct {
	userService crossuser.User
}

func NewWorkspaceResourceQueryer() *WorkspaceResourceQueryer {
	return &WorkspaceResourceQueryer{
		userService: crossuser.DefaultSVC(),
	}
}

func (q *WorkspaceResourceQueryer) QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error) {
	// For workspace resources, we need to get space information for each user
	var result []*ResourceInfo

	spaces, err := q.userService.GetUserSpaceBySpaceID(ctx, resourceIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get user space list for space %v: %w", resourceIDs, err)
	}

	for _, space := range spaces {
		if space != nil {
			result = append(result, &ResourceInfo{
				ID:        space.ID,
				CreatorID: space.CreatorID,
				SpaceID:   &space.ID,
			})
		}
	}

	return result, nil
}

func (q *WorkspaceResourceQueryer) GetResourceType() ResourceType {
	return ResourceTypeWorkspace
}
