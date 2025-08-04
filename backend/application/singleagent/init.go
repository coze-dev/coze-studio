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

package singleagent

import (
	"github.com/cloudwego/eino/compose"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"

	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/repository"
	singleagent "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/service"
	connector "github.com/coze-dev/coze-studio/backend/domain/connector/service"
	knowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	variables "github.com/coze-dev/coze-studio/backend/domain/memory/variables/service"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	shortcutCmd "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/infra/impl/chatmodel"
	"github.com/coze-dev/coze-studio/backend/pkg/jsoncache"
)

type (
	SingleAgent = singleagent.SingleAgent
)

var SingleAgentSVC *SingleAgentApplicationService

type ServiceComponents struct {
	IDGen       idgen.IDGenerator
	DB          *gorm.DB
	Cache       cache.Cmdable
	TosClient   storage.Storage
	ImageX      imagex.ImageX
	EventBus    search.ProjectEventBus
	CounterRepo repository.CounterRepository
	ModelMgr    modelmgr.Manager

	KnowledgeDomainSVC   knowledge.Knowledge
	PluginDomainSVC      service.PluginService
	WorkflowDomainSVC    workflow.Service
	UserDomainSVC        user.User
	VariablesDomainSVC   variables.Variables
	ConnectorDomainSVC   connector.Connector
	DatabaseDomainSVC    database.Database
	ShortcutCMDDomainSVC shortcutCmd.ShortcutCmd
	CPStore              compose.CheckPointStore
}

func InitService(c *ServiceComponents) (*SingleAgentApplicationService, error) {
	domainComponents := &singleagent.Components{
		AgentDraftRepo:   repository.NewSingleAgentRepo(c.DB, c.IDGen, c.Cache),
		AgentVersionRepo: repository.NewSingleAgentVersionRepo(c.DB, c.IDGen),
		PublishInfoRepo:  jsoncache.New[entity.PublishInfo]("agent:publish:last:", c.Cache),
		CounterRepo:      repository.NewCounterRepo(c.Cache),
		CPStore:          c.CPStore,
		ModelFactory:     chatmodel.NewDefaultFactory(),
		ModelMgr:         c.ModelMgr,
	}

	singleAgentDomainSVC := singleagent.NewService(domainComponents)
	SingleAgentSVC = newApplicationService(c, singleAgentDomainSVC)

	return SingleAgentSVC, nil
}
