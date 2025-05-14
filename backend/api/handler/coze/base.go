package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/api/internal/errresp"
)

func invalidParamRequestResponse(c *app.RequestContext, errMsg string) {
	errresp.InvalidParamRequestResponse(c, errMsg)
}

func internalServerErrorResponse(ctx context.Context, c *app.RequestContext, err error) {
	errresp.InternalServerErrorResponse(ctx, c, err)
}
