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
	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/knowledge"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// User-defined form creation document
type customTableProcessor struct {
	baseDocProcessor
}

func (c *customTableProcessor) BeforeCreate() error {
	if isTableAppend(c.Documents) {
		tableDoc, _, err := c.documentRepo.FindDocumentByCondition(c.ctx, &entity.WhereDocumentOpt{KnowledgeIDs: []int64{c.Documents[0].KnowledgeID}, SelectAll: true})
		if err != nil {
			logs.CtxErrorf(c.ctx, "find document failed, err: %v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		if len(tableDoc) == 0 {
			logs.CtxErrorf(c.ctx, "table doc not found")
			return errorx.New(errno.ErrKnowledgeDocumentNotExistCode, errorx.KV("msg", "doc not found"))
		}
		c.Documents[0].ID = tableDoc[0].ID
		if tableDoc[0].TableInfo == nil {
			logs.CtxErrorf(c.ctx, "table info not found")
			return errorx.New(errno.ErrKnowledgeTableInfoNotExistCode, errorx.KVf("msg", "table info not found, doc_id: %d", tableDoc[0].ID))
		}
		c.Documents[0].TableInfo = *tableDoc[0].TableInfo
		// append scene
		if c.Documents[0].RawContent != "" {
			c.Documents[0].FileExtension = getFormatType(c.Documents[0].Type)
			uri := getTosUri(c.UserID, string(c.Documents[0].FileExtension))
			err := c.storage.PutObject(c.ctx, uri, []byte(c.Documents[0].RawContent))
			if err != nil {
				logs.CtxErrorf(c.ctx, "put object failed, err: %v", err)
				return errorx.New(errno.ErrKnowledgePutObjectFailCode, errorx.KV("msg", err.Error()))
			}
			c.Documents[0].URI = uri
		}
	}
	return nil
}

func (c *customTableProcessor) BuildDBModel() error {
	if len(c.Documents) > 0 &&
		c.Documents[0].Type == knowledge.DocumentTypeTable {
		if c.Documents[0].IsAppend {
			// Append the scene, no need to create a table
			// First, the user customizes some data, and second, uploads another form and appends the data in the form to the form
		} else {
			err := c.baseDocProcessor.BuildDBModel()
			if err != nil {
				return err
			}
			// Since this method of creation does not carry any data, the state is set to available directly
			for i := range c.docModels {
				c.docModels[i].DocumentType = 1
				c.docModels[i].Status = int32(entity.DocumentStatusInit)
			}
		}
	}
	return nil
}

func (c *customTableProcessor) InsertDBModel() error {
	if isTableAppend(c.Documents) {
		// Append the scene and set the document to the processing state
		err := c.documentRepo.SetStatus(c.ctx, c.Documents[0].ID, int32(entity.DocumentStatusUploading), "")
		if err != nil {
			logs.CtxErrorf(c.ctx, "document set status err:%v", err)
			return errorx.New(errno.ErrKnowledgeDBCode, errorx.KV("msg", err.Error()))
		}
		return nil
	}
	return c.baseDocProcessor.InsertDBModel()
}

func (c *customTableProcessor) Indexing() error {
	// c.baseDocProcessor.Indexing()
	if isTableAppend(c.Documents) {
		err := c.baseDocProcessor.Indexing()
		if err != nil {
			logs.CtxErrorf(c.ctx, "document indexing err:%v", err)
			return err
		}
	}
	return nil
}
