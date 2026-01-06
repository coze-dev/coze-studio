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

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	"github.com/coze-dev/coze-studio/backend/infra/cache"
	"github.com/coze-dev/coze-studio/backend/infra/cache/impl/redis"
	coderunner "github.com/coze-dev/coze-studio/backend/infra/coderunner/impl"
	messages2query "github.com/coze-dev/coze-studio/backend/infra/document/messages2query/impl"
	nl2sql "github.com/coze-dev/coze-studio/backend/infra/document/nl2sql/impl"
	ocr "github.com/coze-dev/coze-studio/backend/infra/document/ocr/impl"
	parser "github.com/coze-dev/coze-studio/backend/infra/document/parser/impl"
	rerank "github.com/coze-dev/coze-studio/backend/infra/document/rerank/impl"
	searchstore "github.com/coze-dev/coze-studio/backend/infra/document/searchstore/impl"
	"github.com/coze-dev/coze-studio/backend/infra/es/impl/es"
	eventbus "github.com/coze-dev/coze-studio/backend/infra/eventbus/impl"
	"github.com/coze-dev/coze-studio/backend/infra/idgen/impl/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/imagex/impl/veimagex"
	"github.com/coze-dev/coze-studio/backend/infra/orm/impl/mysql"
	storage "github.com/coze-dev/coze-studio/backend/infra/storage/impl"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type AppDependencies struct {
	DB                       *gorm.DB
	CacheCli                 cache.Cmdable
	IDGenSVC                 idgen.IDGenerator
	ESClient                 es.Client
	ImageXClient             imagex.ImageX
	OSS                      storage.Storage
	ResourceEventProducer    eventbus.Producer
	AppEventProducer         eventbus.Producer
	KnowledgeEventProducer   eventbus.Producer
	CodeRunner               coderunner.Runner
	ParserManager            parser.Manager
	SearchStoreManagers      []searchstore.Manager
	Reranker                 rerank.Reranker
	Rewriter                 messages2query.MessagesToQuery
	NL2SQL                   nl2sql.NL2SQL
	WorkflowBuildInChatModel modelbuilder.BaseChatModel
}

func Init(ctx context.Context) (*AppDependencies, error) {
	deps := &AppDependencies{}
	var err error
	deps.OSS, err = storage.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("init tos client failed, err=%w", err)
	}

	deps.DB, err = mysql.New()
	if err != nil {
		return nil, fmt.Errorf("init db failed, err=%w", err)
	}

	deps.CacheCli = redis.New()

	deps.IDGenSVC, err = idgen.New(deps.CacheCli)
	if err != nil {
		return nil, fmt.Errorf("init id gen svc failed, err=%w", err)
	}

	err = config.Init(ctx, deps.DB, deps.OSS) // Depends on MySQL、Idgen and OSS initialization
	if err != nil {
		return nil, fmt.Errorf("init model config failed, err=%w", err)
	}

	knowledgeConfig, err := config.Knowledge().GetKnowledgeConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("get knowledge config failed, err=%w", err)
	}
	basicConfig, err := config.Base().GetBaseConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("get basic config failed, err=%w", err)
	}

	deps.ESClient, err = es.New()
	if err != nil {
		return nil, fmt.Errorf("init es client failed, err=%w", err)
	}

	deps.ImageXClient, err = initImageX(ctx)
	if err != nil {
		return nil, fmt.Errorf("init imagex client failed, err=%w", err)
	}

	deps.ResourceEventProducer, err = eventbus.InitResourceEventBusProducer()
	if err != nil {
		return nil, fmt.Errorf("init resource event bus producer failed, err=%w", err)
	}

	deps.AppEventProducer, err = eventbus.InitAppEventProducer()
	if err != nil {
		return nil, fmt.Errorf("init app event producer failed, err=%w", err)
	}

	deps.KnowledgeEventProducer, err = eventbus.InitKnowledgeEventBusProducer()
	if err != nil {
		return nil, fmt.Errorf("init knowledge event bus producer failed, err=%w", err)
	}

	deps.Reranker = rerank.New(knowledgeConfig)

	deps.Rewriter, err = messages2query.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("init rewriter failed, err=%w", err)
	}

	deps.NL2SQL, err = nl2sql.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("init nl2sql failed, err=%w", err)
	}

	deps.CodeRunner = coderunner.New(basicConfig)

	ocrIns := ocr.New(knowledgeConfig)

	var ok bool
	deps.WorkflowBuildInChatModel, ok, err = modelbuilder.GetBuiltinChatModel(ctx, "WKR_")
	if err != nil {
		return nil, fmt.Errorf("get workflow builtin chat model failed, err=%w", err)
	}

	if !ok {
		logs.CtxWarnf(ctx, "workflow builtin chat model for knowledge recall not configured")
	}

	deps.ParserManager, err = parser.New(ctx, knowledgeConfig, deps.OSS, ocrIns)
	if err != nil {
		return nil, fmt.Errorf("init parser manager failed, err=%w", err)
	}

	deps.SearchStoreManagers, err = searchstore.New(ctx, knowledgeConfig, deps.ESClient)
	if err != nil {
		return nil, fmt.Errorf("init search store managers failed, err=%w", err)
	}

	return deps, nil
}

func initImageX(ctx context.Context) (imagex.ImageX, error) {
	uploadComponentType := os.Getenv(consts.FileUploadComponentType)
	if uploadComponentType != consts.FileUploadComponentTypeImagex {
		return storage.NewImagex(ctx)
	}

	return veimagex.NewDefault()
}
