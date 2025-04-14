package coze

import (
	"context"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/variables"
)

const (
	variableSysConfJson = `
[
    {
        "EffectiveChannelList": [
            "全渠道"
        ],
        "can_write": "false",
        "default_value": "",
        "description": "用户唯一ID",
        "example": "",
        "ext_desc": "",
        "group_desc": "",
        "group_ext_desc": "",
        "group_name": "用户信息",
        "key": "sys_uuid",
        "must_not_use_in_prompt": "false",
        "sensitive": "false"
    }
]
`

	variableSysGroupConfJson = `
[
    {
        "group_desc": "",
        "group_ext_desc": "",
        "group_name": "用户信息",
        "sub_group_info": [],
        "var_info_list": [
            {
                "EffectiveChannelList": [
                    "全渠道"
                ],
                "can_write": "false",
                "default_value": "",
                "description": "用户唯一ID",
                "example": "",
                "ext_desc": "",
                "group_desc": "",
                "group_ext_desc": "",
                "group_name": "用户信息",
                "key": "sys_uuid",
                "must_not_use_in_prompt": "false",
                "sensitive": "false"
            }
        ]
    }
]
`
)

// GetSysVariableConf .
// @router /api/memory/sys_variable_conf [GET]
func GetSysVariableConf(ctx context.Context, c *app.RequestContext) {
	var err error
	var req variables.GetSysVariableConfRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(variables.GetSysVariableConfResponse)
	conf := make([]*variables.VariableInfo, 0)
	_ = sonic.UnmarshalString(variableSysConfJson, &conf)

	groupConf := make([]*variables.GroupVariableInfo, 0)
	_ = sonic.UnmarshalString(variableSysGroupConfJson, &groupConf)

	resp.Conf = conf
	resp.GroupConf = groupConf

	c.JSON(consts.StatusOK, resp)
}
