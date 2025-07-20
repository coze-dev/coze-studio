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

package conversation

import (
	"encoding/json"

	"github.com/hertz-contrib/sse"

	"github.com/coze-dev/coze-studio/backend/api/model/conversation/run"
)

func buildDoneEvent(event string) *sse.Event {
	return &sse.Event{
		Event: event,
	}
}

func buildErrorEvent(errCode int64, errMsg string) *sse.Event {
	errData := run.ErrorData{
		Code: errCode,
		Msg:  errMsg,
	}
	ed, _ := json.Marshal(errData)

	return &sse.Event{
		Event: run.RunEventError,
		Data:  ed,
	}
}

func buildMessageChunkEvent(event string, chunkMsg []byte) *sse.Event {
	return &sse.Event{
		Event: event,
		Data:  chunkMsg,
	}
}
