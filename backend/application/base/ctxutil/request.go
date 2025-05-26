package ctxutil

import "context"

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
