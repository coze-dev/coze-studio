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

package appinfra

import (
	"context"

	"gorm.io/gorm"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/imagex"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/cache/redis"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/es"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/eventbus"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/idgen"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/mysql"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/storage"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/tcc"
)

type AppDependencies struct {
	DB                    *gorm.DB
	CacheCli              *redis.Client
	IDGenSVC              idgen.IDGenerator
	ESClient              es.Client
	ImageXClient          imagex.ImageX
	TOSClient             storage.Storage
	ResourceEventProducer eventbus.Producer
	AppEventProducer      eventbus.Producer
}

func Init(ctx context.Context) (*AppDependencies, error) {
	deps := &AppDependencies{}
	var err error
	err = tcc.InitTCCClient()
	if err != nil {
		return nil, err
	}
	deps.DB, err = mysql.New(ctx)
	if err != nil {
		return nil, err
	}

	deps.CacheCli, err = redis.New(ctx)
	if err != nil {
		return nil, err
	}

	deps.IDGenSVC, err = idgen.New(deps.CacheCli)
	if err != nil {
		return nil, err
	}

	deps.ESClient, err = es.New(ctx)
	if err != nil {
		return nil, err
	}
	deps.ImageXClient, err = initImageX(ctx)
	if err != nil {
		return nil, err
	}

	deps.TOSClient, err = initTOS(ctx)
	if err != nil {
		return nil, err
	}

	// deps.ResourceEventProducer, err = initResourceEventBusProducer()
	// if err != nil {
	// 	return nil, err
	// }

	// deps.AppEventProducer, err = initAppEventProducer()
	// if err != nil {
	// 	return nil, err
	// }

	return deps, nil
}

func initImageX(ctx context.Context) (imagex.ImageX, error) {
	return storage.NewImagex(ctx)
}

func initTOS(ctx context.Context) (storage.Storage, error) {
	return storage.New(ctx)
}

// func initResourceEventBusProducer() (eventbus.Producer, error) {
// 	nameServer := os.Getenv(consts.MQServer)
// 	resourceEventBusProducer, err := eventbus.NewProducer(nameServer,
// 		consts.RMQTopicResource, consts.RMQConsumeGroupResource, 1)
// 	if err != nil {
// 		return nil, fmt.Errorf("init resource producer failed, err=%w", err)
// 	}

// 	return resourceEventBusProducer, nil
// }

// func initAppEventProducer() (eventbus.Producer, error) {
// 	nameServer := os.Getenv(consts.MQServer)
// 	appEventProducer, err := eventbus.NewProducer(nameServer, consts.RMQTopicApp, consts.RMQConsumeGroupApp, 1)
// 	if err != nil {
// 		return nil, fmt.Errorf("init app producer failed, err=%w", err)
// 	}

// 	return appEventProducer, nil
// }
