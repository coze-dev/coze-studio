package ctxutil

import "context"

func GetRequestTicketFromCtx(ctx context.Context) string {
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

func GetRequestFullPathFromCtx(ctx context.Context) string {
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
