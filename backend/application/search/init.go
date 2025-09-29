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

package search

import (
	"context"
	"fmt"
	"os"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/application/singleagent"
	app "github.com/coze-dev/coze-studio/backend/domain/app/service"
	connector "github.com/coze-dev/coze-studio/backend/domain/connector/service"
	knowledge "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	database "github.com/coze-dev/coze-studio/backend/domain/memory/database/service"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/service"
	prompt "github.com/coze-dev/coze-studio/backend/domain/prompt/service"
	search "github.com/coze-dev/coze-studio/backend/domain/search/service"
	user "github.com/coze-dev/coze-studio/backend/domain/user/service"
	"github.com/coze-dev/coze-studio/backend/domain/workflow"
	"github.com/coze-dev/coze-studio/backend/infra/cache"
	"github.com/coze-dev/coze-studio/backend/infra/es"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type ServiceComponents struct {
	DB                   *gorm.DB
	Cache                cache.Cmdable
	TOS                  storage.Storage
	ESClient             es.Client
	ProjectEventBus      ProjectEventBus
	ResourceEventBus     ResourceEventBus
	SingleAgentDomainSVC singleagent.SingleAgent
	APPDomainSVC         app.AppService
	KnowledgeDomainSVC   knowledge.Knowledge
	PluginDomainSVC      service.PluginService
	WorkflowDomainSVC    workflow.Service
	UserDomainSVC        user.User
	ConnectorDomainSVC   connector.Connector
	PromptDomainSVC      prompt.Prompt
	DatabaseDomainSVC    database.Database
}

func InitService(ctx context.Context, s *ServiceComponents) (*SearchApplicationService, error) {
	searchDomainSVC := search.NewDomainService(ctx, s.ESClient)

	SearchSVC.DomainSVC = searchDomainSVC
	SearchSVC.ServiceComponents = s

	// setup consumer
	searchConsumer := search.NewProjectHandler(ctx, s.ESClient)

	logs.Infof("start search domain consumer...")
	nameServer := os.Getenv(consts.MQServer)

	err := eventbus.GetDefaultSVC().RegisterConsumer(nameServer, consts.RMQTopicApp, consts.RMQConsumeGroupApp, searchConsumer)
	if err != nil {
		return nil, fmt.Errorf("register search consumer failed, err=%w", err)
	}

	searchResourceConsumer := search.NewResourceHandler(ctx, s.ESClient)

	err = eventbus.GetDefaultSVC().RegisterConsumer(nameServer, consts.RMQTopicResource, consts.RMQConsumeGroupResource, searchResourceConsumer)
	if err != nil {
		return nil, fmt.Errorf("register search consumer failed, err=%w", err)
	}

	return SearchSVC, nil
}

type (
	ResourceEventBus = search.ResourceEventBus
	ProjectEventBus  = search.ProjectEventBus
)

func NewResourceEventBus(p eventbus.Producer) search.ResourceEventBus {
	return search.NewResourceEventBus(p)
}

func NewProjectEventBus(p eventbus.Producer) search.ProjectEventBus {
	return search.NewProjectEventBus(p)
}
