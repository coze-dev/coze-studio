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

package modelbuilder

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

var ctxCacheKey = "builtin_chat_model_in_context"

func GetBuiltinChatModel(ctx context.Context, envPrefix string) (bcm BaseChatModel, configured bool, err error) {
	bcm, ok := ctxcache.Get[BaseChatModel](ctx, ctxCacheKey)
	if ok {
		logs.CtxDebugf(ctx, "builtin chat model in context: %v", bcm)
		return bcm, true, nil
	}

	knowledgeConf, err := config.Knowledge().GetKnowledgeConfig(ctx)
	if err != nil {
		return nil, false, fmt.Errorf("get knowledge config failed: %w", err)
	}

	model, err := config.ModelConf().GetBuiltinChatModelConfig(ctx, knowledgeConf.BuiltinModelID)
	if err == nil {
		bcm, err = BuildModelWithConf(ctx, model)
		if err == nil {
			ctxcache.Store(ctx, ctxCacheKey, bcm)
			return bcm, true, nil
		}
	} else {
		logs.CtxWarnf(ctx, "GetBuiltinChatModelConfig failed : %v", err)
	}

	modelList, err := config.ModelConf().GetOnlineModelList(ctx)
	if err != nil {
		return nil, false, fmt.Errorf("get model list failed: %w", err)
	}

	for _, m := range modelList {
		bcm, err = BuildModelWithConf(ctx, m)
		if err != nil {
			logs.CtxWarnf(ctx, "build model %v %v failed: %v", m.Provider.Name, m.Provider.ModelClass.String(), err)
			continue
		}

		if err = checkModelConfig(ctx, bcm); err == nil {
			logs.CtxDebugf(ctx, "build model %v %v success, in model list", m.Provider.Name, m.Provider.ModelClass.String())

			ctxcache.Store(ctx, ctxCacheKey, bcm)
			return bcm, true, nil
		}

	}

	return nil, true, nil
}

func checkModelConfig(ctx context.Context, bcm BaseChatModel) (err error) {
	respMsgs, err := bcm.Generate(ctx, []*schema.Message{
		schema.SystemMessage("1+1=?,Just answer with a number, no explanation.")})
	if err != nil {
		logs.CtxWarnf(ctx, "builtin chat model not configured: %v", err)
		return fmt.Errorf("builtin chat model not configured: %w", err)
	}

	logs.CtxDebugf(ctx, "generate model respMsgs: %v", respMsgs)

	return nil
}
