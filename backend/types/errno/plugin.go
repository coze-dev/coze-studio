package errno

import (
	"fmt"

	"code.byted.org/flow/opencoze/backend/pkg/errorx/code"
)

// Plugin: 109 000 000 ~ 109 999 999
const (
	ErrPluginInvalidParamCode             = 109000000
	ErrPluginPermissionCode               = 109000001
	ErrPluginInvalidClientCredentialsCode = 109000002
	ErrPluginInvalidOpenapi3Doc           = 109000003
	ErrPluginInvalidManifest              = 109000004
	ErrPluginRecordNotFound               = 109000005
	ErrPluginDeactivatedTool              = 109000006
	ErrPluginDuplicatedTool               = 109000007
	ErrPluginInvalidThirdPartyCode        = 109000008
	ErrPluginExecuteToolFailed            = 109000009
	ErrPluginConvertProtocolFailed        = 109000010
	ErrPluginToolsCheckFailed             = 109000011
)

const (
	PluginMsgKey = "msg"
)

func init() {
	code.Register(
		ErrPluginPermissionCode,
		fmt.Sprintf("unauthorized access : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidParamCode,
		fmt.Sprintf("invalid parameter : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidClientCredentialsCode,
		"invalid client credentials",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidOpenapi3Doc,
		fmt.Sprintf("invalid plugin openapi3 document : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginInvalidManifest,
		fmt.Sprintf("invalid plugin manifest : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginRecordNotFound,
		fmt.Sprintf("record not found"),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginDeactivatedTool,
		fmt.Sprintf("tool is deactivated : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginDuplicatedTool,
		fmt.Sprintf("duplicated tool : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginExecuteToolFailed,
		fmt.Sprintf("execute tool failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginConvertProtocolFailed,
		fmt.Sprintf("convert protocol failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)

	code.Register(
		ErrPluginToolsCheckFailed,
		fmt.Sprintf("tools check failed : {%s}", PluginMsgKey),
		code.WithAffectStability(false),
	)
}
