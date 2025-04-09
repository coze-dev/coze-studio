package application

import (
	"code.byted.org/flow/opencoze/backend/domain/session/entity"
	"code.byted.org/flow/opencoze/backend/pkg/ctxcache"
	"context"
)

func getUserSessionFromCtx(ctx context.Context) *entity.SessionData {
	data, ok := ctxcache.Get[*entity.SessionData](ctx, SessionApplicationService{})
	if !ok {
		return nil
	}

	return data
}

func getUIDFromCtx(ctx context.Context) *int64 {
	sessionData := getUserSessionFromCtx(ctx)
	if sessionData == nil {
		return nil
	}

	return &sessionData.UserID
}

func getRequestTicketFromCtx(ctx context.Context) string {
	contextValue := ctx.Value("request.mw_identity_ticket")
	if contextValue == nil {
		return ""
	}

	ticket, ok := contextValue.(string)
	if !ok {
		return ""
	}

	return ticket
}

func getRequestFullPathFromCtx(ctx context.Context) string {
	contextValue := ctx.Value("request.full_path")
	if contextValue == nil {
		return ""
	}

	fullPath, ok := contextValue.(string)
	if !ok {
		return ""
	}

	return fullPath
}
