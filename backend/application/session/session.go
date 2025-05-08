package session

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
)

type SessionApplicationService struct{}

var SessionSVC = SessionApplicationService{}

func (s *SessionApplicationService) ValidateSession(ctx context.Context, sessionID string) (*entity.SessionData, error) {
	return sessionDomainSVC.GetSession(ctx, sessionID)
}
