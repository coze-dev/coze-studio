package coze

import (
	"context"

	playground "code.byted.org/flow/opencoze/backend/api/model/playground"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

// UpdateDraftBotInfo .
// @router /api/playground_api/draftbot/update_draft_bot_info [POST]
func UpdateDraftBotInfo(ctx context.Context, c *app.RequestContext) {
	var err error
	var req playground.UpdateDraftBotInfoRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(playground.UpdateDraftBotInfoResponse)

	c.JSON(consts.StatusOK, resp)
}
