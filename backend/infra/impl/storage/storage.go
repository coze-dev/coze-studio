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

package storage

import (
	"context"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/imagex"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/storage"
	"code.byted.org/data_edc/workflow_engine_next/infra/impl/storage/tos"
	"code.byted.org/data_edc/workflow_engine_next/types/consts"
)

type Storage = storage.Storage

func New(ctx context.Context) (Storage, error) {
	return tos.New(
		ctx,
		"gec-algo-arch-us",
		"9D42I3SXHU32NTIAX34O",
		"maliva",
		consts.WorkflowEnginePSM,
	)
}

func NewImagex(ctx context.Context) (imagex.ImageX, error) {
	// TODO: 图片后续可以用单独的 tos 配置
	return tos.NewStorageImagex(
		ctx,
		"gec-algo-arch-us",
		"9D42I3SXHU32NTIAX34O",
		"maliva",
		consts.WorkflowEnginePSM,
	)
}
