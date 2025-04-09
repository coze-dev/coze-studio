package coze

import (
	"context"
	"unicode/utf8"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/agent"
	"code.byted.org/flow/opencoze/backend/api/model/agent_common"
	"code.byted.org/flow/opencoze/backend/application"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

const maxLength = 65535

// UpdateDraftBotInfo .
// @router /api/playground_api/draftbot/update_draft_bot_info [POST]
func UpdateDraftBotInfo(ctx context.Context, c *app.RequestContext) {
	var err error
	var req agent.UpdateDraftBotInfoRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		badRequestResponse(ctx, c, err.Error())
		return
	}

	if req.BotInfo == nil {
		badRequestResponse(ctx, c, "bot info is nil")
		return
	}

	if req.BotInfo.BotId == nil {
		badRequestResponse(ctx, c, "bot id is nil")
		return
	}

	if req.BotInfo.OnboardingInfo != nil {
		// TODO :
		// 1. CheckParams里面的 hook 外场不用关注，不同步
		// 2. CheckParams里面的 按地区去check
		// 3. OnboardingExceedLimitCheck 根据不同地区限制 SuggestedQuestions 问题长度

		infoStr, err := generateOnboardingStr(ctx, req.BotInfo.OnboardingInfo)
		if err != nil {
			internalServerErrorResponse(ctx, c, err)
			return
		}

		if len(infoStr) > maxLength {
			badRequestResponse(ctx, c, "bot info is too long")
			return
		}

		return
	}

	// TODO：checkAndSetCollaborationMode、setModelInfoContextModel 不知道干嘛的先不同步
	resp, err := application.SingleAgentSVC.UpdateDraftBotInfo(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}

func generateOnboardingStr(ctx context.Context, onboardingInfo *agent_common.OnboardingInfo) (string, error) {
	onboarding := agent.OnboardingContent{}
	if onboardingInfo != nil {
		onboarding.Prologue = ptr.Of(onboardingInfo.GetPrologue())
		onboarding.SuggestedQuestions = onboardingInfo.GetSuggestedQuestions()
		onboarding.SuggestedQuestionsShowMode = onboardingInfo.SuggestedQuestionsShowMode
	}

	onboardingInfoStr, err := sonic.MarshalString(onboarding)
	if err != nil {
		logs.CtxErrorf(ctx, "GenerateOnboardingStr Marshal error: %v", err)
		return "", err
	}

	return onboardingInfoStr, nil
}

// DraftBotCreate .
// @router /api/draftbot/create [POST]
func DraftBotCreate(ctx context.Context, c *app.RequestContext) {
	var err error
	var req agent.DraftBotCreateRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		badRequestResponse(ctx, c, err.Error())
		return
	}

	if req.SpaceID == 0 {
		badRequestResponse(ctx, c, "space id is nil")
		return
	}

	if req.Name == "" {
		badRequestResponse(ctx, c, "name is nil")
		return
	}

	if req.IconURI == "" {
		badRequestResponse(ctx, c, "icon uri is nil")
		return
	}

	if utf8.RuneCountInString(req.Name) > 50 {
		badRequestResponse(ctx, c, "name is too long")
		return
	}

	if utf8.RuneCountInString(req.Description) > 2000 {
		badRequestResponse(ctx, c, "description is too long")
		return
	}

	resp, err := application.SingleAgentSVC.DraftBotCreate(ctx, &req)
	if err != nil {
		internalServerErrorResponse(ctx, c, err)
		return
	}

	c.JSON(consts.StatusOK, resp)
}
