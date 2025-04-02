package dal

import (
	"context"
	"encoding/base64"
	"encoding/binary"

	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/cache"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
)

type SessionDAO struct {
	cacheCli cache.Cmdable
	idGen    idgen.IDGenerator
}

func NewSessionDAO(c cache.Cmdable, gen idgen.IDGenerator) *SessionDAO {
	return &SessionDAO{
		cacheCli: c,
		idGen:    gen,
	}
}

func (s *SessionDAO) CreateSession(ctx context.Context, meta *entity.SessionData) (sessionID string, err error) {
	sessionID, err = s.generateSecureID(ctx)
	if err != nil {
		return "", err
	}

	// TODO

	return sessionID, err
}

func (s *SessionDAO) RevokeSession(ctx context.Context, sessionID string) error {
	return nil
}

func (s *SessionDAO) GetSession(ctx context.Context, sessionID string) (*entity.SessionData, error) {
	return &entity.SessionData{
		UserID: 10086,
	}, nil
}

func (s *SessionDAO) generateSecureID(ctx context.Context) (string, error) {
	id, err := s.idGen.GenID(ctx)
	if err != nil {
		return "", err
	}

	buf := make([]byte, 8)
	binary.LittleEndian.PutUint64(buf, uint64(id)) // 小端序

	return base64.URLEncoding.EncodeToString(buf), nil
}
