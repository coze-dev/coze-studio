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
	"fmt"
	"os"
	"strconv"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/coderunner"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	"github.com/coze-dev/coze-studio/backend/infra/impl/cache/redis"
	"github.com/coze-dev/coze-studio/backend/infra/impl/coderunner/direct"
	"github.com/coze-dev/coze-studio/backend/infra/impl/coderunner/sandbox"
	"github.com/coze-dev/coze-studio/backend/infra/impl/es"
	"github.com/coze-dev/coze-studio/backend/infra/impl/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/impl/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/impl/imagex/veimagex"
	"github.com/coze-dev/coze-studio/backend/infra/impl/mysql"
	"github.com/coze-dev/coze-studio/backend/infra/impl/storage"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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
	ModelMgr              modelmgr.Manager
	CodeRunner            coderunner.Runner
}

func Init(ctx context.Context) (*AppDependencies, error) {
	deps := &AppDependencies{}
	var err error

	deps.DB, err = mysql.New()
	if err != nil {
		return nil, err
	}

	deps.CacheCli = redis.New()

	deps.IDGenSVC, err = idgen.New(deps.CacheCli)
	if err != nil {
		return nil, err
	}

	deps.ESClient, err = es.New()
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

	deps.ResourceEventProducer, err = initResourceEventBusProducer()
	if err != nil {
		return nil, err
	}

	deps.AppEventProducer, err = initAppEventProducer()
	if err != nil {
		return nil, err
	}

	deps.ModelMgr, err = initModelMgr(deps.DB, deps.CacheCli)
	if err != nil {
		return nil, err
	}

	deps.CodeRunner = initCodeRunner()

	return deps, nil
}

func initImageX(ctx context.Context) (imagex.ImageX, error) {

	uploadComponentType := os.Getenv(consts.FileUploadComponentType)

	if uploadComponentType != consts.FileUploadComponentTypeImagex {
		return storage.NewImagex(ctx)
	}
	return veimagex.New(
		os.Getenv(consts.VeImageXAK),
		os.Getenv(consts.VeImageXSK),
		os.Getenv(consts.VeImageXDomain),
		os.Getenv(consts.VeImageXUploadHost),
		os.Getenv(consts.VeImageXTemplate),
		[]string{os.Getenv(consts.VeImageXServerID)},
	)
}

func initTOS(ctx context.Context) (storage.Storage, error) {
	return storage.New(ctx)
}

func initResourceEventBusProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	resourceEventBusProducer, err := eventbus.NewProducer(nameServer,
		consts.RMQTopicResource, consts.RMQConsumeGroupResource, 1)
	if err != nil {
		return nil, fmt.Errorf("init resource producer failed, err=%w", err)
	}

	return resourceEventBusProducer, nil
}

func initAppEventProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	appEventProducer, err := eventbus.NewProducer(nameServer, consts.RMQTopicApp, consts.RMQConsumeGroupApp, 1)
	if err != nil {
		return nil, fmt.Errorf("init app producer failed, err=%w", err)
	}

	return appEventProducer, nil
}

func initCodeRunner() coderunner.Runner {
	switch typ := os.Getenv(consts.CodeRunnerType); typ {
	case "sandbox":
		getAndSplit := func(key string) []string {
			v := os.Getenv(key)
			if v == "" {
				return nil
			}
			return strings.Split(v, ",")
		}
		config := &sandbox.Config{
			AllowEnv:       getAndSplit(consts.CodeRunnerAllowEnv),
			AllowRead:      getAndSplit(consts.CodeRunnerAllowRead),
			AllowWrite:     getAndSplit(consts.CodeRunnerAllowWrite),
			AllowNet:       getAndSplit(consts.CodeRunnerAllowNet),
			AllowRun:       getAndSplit(consts.CodeRunnerAllowRun),
			AllowFFI:       getAndSplit(consts.CodeRunnerAllowFFI),
			NodeModulesDir: os.Getenv(consts.CodeRunnerNodeModulesDir),
			TimeoutSeconds: 0,
			MemoryLimitMB:  0,
		}
		if f, err := strconv.ParseFloat(os.Getenv(consts.CodeRunnerTimeoutSeconds), 64); err == nil {
			config.TimeoutSeconds = f
		} else {
			config.TimeoutSeconds = 60.0
		}
		if mem, err := strconv.ParseInt(os.Getenv(consts.CodeRunnerMemoryLimitMB), 10, 64); err == nil {
			config.MemoryLimitMB = mem
		} else {
			config.MemoryLimitMB = 100
		}
		return sandbox.NewRunner(config)
	default:
		return direct.NewRunner()
	}
}
