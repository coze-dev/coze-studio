package singleagent

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/playground"
)

func makeAgentPopupInfoKey(agentID int64, agentPopupType playground.BotPopupType) string {
	return fmt.Sprintf("agent_popup_info:%d:%d", agentID, int64(agentPopupType))
}

func (s *SingleAgentApplicationService) GetAgentPopupInfo(ctx context.Context, req *playground.GetBotPopupInfoRequest) (*playground.GetBotPopupInfoResponse, error) {
	agentPopupCountInfo := make(map[playground.BotPopupType]int64, len(req.BotPopupTypes))
	for _, agentPopupType := range req.BotPopupTypes {
		key := makeAgentPopupInfoKey(req.BotID, agentPopupType)

		count, err := s.appContext.CounterRepo.Get(ctx, key)
		if err != nil {
			return nil, err
		}

		agentPopupCountInfo[agentPopupType] = count
	}

	return &playground.GetBotPopupInfoResponse{
		Data: &playground.BotPopupInfoData{
			BotPopupCountInfo: agentPopupCountInfo,
		},
	}, nil
}

func (s *SingleAgentApplicationService) UpdateAgentPopupInfo(ctx context.Context, req *playground.UpdateBotPopupInfoRequest) (*playground.UpdateBotPopupInfoResponse, error) {
	key := makeAgentPopupInfoKey(req.BotID, req.BotPopupType)
	err := s.appContext.CounterRepo.IncrBy(ctx, key, 1)
	if err != nil {
		return nil, err
	}

	return &playground.UpdateBotPopupInfoResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}
