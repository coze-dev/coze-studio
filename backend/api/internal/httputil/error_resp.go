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

	if errors.As(err, &customErr) && customErr.Code() != 0 {
		logs.CtxWarnf(ctx, "[ErrorX] error:  %v %v \n", customErr.Code(), err)
		c.AbortWithStatusJSON(http.StatusOK, data{Code: customErr.Code(), Msg: customErr.Msg()})
		return
	}

	logs.CtxErrorf(ctx, "[InternalError]  error: %v \n", err)
	c.AbortWithStatusJSON(http.StatusInternalServerError, data{Code: 500, Msg: "internal server error"})
}
