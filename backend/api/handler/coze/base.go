package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/internal/httputil"
)

func invalidParamRequestResponse(c *app.RequestContext, errMsg string) {
	httputil.BadRequest(c, errMsg)
}

func internalServerErrorResponse(ctx context.Context, c *app.RequestContext, err error) {
	httputil.InternalError(ctx, c, err)
}
