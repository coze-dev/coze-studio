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

	"gorm.io/gorm"

	"code.byted.org/data_edc/workflow_engine_next/application/singleagent"
	app "code.byted.org/data_edc/workflow_engine_next/domain/app/service"
	connector "code.byted.org/data_edc/workflow_engine_next/domain/connector/service"
	knowledge "code.byted.org/data_edc/workflow_engine_next/domain/knowledge/service"
	database "code.byted.org/data_edc/workflow_engine_next/domain/memory/database/service"
	"code.byted.org/data_edc/workflow_engine_next/domain/plugin/service"
	prompt "code.byted.org/data_edc/workflow_engine_next/domain/prompt/service"
	search "code.byted.org/data_edc/workflow_engine_next/domain/search/service"
	user "code.byted.org/data_edc/workflow_engine_next/domain/user/service"
	"code.byted.org/data_edc/workflow_engine_next/domain/workflow"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/es"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/eventbus"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/cache/redis"
)

type ServiceComponents struct {
	DB                   *gorm.DB
	Cache                *redis.Client
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

	search.NewProjectHandler(ctx, s.ESClient)
	search.NewResourceHandler(ctx, s.ESClient)
	// 注释掉Consumer
	// setup consumer
	//searchConsumer := search.NewProjectHandler(ctx, s.ESClient)

	//logs.CtxInfo(ctx, "start search domain consumer...")
	//nameServer := os.Getenv(consts.RMQServer)

	//err := rmq.RegisterConsumer(nameServer, "opencoze_search_app", consts.RMQTopicSearchApp, searchConsumer)
	//if err != nil {
	//	return nil, fmt.Errorf("registe	r search consumer failed, err=%w", err)
	//}

	//searchResourceConsumer := search.NewResourceHandler(ctx, s.ESClient)

	//err = rmq.RegisterConsumer(nameServer, "opencoze_search_resource", consts.RMQTopicSearchResource, searchResourceConsumer)
	//if err != nil {
	//	return nil, fmt.Errorf("register search consumer failed, err=%w", err)
	//}

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
