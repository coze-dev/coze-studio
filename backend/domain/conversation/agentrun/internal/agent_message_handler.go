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

package internal

import (
	"context"
	"encoding/json"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	crossagent "github.com/coze-dev/coze-studio/backend/crossdomain/contract/agent"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
)

func HistoryPairs(historyMsg []*message.Message) []*message.Message {

	fcMsgPairs := make(map[int64][]*message.Message)
	for _, one := range historyMsg {
		if one.MessageType != message.MessageTypeFunctionCall && one.MessageType != message.MessageTypeToolResponse {
			continue
		}
		if _, ok := fcMsgPairs[one.RunID]; !ok {
			fcMsgPairs[one.RunID] = []*message.Message{one}
		} else {
			fcMsgPairs[one.RunID] = append(fcMsgPairs[one.RunID], one)
		}
	}

	var historyAfterPairs []*message.Message
	for _, value := range historyMsg {
		if value.MessageType == message.MessageTypeFunctionCall {
			if len(fcMsgPairs[value.RunID])%2 == 0 {
				historyAfterPairs = append(historyAfterPairs, value)
			}
		} else {
			historyAfterPairs = append(historyAfterPairs, value)
		}
	}
	return historyAfterPairs

}

func TransMessageToSchemaMessage(ctx context.Context, msgs []*message.Message, imagexClient imagex.ImageX) []*schema.Message {
	schemaMessage := make([]*schema.Message, 0, len(msgs))

	for _, msgOne := range msgs {
		if msgOne.ModelContent == "" {
			continue
		}
		if msgOne.MessageType == message.MessageTypeVerbose || msgOne.MessageType == message.MessageTypeFlowUp {
			continue
		}
		var sm *schema.Message
		err := json.Unmarshal([]byte(msgOne.ModelContent), &sm)
		if err != nil {
			continue
		}
		if len(sm.ReasoningContent) > 0 {
			sm.ReasoningContent = ""
		}
		schemaMessage = append(schemaMessage, parseMessageURI(ctx, sm, imagexClient))
	}

	return schemaMessage
}

func parseMessageURI(ctx context.Context, mcMsg *schema.Message, imagexClient imagex.ImageX) *schema.Message {
	if mcMsg.MultiContent == nil {
		return mcMsg
	}
	for k, one := range mcMsg.MultiContent {
		switch one.Type {
		case schema.ChatMessagePartTypeImageURL:

			if one.ImageURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.ImageURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].ImageURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeFileURL:
			if one.FileURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.FileURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].FileURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeAudioURL:
			if one.AudioURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.AudioURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].AudioURL.URL = url.URL
				}
			}
		case schema.ChatMessagePartTypeVideoURL:
			if one.VideoURL.URI != "" {
				url, err := imagexClient.GetResourceURL(ctx, one.VideoURL.URI)
				if err == nil {
					mcMsg.MultiContent[k].VideoURL.URL = url.URL
				}
			}
		}
	}
	return mcMsg
}

func ParseResumeInfo(_ context.Context, historyMsg []*message.Message) *crossagent.ResumeInfo {

	var resumeInfo *crossagent.ResumeInfo
	for i := len(historyMsg) - 1; i >= 0; i-- {
		if historyMsg[i].MessageType == message.MessageTypeQuestion {
			break
		}
		if historyMsg[i].MessageType == message.MessageTypeVerbose {
			if historyMsg[i].Ext[string(entity.ExtKeyResumeInfo)] != "" {
				err := json.Unmarshal([]byte(historyMsg[i].Ext[string(entity.ExtKeyResumeInfo)]), &resumeInfo)
				if err != nil {
					return nil
				}
			}
		}
	}
	return resumeInfo
}
