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

package service

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/common"
	conventity "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"

	workflowModel "github.com/coze-dev/coze-studio/backend/crossdomain/workflow/model"
	"github.com/coze-dev/coze-studio/backend/pkg/taskgroup"

	workflow2 "github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossconversation "github.com/coze-dev/coze-studio/backend/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type conversationImpl struct {
	repo workflow.Repository
}

func (c *conversationImpl) CreateDraftConversationTemplate(ctx context.Context, template *vo.CreateConversationTemplateMeta) (int64, error) {
	var (
		spaceID = template.SpaceID
		appID   = template.AppID
		name    = template.Name
		userID  = template.UserID
	)

	existed, err := c.IsDraftConversationNameExist(ctx, appID, userID, template.Name)
	if err != nil {
		return 0, err
	}
	if existed {
		return 0, vo.WrapError(errno.ErrConversationNameIsDuplicated, fmt.Errorf("conversation name %s exists", name), errorx.KV("name", name))
	}

	return c.repo.CreateDraftConversationTemplate(ctx, &vo.CreateConversationTemplateMeta{
		SpaceID: spaceID,
		AppID:   appID,
		Name:    name,
		UserID:  userID,
	})

}

func (c *conversationImpl) IsDraftConversationNameExist(ctx context.Context, appID int64, userID int64, name string) (bool, error) {
	_, existed, err := c.repo.GetDynamicConversationByName(ctx, vo.Draft, appID, consts.CozeConnectorID, userID, name)
	if err != nil {
		return false, err
	}
	if existed {
		return true, nil
	}

	_, existed, err = c.repo.GetConversationTemplate(ctx, vo.Draft, vo.GetConversationTemplatePolicy{AppID: ptr.Of(appID), Name: ptr.Of(name)})
	if err != nil {
		return false, err
	}

	if existed {
		return true, nil
	}

	return false, nil

}

func (c *conversationImpl) UpdateDraftConversationTemplateName(ctx context.Context, appID int64, userID int64, templateID int64, modifiedName string) error {
	template, existed, err := c.repo.GetConversationTemplate(ctx, vo.Draft, vo.GetConversationTemplatePolicy{TemplateID: ptr.Of(templateID)})
	if err != nil {
		return err
	}

	if existed && template.Name == modifiedName {
		return nil
	}

	existed, err = c.IsDraftConversationNameExist(ctx, appID, userID, modifiedName)
	if err != nil {
		return err
	}
	if existed {
		return vo.WrapError(errno.ErrConversationNameIsDuplicated, fmt.Errorf("conversation name %s exists", modifiedName), errorx.KV("name", modifiedName))
	}

	wfs, err := c.findReplaceWorkflowByConversationName(ctx, appID, template.Name)
	if err != nil {
		return err
	}

	err = c.replaceWorkflowsConversationName(ctx, wfs, slices.ToMap(wfs, func(e *entity.Workflow) (int64, string) {
		return e.ID, modifiedName
	}))

	if err != nil {
		return err
	}

	return c.repo.UpdateDraftConversationTemplateName(ctx, templateID, modifiedName)

}

func (c *conversationImpl) CheckWorkflowsToReplace(ctx context.Context, appID int64, templateID int64) ([]*entity.Workflow, error) {
	template, existed, err := c.repo.GetConversationTemplate(ctx, vo.Draft, vo.GetConversationTemplatePolicy{TemplateID: ptr.Of(templateID)})
	if err != nil {
		return nil, err
	}

	if existed {
		return c.findReplaceWorkflowByConversationName(ctx, appID, template.Name)
	}

	return []*entity.Workflow{}, nil
}

func (c *conversationImpl) DeleteDraftConversationTemplate(ctx context.Context, templateID int64, wfID2ConversationName map[int64]string) (int64, error) {

	if len(wfID2ConversationName) == 0 {
		return c.repo.DeleteDraftConversationTemplate(ctx, templateID)
	}
	workflowIDs := make([]int64, 0)
	for id := range wfID2ConversationName {
		workflowIDs = append(workflowIDs, id)
	}

	wfs, _, err := c.repo.MGetDrafts(ctx, &vo.MGetPolicy{
		MetaQuery: vo.MetaQuery{
			IDs: workflowIDs,
		},
		QType: workflowModel.FromDraft,
	})
	if err != nil {
		return 0, err
	}

	err = c.replaceWorkflowsConversationName(ctx, wfs, wfID2ConversationName)
	if err != nil {
		return 0, err
	}
	return c.repo.DeleteDraftConversationTemplate(ctx, templateID)
}

func (c *conversationImpl) ListConversationTemplate(ctx context.Context, env vo.Env, policy *vo.ListConversationTemplatePolicy) ([]*entity.ConversationTemplate, error) {
	var (
		err       error
		templates []*entity.ConversationTemplate
		appID     = policy.AppID
	)
	templates, err = c.repo.ListConversationTemplate(ctx, env, &vo.ListConversationTemplatePolicy{
		AppID:    appID,
		Page:     policy.Page,
		NameLike: policy.NameLike,
		Version:  policy.Version,
	})
	if err != nil {
		return nil, err
	}
	return templates, nil

}

func (c *conversationImpl) MGetStaticConversation(ctx context.Context, env vo.Env, userID, connectorID int64, templateIDs []int64) ([]*entity.StaticConversation, error) {
	return c.repo.MGetStaticConversation(ctx, env, userID, connectorID, templateIDs)
}

func (c *conversationImpl) ListDynamicConversation(ctx context.Context, env vo.Env, policy *vo.ListConversationPolicy) ([]*entity.DynamicConversation, error) {
	return c.repo.ListDynamicConversation(ctx, env, policy)
}

func (c *conversationImpl) ReleaseConversationTemplate(ctx context.Context, appID int64, version string) error {
	templates, err := c.repo.ListConversationTemplate(ctx, vo.Draft, &vo.ListConversationTemplatePolicy{
		AppID: appID,
	})
	if err != nil {
		return err
	}
	if len(templates) == 0 {
		return nil
	}

	return c.repo.BatchCreateOnlineConversationTemplate(ctx, templates, version)
}

func (c *conversationImpl) InitApplicationDefaultConversationTemplate(ctx context.Context, spaceID, appID int64, userID int64) error {
	_, err := c.repo.CreateDraftConversationTemplate(ctx, &vo.CreateConversationTemplateMeta{
		AppID:   appID,
		SpaceID: spaceID,
		UserID:  userID,
		Name:    "Default",
	})
	if err != nil {
		return err
	}

	return nil
}

func (c *conversationImpl) findReplaceWorkflowByConversationName(ctx context.Context, appID int64, name string) ([]*entity.Workflow, error) {

	wfs, _, err := c.repo.MGetDrafts(ctx, &vo.MGetPolicy{
		QType: workflowModel.FromDraft,
		MetaQuery: vo.MetaQuery{
			AppID: ptr.Of(appID),
			Mode:  ptr.Of(workflow2.WorkflowMode_ChatFlow),
		},
	})
	if err != nil {
		return nil, err
	}

	shouldReplacedWorkflow := func(nodes []*vo.Node) (bool, error) {
		var startNode *vo.Node
		for _, node := range nodes {
			if node.Type == entity.NodeTypeEntry.IDStr() {
				startNode = node
			}
		}
		if startNode == nil {
			return false, fmt.Errorf("start node not found for block type")
		}
		for _, vAny := range startNode.Data.Outputs {
			v, err := vo.ParseVariable(vAny)
			if err != nil {
				return false, err
			}
			if v.Name == vo.ConversationNameKey && v.DefaultValue == name {
				return true, nil
			}
		}
		return false, nil

	}

	shouldReplacedWorkflows := make([]*entity.Workflow, 0)
	for idx := range wfs {
		wf := wfs[idx]
		canvas := &vo.Canvas{}
		err = sonic.UnmarshalString(wf.Canvas, canvas)
		if err != nil {
			return nil, err
		}

		ok, err := shouldReplacedWorkflow(canvas.Nodes)
		if err != nil {
			return nil, err
		}
		if ok {
			shouldReplacedWorkflows = append(shouldReplacedWorkflows, wf)
		}

	}

	return shouldReplacedWorkflows, nil

}

func (c *conversationImpl) replaceWorkflowsConversationName(ctx context.Context, wfs []*entity.Workflow, workflowID2ConversionName map[int64]string) error {

	replaceConversionName := func(nodes []*vo.Node, conversionName string) error {
		var startNode *vo.Node
		for _, node := range nodes {
			if node.Type == entity.NodeTypeEntry.IDStr() {
				startNode = node
			}
		}
		if startNode == nil {
			return fmt.Errorf("start node not found for block type")
		}
		for idx, vAny := range startNode.Data.Outputs {
			v, err := vo.ParseVariable(vAny)
			if err != nil {
				return err
			}
			if v.Name == vo.ConversationNameKey {
				v.DefaultValue = conversionName
			}
			startNode.Data.Outputs[idx] = v

		}
		return nil
	}
	tg := taskgroup.NewTaskGroup(ctx, len(wfs))
	for _, wf := range wfs {
		wfEntity := wf
		tg.Go(func() error {
			canvas := &vo.Canvas{}
			err := sonic.UnmarshalString(wfEntity.Canvas, canvas)
			if err != nil {
				return err
			}

			conversationName := workflowID2ConversionName[wfEntity.ID]
			err = replaceConversionName(canvas.Nodes, conversationName)
			if err != nil {
				return err
			}

			replaceCanvas, err := sonic.MarshalString(canvas)
			if err != nil {
				return err
			}

			err = c.repo.CreateOrUpdateDraft(ctx, wfEntity.ID, &vo.DraftInfo{
				DraftMeta: &vo.DraftMeta{
					TestRunSuccess: false,
					Modified:       true,
				},
				Canvas: replaceCanvas,
			})

			if err != nil {
				return err
			}
			return nil

		})
	}
	err := tg.Wait()
	if err != nil {
		return err
	}
	return nil
}

func (c *conversationImpl) DeleteDynamicConversation(ctx context.Context, env vo.Env, templateID int64) (int64, error) {
	return c.repo.DeleteDynamicConversation(ctx, env, templateID)
}

func (c *conversationImpl) GetOrCreateConversation(ctx context.Context, env vo.Env, bizID, connectorID, userID int64, conversationName string) (int64, int64, error) {
	t, existed, err := c.repo.GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID: ptr.Of(bizID),
		Name:  ptr.Of(conversationName),
	})
	if err != nil {
		return 0, 0, err
	}

	conversationIDGenerator := workflow.ConversationIDGenerator(func(ctx context.Context, bizID int64, userID, connectorID int64) (*conventity.Conversation, error) {
		return crossconversation.DefaultSVC().CreateConversation(ctx, &conventity.CreateMeta{
			AgentID:     bizID,
			UserID:      userID,
			ConnectorID: connectorID,
			Scene:       common.Scene_SceneWorkflow,
		})
	})

	if existed {
		conversationID, sectionID, _, err := c.repo.GetOrCreateStaticConversation(ctx, env, conversationIDGenerator, &vo.CreateStaticConversation{
			BizID:       bizID,
			ConnectorID: connectorID,
			UserID:      userID,
			TemplateID:  t.TemplateID,
		})
		if err != nil {
			return 0, 0, err
		}
		return conversationID, sectionID, nil
	}

	conversationID, sectionID, _, err := c.repo.GetOrCreateDynamicConversation(ctx, env, conversationIDGenerator, &vo.CreateDynamicConversation{
		BizID:       bizID,
		ConnectorID: connectorID,
		UserID:      userID,
		Name:        conversationName,
	})
	if err != nil {
		return 0, 0, err
	}
	return conversationID, sectionID, nil

}

func (c *conversationImpl) UpdateConversation(ctx context.Context, env vo.Env, appID, connectorID, userID int64, conversationName string) (int64, error) {
	t, existed, err := c.repo.GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID: ptr.Of(appID),
		Name:  ptr.Of(conversationName),
	})

	if err != nil {
		return 0, err
	}

	if existed {
		conv, err := crossconversation.DefaultSVC().CreateConversation(ctx, &conventity.CreateMeta{
			AgentID:     appID,
			UserID:      userID,
			ConnectorID: connectorID,
			Scene:       common.Scene_SceneWorkflow,
		})
		if err != nil {
			return 0, err
		}
		if conv == nil {
			return 0, fmt.Errorf("create conversation failed")
		}
		err = c.repo.UpdateStaticConversation(ctx, env, t.TemplateID, connectorID, userID, conv.ID)
		if err != nil {
			return 0, err
		}
		return conv.ID, nil
	}

	dy, existed, err := c.repo.GetDynamicConversationByName(ctx, env, appID, connectorID, userID, conversationName)
	if err != nil {
		return 0, err
	}

	if !existed {
		return 0, fmt.Errorf("conversation name %v not found", conversationName)
	}

	conv, err := crossconversation.DefaultSVC().CreateConversation(ctx, &conventity.CreateMeta{
		AgentID:     appID,
		UserID:      userID,
		ConnectorID: connectorID,
		Scene:       common.Scene_SceneWorkflow,
	})
	if err != nil {
		return 0, err
	}
	if conv == nil {
		return 0, fmt.Errorf("create conversation failed")
	}
	err = c.repo.UpdateDynamicConversation(ctx, env, dy.ConversationID, conv.ID)
	if err != nil {
		return 0, err
	}
	return conv.ID, nil

}

func (c *conversationImpl) GetTemplateByName(ctx context.Context, env vo.Env, appID int64, templateName string) (*entity.ConversationTemplate, bool, error) {
	return c.repo.GetConversationTemplate(ctx, env, vo.GetConversationTemplatePolicy{
		AppID: ptr.Of(appID),
		Name:  ptr.Of(templateName),
	})
}

func (c *conversationImpl) GetDynamicConversationByName(ctx context.Context, env vo.Env, appID, connectorID, userID int64, name string) (*entity.DynamicConversation, bool, error) {
	return c.repo.GetDynamicConversationByName(ctx, env, appID, connectorID, userID, name)
}

func (c *conversationImpl) GetConversationNameByID(ctx context.Context, env vo.Env, bizID, connectorID, conversationID int64) (string, bool, error) {
	sc, existed, err := c.repo.GetStaticConversationByID(ctx, env, bizID, connectorID, conversationID)
	if err != nil {
		return "", false, err
	}
	if existed {
		return sc, true, nil
	}

	dc, existed, err := c.repo.GetDynamicConversationByID(ctx, env, bizID, connectorID, conversationID)
	if err != nil {
		return "", false, err
	}

	if existed {
		return dc.Name, true, nil
	}

	return "", false, nil
}

func (c *conversationImpl) Suggest(ctx context.Context, input *vo.SuggestInfo) ([]string, error) {
	return c.repo.Suggest(ctx, input)
}
