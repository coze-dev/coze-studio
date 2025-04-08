package middleware

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
)

func AuthNVerifySession() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		//ticket, err := rpc.VerifySession(ctx, c.GetInt64(string(base.CtxKeyUid)), util2.GetAllHttpHeaders(c), util2.GetAllQueries(c))
		//if err != nil {
		//	type data struct {
		//		Code int32  `json:"code,omitempty"`
		//		Msg  string `json:"msg,omitempty"`
		//	}
		//	c.JSON(http.StatusOK, data{Code: 400, Msg: errMsg})
		//
		//	c.Abort()
		//	return
		//}

		// TODO： 跨层的字符串放哪个包？还是各自定义？
		ctx = context.WithValue(ctx, "request.mw_identity_ticket", "ticket12321312312")
		ctx = context.WithValue(ctx, "request.full_path", c.FullPath())
		c.Next(ctx)
	}
}
