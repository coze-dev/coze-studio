/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package plugin

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/plugin"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type Config struct {
	PluginID      int64
	ToolID        int64
	PluginVersion string

	PluginService plugin.Service
}

type Plugin struct {
	config *Config
}

func NewPlugin(_ context.Context, cfg *Config) (*Plugin, error) {
	if cfg == nil {
		return nil, errors.New("config is nil")
	}
	if cfg.PluginID == 0 {
		return nil, errors.New("plugin id is required")
	}
	if cfg.ToolID == 0 {
		return nil, errors.New("tool id is required")
	}
	if cfg.PluginService == nil {
		return nil, errors.New("tool service is required")
	}

	return &Plugin{config: cfg}, nil
}

func (p *Plugin) Invoke(ctx context.Context, parameters map[string]any) (ret map[string]any, err error) {
	var exeCfg vo.ExecuteConfig
	if ctxExeCfg := execute.GetExeCtx(ctx); ctxExeCfg != nil {
		exeCfg = ctxExeCfg.ExeCfg
	}
	result, err := p.config.PluginService.ExecutePlugin(ctx, parameters, &vo.PluginEntity{
		PluginID:      p.config.PluginID,
		PluginVersion: ptr.Of(p.config.PluginVersion),
	}, p.config.ToolID, exeCfg)
	if err != nil {
		if extra, ok := compose.IsInterruptRerunError(err); ok {
			// TODO: temporarily replace interrupt with real error, because frontend cannot handle interrupt for now
			interruptData := extra.(*entity.InterruptEvent).InterruptData
			return nil, vo.NewError(errno.ErrAuthorizationRequired, errorx.KV("extra", interruptData))
		}
		return nil, err
	}

	return result, nil

}
