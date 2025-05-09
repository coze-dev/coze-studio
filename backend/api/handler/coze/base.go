package coze

import (
	"context"
	"errors"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/types/errno"
)

type data struct {
	Code int32  `json:"code,omitempty"`
	Msg  string `json:"msg,omitempty"`
}

func invalidParamRequestResponse(c *app.RequestContext, errMsg string) {
	c.JSON(http.StatusBadRequest, data{Code: errno.ErrInvalidParamCode, Msg: errMsg})
}

func internalServerErrorResponse(ctx context.Context, c *app.RequestContext, err error) {
	var customErr errorx.StatusError
	if errors.As(err, &customErr) && customErr.Code() != 0 {
		logs.CtxWarnf(ctx, "[internalServerErrorResponse] error:  %v \n", err)

		c.JSON(http.StatusOK, data{Code: customErr.Code(), Msg: customErr.Error()})
		return
	}

	logs.CtxErrorf(ctx, "[internalServerErrorResponse]  error: %v \n", err)
	c.JSON(http.StatusInternalServerError, data{Code: 500, Msg: "internal server error"})
}
