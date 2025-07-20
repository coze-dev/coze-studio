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

package singleagent

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/ocean/cloud/playground"
)

func makeAgentPopupInfoKey(uid, agentID int64, agentPopupType playground.BotPopupType) string {
	return fmt.Sprintf("agent:popup_info:uid:%d:%d:%d", uid, agentID, int64(agentPopupType))
}

func (s *singleAgentImpl) GetAgentPopupCount(ctx context.Context, uid, agentID int64, agentPopupType playground.BotPopupType) (int64, error) {
	key := makeAgentPopupInfoKey(uid, agentID, agentPopupType)

	count, err := s.CounterRepo.Get(ctx, key)
	if err != nil {
		return 0, err
	}

	return count, nil
}

func (s *singleAgentImpl) IncrAgentPopupCount(ctx context.Context, uid, agentID int64, agentPopupType playground.BotPopupType) error {
	key := makeAgentPopupInfoKey(uid, agentID, agentPopupType)
	return s.CounterRepo.IncrBy(ctx, key, 1)
}
