package session

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/domain/session/internal/dal"
	"code.byted.org/flow/opencoze/backend/infra/contract/cache"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type sessionImpl struct {
	*dal.SessionDAO
}

func NewSessionService(c cache.Cmdable, gen idgen.IDGenerator) Session {
	return &sessionImpl{
		SessionDAO: dal.NewSessionDAO(c, gen),
	}
}

func (s *sessionImpl) CreateSession(ctx context.Context, meta *entity.SessionData) (sessionID string, err error) {
	return s.SessionDAO.CreateSession(ctx, meta)
}

func (s *sessionImpl) RevokeSession(ctx context.Context, sessionID string) error {
	return s.SessionDAO.RevokeSession(ctx, sessionID)
}

func (s *sessionImpl) GetSession(ctx context.Context, sessionID string) (*entity.SessionData, error) {
	return s.SessionDAO.GetSession(ctx, sessionID)
}
