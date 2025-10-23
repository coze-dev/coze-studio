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

package service

import (
	"context"
	"fmt"

	model "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

func (k *knowledgeSVC) isWritableKnowledgeAndDocument(ctx context.Context, knowledgeID, documentID int64) (bool, error) {
	if valid, err := k.isWritableKnowledge(ctx, knowledgeID); err != nil {
		return false, err
	} else if !valid {
		return false, nil
	}

	if valid, err := k.isWritableDocument(ctx, documentID); err != nil {
		return false, err
	} else if !valid {
		return false, nil
	}

	return true, nil
}

func (k *knowledgeSVC) isWritableKnowledge(ctx context.Context, knowledgeID int64) (bool, error) {
	knowledgeModel, err := k.knowledgeRepo.GetByID(ctx, knowledgeID)
	if err != nil {
		return false, fmt.Errorf("[isWritableKnowledge] GetByID failed, %w", err)
	}
	if knowledgeModel == nil {
		logs.Errorf("[isWritableKnowledge] knowledge is nil, id=%d", knowledgeID)
		return false, errorx.New(errno.ErrKnowledgeNonRetryableCode, errorx.KV("reason", "[isWritableKnowledge] knowledge not found"))
	}
	switch model.KnowledgeStatus(knowledgeModel.Status) {
	case model.KnowledgeStatusInit, model.KnowledgeStatusEnable:
		return true, nil
	case model.KnowledgeStatusDisable:
		return false, nil
	default:
		return false, nil
	}
}

func (k *knowledgeSVC) isWritableDocument(ctx context.Context, documentID int64) (bool, error) {
	documentModel, err := k.documentRepo.GetByID(ctx, documentID)
	if err != nil {
		return false, fmt.Errorf("[isWritableDocument] GetByID failed, %w", err)
	}
	if documentModel == nil {
		logs.Errorf("[isWritableDocument] document is nil, id=%d", documentID)
		return false, errorx.New(errno.ErrKnowledgeNonRetryableCode, errorx.KV("reason", "[isWritableDocument] document not found"))
	}
	switch entity.DocumentStatus(documentModel.Status) {
	case entity.DocumentStatusInit, entity.DocumentStatusUploading, entity.DocumentStatusEnable, entity.DocumentStatusChunking, entity.DocumentStatusFailed:
		return true, nil
	case entity.DocumentStatusDisable, entity.DocumentStatusDeleted:
		return false, nil
	default:
		return false, nil
	}
}
