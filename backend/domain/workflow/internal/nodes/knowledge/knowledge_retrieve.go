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
	"errors"

	"github.com/spf13/cast"

	einoSchema "github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/api/model/workflow"
	crossknowledge "github.com/coze-dev/coze-studio/backend/crossdomain/contract/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/canvas/convert"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes"
	nodesconversation "github.com/coze-dev/coze-studio/backend/domain/workflow/internal/nodes/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/schema"
	"github.com/coze-dev/coze-studio/backend/pkg/ctxcache"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

const outputList = "outputList"

type contextKey string

const chatHistoryKey contextKey = "chatHistory"

type RetrieveConfig struct {
	KnowledgeIDs       []int64
	RetrievalStrategy  *knowledge.RetrievalStrategy
	ChatHistorySetting *vo.ChatHistorySetting
}

func (r *RetrieveConfig) Adapt(_ context.Context, n *vo.Node, _ ...nodes.AdaptOption) (*schema.NodeSchema, error) {
	ns := &schema.NodeSchema{
		Key:     vo.NodeKey(n.ID),
		Type:    entity.NodeTypeKnowledgeRetriever,
		Name:    n.Data.Meta.Title,
		Configs: r,
	}

	inputs := n.Data.Inputs
	datasetListInfoParam := inputs.DatasetParam[0]
	datasetIDs := datasetListInfoParam.Input.Value.Content.([]any)
	knowledgeIDs := make([]int64, 0, len(datasetIDs))
	for _, id := range datasetIDs {
		k, err := cast.ToInt64E(id)
		if err != nil {
			return nil, err
		}
		knowledgeIDs = append(knowledgeIDs, k)
	}
	r.KnowledgeIDs = knowledgeIDs

	if inputs.ChatHistorySetting != nil {
		r.ChatHistorySetting = inputs.ChatHistorySetting
	}

	retrievalStrategy := &knowledge.RetrievalStrategy{}

	var getDesignatedParamContent = func(name string) (any, bool) {
		for _, param := range inputs.DatasetParam {
			if param.Name == name {
				return param.Input.Value.Content, true
			}
		}
		return nil, false
	}

	if content, ok := getDesignatedParamContent("topK"); ok {
		topK, err := cast.ToInt64E(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.TopK = &topK
	}

	if content, ok := getDesignatedParamContent("useRerank"); ok {
		useRerank, err := cast.ToBoolE(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.EnableRerank = useRerank
	}

	if content, ok := getDesignatedParamContent("useRewrite"); ok {
		useRewrite, err := cast.ToBoolE(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.EnableQueryRewrite = useRewrite
	}

	if content, ok := getDesignatedParamContent("isPersonalOnly"); ok {
		isPersonalOnly, err := cast.ToBoolE(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.IsPersonalOnly = isPersonalOnly
	}

	if content, ok := getDesignatedParamContent("useNl2sql"); ok {
		useNl2sql, err := cast.ToBoolE(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.EnableNL2SQL = useNl2sql
	}

	if content, ok := getDesignatedParamContent("minScore"); ok {
		minScore, err := cast.ToFloat64E(content)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.MinScore = &minScore
	}

	if content, ok := getDesignatedParamContent("strategy"); ok {
		strategy, err := cast.ToInt64E(content)
		if err != nil {
			return nil, err
		}
		searchType, err := convertRetrievalSearchType(strategy)
		if err != nil {
			return nil, err
		}
		retrievalStrategy.SearchType = searchType
	}

	r.RetrievalStrategy = retrievalStrategy

	if err := convert.SetInputsForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	if err := convert.SetOutputTypesForNodeSchema(n, ns); err != nil {
		return nil, err
	}

	return ns, nil
}

func (r *RetrieveConfig) Build(_ context.Context, _ *schema.NodeSchema, _ ...schema.BuildOption) (any, error) {
	if len(r.KnowledgeIDs) == 0 {
		return nil, errors.New("knowledge ids are required")
	}

	if r.RetrievalStrategy == nil {
		return nil, errors.New("retrieval strategy is required")
	}

	return &Retrieve{
		knowledgeIDs:       r.KnowledgeIDs,
		retrievalStrategy:  r.RetrievalStrategy,
		ChatHistorySetting: r.ChatHistorySetting,
	}, nil
}

type Retrieve struct {
	knowledgeIDs       []int64
	retrievalStrategy  *knowledge.RetrievalStrategy
	ChatHistorySetting *vo.ChatHistorySetting
}

func (kr *Retrieve) Invoke(ctx context.Context, input map[string]any) (map[string]any, error) {
	query, ok := input["Query"].(string)
	if !ok {
		return nil, errors.New("capital query key is required")
	}

	req := &knowledge.RetrieveRequest{
		Query:        query,
		KnowledgeIDs: kr.knowledgeIDs,
		ChatHistory:  kr.GetChatHistoryOrNil(ctx, kr.ChatHistorySetting),
		Strategy:     kr.retrievalStrategy,
	}

	response, err := crossknowledge.DefaultSVC().Retrieve(ctx, req)
	if err != nil {
		return nil, err
	}
	result := make(map[string]any)
	result[outputList] = slices.Transform(response.RetrieveSlices, func(m *knowledge.RetrieveSlice) any {
		return map[string]any{
			"documentId": m.Slice.DocumentID,
			"output":     m.Slice.GetSliceContent(),
		}
	})

	return result, nil
}

func (kr *Retrieve) GetChatHistoryOrNil(ctx context.Context, ChatHistorySetting *vo.ChatHistorySetting) []*einoSchema.Message {
	if ChatHistorySetting == nil || !ChatHistorySetting.EnableChatHistory {
		return nil
	}

	exeCtx := execute.GetExeCtx(ctx)
	if exeCtx == nil {
		logs.CtxWarnf(ctx, "execute context is nil, skipping chat history")
		return nil
	}
	if exeCtx.ExeCfg.WorkflowMode != workflow.WorkflowMode_ChatFlow {
		return nil
	}

	historyFromCtx, ok := ctxcache.Get[[]*conversation.Message](ctx, chatHistoryKey)
	var messages []*conversation.Message
	if ok {
		messages = historyFromCtx
	}

	if len(messages) == 0 {
		logs.CtxWarnf(ctx, "conversation history is empty")
		return nil
	}

	historyMessages := make([]*einoSchema.Message, 0, len(messages))
	for _, msg := range messages {
		schemaMsg, err := nodesconversation.ConvertMessageToSchema(ctx, msg)
		if err != nil {
			logs.CtxWarnf(ctx, "failed to convert history message, skipping: %v", err)
			continue
		}
		historyMessages = append(historyMessages, schemaMsg)
	}
	return historyMessages
}

func (kr *Retrieve) ToCallbackInput(ctx context.Context, in map[string]any) (map[string]any, error) {
	if kr.ChatHistorySetting == nil || !kr.ChatHistorySetting.EnableChatHistory {
		return in, nil
	}

	var messages []*conversation.Message
	execCtx := execute.GetExeCtx(ctx)
	if execCtx != nil {
		messages = execCtx.ExeCfg.ConversationHistory
	}
	if len(messages) == 0 {
		if kr.ChatHistorySetting.EnableChatHistory {
			ret := map[string]any{
				"chatHistory": []any{},
				"Query":       in["Query"],
			}
			return ret, nil
		}
		return in, nil
	}

	count := 0
	startIdx := 0
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == einoSchema.User {
			count++
		}
		if count >= int(kr.ChatHistorySetting.ChatHistoryRound) {
			startIdx = i
			break
		}
	}

	var historyMessages []any
	for _, msg := range messages[startIdx:] {
		content, err := nodesconversation.ConvertMessageToString(ctx, msg)
		if err != nil {
			logs.CtxWarnf(ctx, "failed to convert message to string: %v", err)
			continue
		}
		historyMessages = append(historyMessages, map[string]any{
			"role":    string(msg.Role),
			"content": content,
		})
	}
	ctxcache.Store(ctx, chatHistoryKey, messages[startIdx:])

	ret := map[string]any{
		"chatHistory": historyMessages,
		"Query":       in["Query"],
	}
	return ret, nil
}
