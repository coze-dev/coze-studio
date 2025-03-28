package coze

import (
	"context"
	"net/http"

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
	// TODO：根据 error 类型判断是否需要返回具体内部的错误信息
	c.JSON(http.StatusOK, data{Code: 500, Msg: "internal server error"})
}
