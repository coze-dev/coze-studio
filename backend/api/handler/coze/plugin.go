package coze

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"

	"code.byted.org/flow/opencoze/backend/api/model/plugin"
)

// RegisterPluginMeta .
// @router /api/plugin_api/register_plugin_meta [POST]
func RegisterPluginMeta(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.RegisterPluginMetaRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.RegisterPluginMetaResponse)

	c.JSON(consts.StatusOK, resp)
}

// UpdatePluginMeta .
// @router /api/plugin_api/update_plugin_meta [POST]
func UpdatePluginMeta(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.UpdatePluginMetaRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.UpdatePluginMetaResponse)

	c.JSON(consts.StatusOK, resp)
}

// UpdatePlugin .
// @router /api/plugin_api/update [POST]
func UpdatePlugin(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.UpdatePluginRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.UpdatePluginResponse)

	c.JSON(consts.StatusOK, resp)
}

// DelPlugin .
// @router /api/plugin_api/del_plugin [POST]
func DelPlugin(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.DelPluginRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.DelPluginResponse)

	c.JSON(consts.StatusOK, resp)
}

// GetPlaygroundPluginList .
// @router /api/plugin_api/get_playground_plugin_list [POST]
func GetPlaygroundPluginList(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.GetPlaygroundPluginListRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.GetPlaygroundPluginListResponse)

	c.JSON(consts.StatusOK, resp)
}

// GetPluginAPIs .
// @router /api/plugin_api/get_plugin_apis [POST]
func GetPluginAPIs(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.GetPluginAPIsRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.GetPluginAPIsResponse)

	c.JSON(consts.StatusOK, resp)
}

// GetPluginInfo .
// @router /api/plugin_api/get_plugin_info [POST]
func GetPluginInfo(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.GetPluginInfoRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.GetPluginInfoResponse)

	c.JSON(consts.StatusOK, resp)
}

// GetUpdatedAPIs .
// @router /api/plugin_api/get_updated_apis [POST]
func GetUpdatedAPIs(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.GetUpdatedAPIsRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.GetUpdatedAPIsResponse)

	c.JSON(consts.StatusOK, resp)
}

// PublishPlugin .
// @router /api/plugin_api/publish_plugin [POST]
func PublishPlugin(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.PublishPluginRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.PublishPluginResponse)

	c.JSON(consts.StatusOK, resp)
}

// GetBotDefaultParams .
// @router /api/plugin_api/get_bot_default_params [POST]
func GetBotDefaultParams(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.GetBotDefaultParamsRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.GetBotDefaultParamsResponse)

	c.JSON(consts.StatusOK, resp)
}

// UpdateBotDefaultParams .
// @router /api/plugin_api/update_bot_default_params [POST]
func UpdateBotDefaultParams(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.UpdateBotDefaultParamsRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.UpdateBotDefaultParamsResponse)

	c.JSON(consts.StatusOK, resp)
}

// DeleteBotDefaultParams .
// @router /api/plugin_api/delete_bot_default_params [POST]
func DeleteBotDefaultParams(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.DeleteBotDefaultParamsRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.DeleteBotDefaultParamsResponse)

	c.JSON(consts.StatusOK, resp)
}

// CreateAPI .
// @router /api/plugin_api/create_api [POST]
func CreateAPI(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.CreateAPIRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.CreateAPIResponse)

	c.JSON(consts.StatusOK, resp)
}

// UpdateAPI .
// @router /api/plugin_api/update_api [POST]
func UpdateAPI(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.UpdateAPIRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.UpdateAPIResponse)

	c.JSON(consts.StatusOK, resp)
}

// DeleteAPI .
// @router /api/plugin_api/delete_api [POST]
func DeleteAPI(ctx context.Context, c *app.RequestContext) {
	var err error
	var req plugin.DeleteAPIRequest
	err = c.BindAndValidate(&req)
	if err != nil {
		c.String(consts.StatusBadRequest, err.Error())
		return
	}

	resp := new(plugin.DeleteAPIResponse)

	c.JSON(consts.StatusOK, resp)
}
