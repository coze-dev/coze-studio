package coze

import (
	"context"
	"errors"
	"net/http"

	"code.byted.org/flow/opencoze/backend/application"
	"github.com/cloudwego/hertz/pkg/app"
)

type data struct {
	Code int32  `json:"code,omitempty"`
	Msg  string `json:"msg,omitempty"`
}

func badRequestResponse(ctx context.Context, c *app.RequestContext, errMsg string) {
	c.JSON(http.StatusOK, data{Code: 400, Msg: errMsg})
}

func internalServerErrorResponse(ctx context.Context, c *app.RequestContext, err error) {
	if errors.Is(err, application.ErrUnauthorized) {
		c.JSON(http.StatusOK, data{Code: 401, Msg: err.Error()})
		return
	}

	// TODO：根据 error 类型判断是否需要返回具体内部的错误信息
	c.JSON(http.StatusOK, data{Code: 500, Msg: "internal server error"})
}
