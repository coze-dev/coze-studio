package singleagent

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
)

func makeAgentOpenTimeKey(user, agentID int64) string {
	return fmt.Sprintf("agent:open_time:uid:%d:%d", user, agentID)
}

func (s *singleAgentImpl) GetRecentOpenAgentTime(ctx context.Context, uid, agentID int64) (int64, error) {
	key := makeAgentOpenTimeKey(uid, agentID)

	openTimeMS, err := s.CounterRepo.Get(ctx, key)
	if err != nil {
		return 0, err
	}

	return openTimeMS, nil
}

func (s *singleAgentImpl) SetRecentOpenAgentTime(ctx context.Context, uid, agentID int64, openTimeMS int64) error {
	key := makeAgentOpenTimeKey(uid, agentID)
	return s.CounterRepo.Set(ctx, key, openTimeMS)
}

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
