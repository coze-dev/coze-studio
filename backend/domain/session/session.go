package session

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
)

type Session interface {
	CreateSession(ctx context.Context, meta *entity.SessionData) (sessionID string, err error)
	RevokeSession(ctx context.Context, sessionID string) error
	GetSession(ctx context.Context, sessionID string) (*entity.SessionData, error)
}
