package httputil

import (
	"context"
	"errors"
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"

	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type data struct {
	Code int32  `json:"code"`
	Msg  string `json:"msg"`
}

func BadRequest(c *app.RequestContext, errMsg string) {
	c.AbortWithStatusJSON(http.StatusBadRequest, data{Code: http.StatusBadRequest, Msg: errMsg})
}

func InternalError(ctx context.Context, c *app.RequestContext, err error) {
	var customErr errorx.StatusError

	// if error is custom error and not affect stability error
	// return custom error msg
	if errors.As(err, &customErr) && customErr.Code() != 0 {
		logs.CtxWarnf(ctx, "[StableError] error:  %v %v \n", customErr.Code(), err)

		msg := "internal server error"
		if !customErr.IsAffectStability() {
			msg = customErr.Msg()
			return
		}

		c.AbortWithStatusJSON(http.StatusOK, data{Code: customErr.Code(), Msg: msg})
		return
	}

	// affect stability error or other error
	// return internal server error
	logs.CtxErrorf(ctx, "[InternalError]  error: %v \n", err)
	c.AbortWithStatusJSON(http.StatusInternalServerError, data{Code: 500, Msg: "internal server error"})
}
