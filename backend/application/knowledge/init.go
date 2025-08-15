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

package knowledge

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/application/internal"
	"github.com/coze-dev/coze-studio/backend/application/search"
	knowledgeImpl "github.com/coze-dev/coze-studio/backend/domain/knowledge/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/nl2sql"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/ocr"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/parser"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/messages2query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/rdb"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	chatmodelImpl "github.com/coze-dev/coze-studio/backend/infra/impl/chatmodel"
	builtinNL2SQL "github.com/coze-dev/coze-studio/backend/infra/impl/document/nl2sql/builtin"
	"github.com/coze-dev/coze-studio/backend/infra/impl/document/rerank/rrf"
	"github.com/coze-dev/coze-studio/backend/infra/impl/eventbus"
	builtinM2Q "github.com/coze-dev/coze-studio/backend/infra/impl/messages2query/builtin"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type ServiceComponents struct {
	DB                  *gorm.DB
	IDGenSVC            idgen.IDGenerator
	Storage             storage.Storage
	RDB                 rdb.RDB
	EventBus            search.ResourceEventBus
	CacheCli            cache.Cmdable
	OCR                 ocr.OCR
	ParserManager       parser.Manager
	SearchStoreManagers []searchstore.Manager
}

func InitService(c *ServiceComponents) (*KnowledgeApplicationService, error) {
	ctx := context.Background()

	nameServer := os.Getenv(consts.MQServer)

	knowledgeProducer, err := eventbus.NewProducer(nameServer, consts.RMQTopicKnowledge, consts.RMQConsumeGroupKnowledge, 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	root, err := os.Getwd()
	if err != nil {
		logs.Warnf("[InitConfig] Failed to get current working directory: %v", err)
		root = os.Getenv("PWD")
	}

	var rewriter messages2query.MessagesToQuery
	if rewriterChatModel, _, err := internal.GetBuiltinChatModel(ctx, "M2Q_"); err != nil {
		return nil, err
	} else {
		filePath := filepath.Join(root, "resources/conf/prompt/messages_to_query_template_jinja2.json")
		rewriterTemplate, err := readJinja2PromptTemplate(filePath)
		if err != nil {
			return nil, err
		}
		rewriter, err = builtinM2Q.NewMessagesToQuery(ctx, rewriterChatModel, rewriterTemplate)
		if err != nil {
			return nil, err
		}
	}

	var n2s nl2sql.NL2SQL
	if n2sChatModel, _, err := internal.GetBuiltinChatModel(ctx, "NL2SQL_"); err != nil {
		return nil, err
	} else {
		filePath := filepath.Join(root, "resources/conf/prompt/nl2sql_template_jinja2.json")
		n2sTemplate, err := readJinja2PromptTemplate(filePath)
		if err != nil {
			return nil, err
		}
		n2s, err = builtinNL2SQL.NewNL2SQL(ctx, n2sChatModel, n2sTemplate)
		if err != nil {
			return nil, err
		}
	}

	knowledgeDomainSVC, knowledgeEventHandler := knowledgeImpl.NewKnowledgeSVC(&knowledgeImpl.KnowledgeSVCConfig{
		DB:                  c.DB,
		IDGen:               c.IDGenSVC,
		RDB:                 c.RDB,
		Producer:            knowledgeProducer,
		SearchStoreManagers: c.SearchStoreManagers,
		ParseManager:        c.ParserManager,
		Storage:             c.Storage,
		Rewriter:            rewriter,
		Reranker:            rrf.NewRRFReranker(0), // default rrf
		NL2Sql:              n2s,
		OCR:                 c.OCR,
		CacheCli:            c.CacheCli,
		ModelFactory:        chatmodelImpl.NewDefaultFactory(),
	})

	if err = eventbus.DefaultSVC().RegisterConsumer(nameServer, consts.RMQTopicKnowledge, consts.RMQConsumeGroupKnowledge, knowledgeEventHandler); err != nil {
		return nil, fmt.Errorf("register knowledge consumer failed, err=%w", err)
	}

	KnowledgeSVC.DomainSVC = knowledgeDomainSVC
	KnowledgeSVC.eventBus = c.EventBus
	KnowledgeSVC.storage = c.Storage
	return KnowledgeSVC, nil
}

func readJinja2PromptTemplate(jsonFilePath string) (prompt.ChatTemplate, error) {
	b, err := os.ReadFile(jsonFilePath)
	if err != nil {
		return nil, err
	}
	var m2qMessages []*schema.Message
	if err = json.Unmarshal(b, &m2qMessages); err != nil {
		return nil, err
	}
	tpl := make([]schema.MessagesTemplate, len(m2qMessages))
	for i := range m2qMessages {
		tpl[i] = m2qMessages[i]
	}
	return prompt.FromMessages(schema.Jinja2, tpl...), nil
}
