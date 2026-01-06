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

package agentrun

import (
	"context"
	"runtime/debug"
	"time"

	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/internal"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	"github.com/coze-dev/coze-studio/backend/infra/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type runImpl struct {
	Components
}

type Components struct {
	RunRecordRepo repository.RunRecordRepo
	ImagexSVC     imagex.ImageX
}

func NewService(c *Components) Run {
	return &runImpl{
		Components: *c,
	}
}

func (c *runImpl) AgentRun(ctx context.Context, arm *entity.AgentRunMeta) (*schema.StreamReader[*entity.AgentRunResponse], error) {
	sr, sw := schema.Pipe[*entity.AgentRunResponse](20)

	defer func() {
		if pe := recover(); pe != nil {
			logs.CtxErrorf(ctx, "panic recover: %v\n, [stack]:%v", pe, string(debug.Stack()))
			return
		}
	}()

	art := &internal.AgentRuntime{
		StartTime:     time.Now(),
		RunMeta:       arm,
		SW:            sw,
		MessageEvent:  internal.NewMessageEvent(),
		RunProcess:    internal.NewRunProcess(c.RunRecordRepo),
		RunRecordRepo: c.RunRecordRepo,
		ImagexClient:  c.ImagexSVC,
	}
	safego.Go(ctx, func() {
		defer sw.Close()
		_ = art.Run(ctx)
	})

	return sr, nil
}

func (c *runImpl) Delete(ctx context.Context, runID []int64) error {
	return c.RunRecordRepo.Delete(ctx, runID)
}

func (c *runImpl) List(ctx context.Context, meta *entity.ListRunRecordMeta) ([]*entity.RunRecordMeta, error) {
	return c.RunRecordRepo.List(ctx, meta)
}

func (c *runImpl) Create(ctx context.Context, runRecord *entity.AgentRunMeta) (*entity.RunRecordMeta, error) {
	return c.RunRecordRepo.Create(ctx, runRecord)
}
func (c *runImpl) Cancel(ctx context.Context, req *entity.CancelRunMeta) (*entity.RunRecordMeta, error) {
	return c.RunRecordRepo.Cancel(ctx, req)
}

func (c *runImpl) GetByID(ctx context.Context, runID int64) (*entity.RunRecordMeta, error) {
	return c.RunRecordRepo.GetByID(ctx, runID)
}
