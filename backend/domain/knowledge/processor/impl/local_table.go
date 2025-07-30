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

package impl

import (
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type localTableProcessor struct {
	baseDocProcessor
}

func (l *localTableProcessor) BeforeCreate() error {
	if isTableAppend(l.Documents) {
		tableDoc, _, err := l.documentRepo.FindDocumentByCondition(l.ctx, &entity.WhereDocumentOpt{
			KnowledgeIDs: []int64{l.Documents[0].KnowledgeID},
			SelectAll:    true,
		})
		if err != nil {
			logs.CtxErrorf(l.ctx, "find document failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}

		if len(tableDoc) == 0 {
			logs.CtxErrorf(l.ctx, "table doc not found")
			return errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "doc not found"))
		}

		l.Documents[0].ID = tableDoc[0].ID

		if tableDoc[0].TableInfo == nil {
			logs.CtxErrorf(l.ctx, "table info not found")
			return errorx.New(errno.ErrKnowledgeTableInfoNotExistCode, errorx.KVf("msg", "table info not found, doc_id: %d", tableDoc[0].ID))
		}
		l.Documents[0].TableInfo = ptr.From(tableDoc[0].TableInfo)
		return nil
	}
	return l.baseDocProcessor.BeforeCreate()
}

func (l *localTableProcessor) BuildDBModel() error {
	if isTableAppend(l.Documents) {
		return nil
	}
	return l.baseDocProcessor.BuildDBModel()
}

func (l *localTableProcessor) InsertDBModel() error {
	if isTableAppend(l.Documents) {
		// Append the scene and set the document to the processing state
		err := l.documentRepo.SetStatus(l.ctx, l.Documents[0].ID, int32(entity.DocumentStatusUploading), "")
		if err != nil {
			logs.CtxErrorf(l.ctx, "document set status err:%v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		return nil
	}
	return l.baseDocProcessor.InsertDBModel()
}
