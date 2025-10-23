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

package dal

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type MessageDAO struct {
	query *query.Query
	idgen idgen.IDGenerator
}

func NewMessageDAO(db *gorm.DB, idgen idgen.IDGenerator) *MessageDAO {
	return &MessageDAO{
		query: query.Use(db),
		idgen: idgen,
	}
}

func (dao *MessageDAO) PreCreate(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	poData, err := dao.messageDO2PO(ctx, msg)
	if err != nil {
		return nil, err
	}
	return dao.messagePO2DO(poData), nil
}

func (dao *MessageDAO) Create(ctx context.Context, msg *entity.Message) (*entity.Message, error) {
	poData, err := dao.messageDO2PO(ctx, msg)
	if err != nil {
		return nil, err
	}

	do := dao.query.Message.WithContext(ctx).Debug()
	cErr := do.Create(poData)
	if cErr != nil {
		return nil, cErr
	}

	return dao.messagePO2DO(poData), nil
}

func (dao *MessageDAO) BatchCreate(ctx context.Context, msg []*entity.Message) ([]*entity.Message, error) {
	poList := make([]*model.Message, 0, len(msg))
	for _, m := range msg {
		po, err := dao.messageDO2PO(ctx, m)
		if err != nil {
			return nil, err
		}
		poList = append(poList, po)
	}

	do := dao.query.Message.WithContext(ctx).Debug()
	cErr := do.CreateInBatches(poList, len(poList))
	if cErr != nil {
		return nil, cErr
	}

	return dao.batchMessagePO2DO(poList), nil
}

func (dao *MessageDAO) List(ctx context.Context, listMeta *entity.ListMeta) ([]*entity.Message, bool, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Debug().Where(m.ConversationID.Eq(listMeta.ConversationID)).Where(m.Status.Eq(int32(entity.MessageStatusAvailable)))

	if len(listMeta.RunID) > 0 {
		do = do.Where(m.RunID.In(slices.Transform(listMeta.RunID, func(t *int64) int64 {
			return *t
		})...))
	}
	if len(listMeta.MessageType) > 0 {
		do = do.Where(m.MessageType.In(slices.Transform(listMeta.MessageType, func(t *message.MessageType) string {
			return string(*t)
		})...))
	}

	if listMeta.Limit > 0 {
		do = do.Limit(int(listMeta.Limit) + 1)
	}

	if listMeta.Cursor > 0 {
		msg, err := m.Where(m.ID.Eq(listMeta.Cursor)).First()
		if err != nil {
			return nil, false, err
		}
		if listMeta.Direction == entity.ScrollPageDirectionPrev {
			do = do.Where(m.CreatedAt.Lt(msg.CreatedAt))
			do = do.Order(m.CreatedAt.Desc())
		} else {
			do = do.Where(m.CreatedAt.Gt(msg.CreatedAt))
			do = do.Order(m.CreatedAt.Asc())
		}
	} else {
		do = do.Order(m.CreatedAt.Desc())
	}

	messageList, err := do.Find()

	var hasMore bool

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, hasMore, nil
	}
	if err != nil {
		return nil, false, err
	}

	if len(messageList) > int(listMeta.Limit) {
		hasMore = true
		messageList = messageList[:int(listMeta.Limit)]
	}

	return dao.batchMessagePO2DO(messageList), hasMore, nil
}

func (dao *MessageDAO) GetByRunIDs(ctx context.Context, runIDs []int64, orderBy string) ([]*entity.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Debug().Where(m.RunID.In(runIDs...)).Where(m.Status.Eq(int32(entity.MessageStatusAvailable)))

	if orderBy == "DESC" {
		do = do.Order(m.CreatedAt.Desc())
	} else {
		do = do.Order(m.CreatedAt.Asc())
	}
	poList, err := do.Find()

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return dao.batchMessagePO2DO(poList), nil
}

func (dao *MessageDAO) Edit(ctx context.Context, msgID int64, msg *message.Message) (int64, error) {
	m := dao.query.Message

	originMsg, err := dao.GetByID(ctx, msgID)
	if originMsg == nil {
		return 0, errorx.New(errno.ErrRecordNotFound)
	}
	if err != nil {
		return 0, err
	}

	columns := dao.buildEditColumns(msg, originMsg)
	do, err := m.WithContext(ctx).Where(m.ID.Eq(msgID)).UpdateColumns(columns)
	if err != nil {
		return 0, err
	}
	if do.RowsAffected == 0 {
		return 0, errorx.New(errno.ErrRecordNotFound)
	}

	return do.RowsAffected, nil
}

func (dao *MessageDAO) buildEditColumns(msg *message.Message, originMsg *entity.Message) map[string]interface{} {
	columns := make(map[string]interface{})
	table := dao.query.Message
	if msg.Content != "" {
		msg.Role = originMsg.Role
		columns[table.Content.ColumnName().String()] = msg.Content
		modelContent, err := dao.buildModelContent(msg)
		if err == nil {
			columns[table.ModelContent.ColumnName().String()] = modelContent
		}
	}
	if msg.MessageType != "" {
		columns[table.MessageType.ColumnName().String()] = msg.MessageType
	}
	if msg.ContentType != "" {
		columns[table.ContentType.ColumnName().String()] = msg.ContentType
	}
	if len(msg.ReasoningContent) > 0 {
		columns[table.ReasoningContent.ColumnName().String()] = msg.ReasoningContent
	}

	if msg.Position > 0 {
		columns[table.BrokenPosition.ColumnName().String()] = msg.Position
	}
	if msg.Status > 0 {
		columns[table.Status.ColumnName().String()] = msg.Status
	}

	if len(msg.ModelContent) > 0 {
		columns[table.ModelContent.ColumnName().String()] = msg.ModelContent
	}

	columns[table.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()
	if msg.Ext != nil {
		if originMsg.Ext != nil {
			for k, v := range originMsg.Ext {
				msg.Ext[k] = v
			}
		}
		ext, err := sonic.MarshalString(msg.Ext)
		if err == nil {
			columns[table.Ext.ColumnName().String()] = ext
		}
	}
	return columns
}

func (dao *MessageDAO) GetByID(ctx context.Context, msgID int64) (*entity.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Where(m.ID.Eq(msgID))
	po, err := do.First()
	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return dao.messagePO2DO(po), nil
}

func (dao *MessageDAO) Delete(ctx context.Context, delMeta *entity.DeleteMeta) error {
	if len(delMeta.MessageIDs) == 0 && len(delMeta.RunIDs) == 0 {
		return nil
	}

	updateColumns := make(map[string]interface{})
	updateColumns["status"] = int32(entity.MessageStatusDeleted)
	m := dao.query.Message
	do := m.WithContext(ctx)

	if len(delMeta.RunIDs) > 0 {
		do = do.Where(m.RunID.In(delMeta.RunIDs...))
	}
	if len(delMeta.MessageIDs) > 0 {
		do = do.Where(m.ID.In(delMeta.MessageIDs...))
	}
	if delMeta.ConversationID != nil && ptr.From(delMeta.ConversationID) > 0 {
		do = do.Where(m.ConversationID.Eq(*delMeta.ConversationID))
	}
	_, err := do.UpdateColumns(&updateColumns)
	return err
}

func (dao *MessageDAO) messageDO2PO(ctx context.Context, msgDo *entity.Message) (*model.Message, error) {
	var id int64
	if msgDo.ID > 0 {
		id = msgDo.ID
	} else {
		genID, gErr := dao.idgen.GenID(ctx)
		if gErr != nil {
			return nil, gErr
		}
		id = genID
	}
	msgPO := &model.Message{
		ID:               id,
		ConversationID:   msgDo.ConversationID,
		RunID:            msgDo.RunID,
		AgentID:          msgDo.AgentID,
		SectionID:        msgDo.SectionID,
		UserID:           msgDo.UserID,
		Role:             string(msgDo.Role),
		ContentType:      string(msgDo.ContentType),
		MessageType:      string(msgDo.MessageType),
		DisplayContent:   msgDo.DisplayContent,
		Content:          msgDo.Content,
		BrokenPosition:   msgDo.Position,
		Status:           int32(entity.MessageStatusAvailable),
		CreatedAt:        time.Now().UnixMilli(),
		UpdatedAt:        time.Now().UnixMilli(),
		ReasoningContent: msgDo.ReasoningContent,
	}
	if msgDo.CreatedAt > 0 {
		msgPO.CreatedAt = msgDo.CreatedAt
	}
	if msgDo.UpdatedAt > 0 {
		msgPO.UpdatedAt = msgDo.UpdatedAt
	}

	if msgDo.ModelContent != "" {
		msgPO.ModelContent = msgDo.ModelContent
	} else {
		mc, err := dao.buildModelContent(msgDo)
		if err != nil {
			return nil, err
		}
		msgPO.ModelContent = mc
	}

	ext, err := json.Marshal(msgDo.Ext)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrConversationJsonMarshal)
	}
	msgPO.Ext = string(ext)

	return msgPO, nil
}

func (dao *MessageDAO) buildModelContent(msgDO *entity.Message) (string, error) {
	modelContent := msgDO.ModelContent
	if modelContent != "" {
		return modelContent, nil
	}

	modelContentObj := &schema.Message{
		Role: msgDO.Role,
		Name: msgDO.Name,
	}
	if msgDO.Content == "" && len(msgDO.MultiContent) == 0 {
		return "", nil
	}

	var multiContent []schema.ChatMessagePart
	for _, contentData := range msgDO.MultiContent {
		if contentData.Type == message.InputTypeText {
			if len(msgDO.Content) == 0 && len(contentData.Text) > 0 {
				msgDO.Content = contentData.Text
			}
			continue
		}
		one := schema.ChatMessagePart{}
		switch contentData.Type {
		case message.InputTypeImage:
			one.Type = schema.ChatMessagePartTypeImageURL
			one.ImageURL = &schema.ChatMessageImageURL{
				URL: contentData.FileData[0].Url,
				URI: contentData.FileData[0].URI,
			}
		case message.InputTypeFile:
			one.Type = schema.ChatMessagePartTypeFileURL
			one.FileURL = &schema.ChatMessageFileURL{
				URL: contentData.FileData[0].Url,
				URI: contentData.FileData[0].URI,
			}
		case message.InputTypeVideo:
			one.Type = schema.ChatMessagePartTypeVideoURL
			one.VideoURL = &schema.ChatMessageVideoURL{
				URL: contentData.FileData[0].Url,
			}
		case message.InputTypeAudio:
			one.Type = schema.ChatMessagePartTypeAudioURL
			one.AudioURL = &schema.ChatMessageAudioURL{
				URL: contentData.FileData[0].Url,
				URI: contentData.FileData[0].URI,
			}
		}
		multiContent = append(multiContent, one)
	}
	if len(multiContent) > 0 {
		if len(msgDO.Content) > 0 {
			multiContent = append(multiContent, schema.ChatMessagePart{
				Type: schema.ChatMessagePartTypeText,
				Text: msgDO.Content,
			})
		}
	} else {
		modelContentObj.Content = msgDO.Content
	}

	modelContentObj.MultiContent = multiContent

	mcObjByte, err := json.Marshal(modelContentObj)
	if err != nil {
		return "", errorx.WrapByCode(err, errno.ErrConversationJsonMarshal)
	}

	return string(mcObjByte), nil
}

func (dao *MessageDAO) batchMessagePO2DO(msgPOs []*model.Message) []*entity.Message {
	return slices.Transform(msgPOs, func(msgPO *model.Message) *entity.Message {
		msgDO := &entity.Message{
			ID:               msgPO.ID,
			AgentID:          msgPO.AgentID,
			ConversationID:   msgPO.ConversationID,
			SectionID:        msgPO.SectionID,
			UserID:           msgPO.UserID,
			RunID:            msgPO.RunID,
			Role:             schema.RoleType(msgPO.Role),
			ContentType:      message.ContentType(msgPO.ContentType),
			MessageType:      message.MessageType(msgPO.MessageType),
			Position:         msgPO.BrokenPosition,
			ModelContent:     msgPO.ModelContent,
			Content:          msgPO.Content,
			Status:           message.MessageStatus(msgPO.Status),
			DisplayContent:   msgPO.DisplayContent,
			CreatedAt:        msgPO.CreatedAt,
			UpdatedAt:        msgPO.UpdatedAt,
			ReasoningContent: msgPO.ReasoningContent,
		}

		var ext map[string]string
		err := json.Unmarshal([]byte(msgPO.Ext), &ext)
		if err == nil {
			msgDO.Ext = ext
		}

		return msgDO
	})
}

func (dao *MessageDAO) messagePO2DO(msgPO *model.Message) *entity.Message {
	msgDO := &entity.Message{
		ID:             msgPO.ID,
		AgentID:        msgPO.AgentID,
		ConversationID: msgPO.ConversationID,
		SectionID:      msgPO.SectionID,
		UserID:         msgPO.UserID,
		RunID:          msgPO.RunID,
		Role:           schema.RoleType(msgPO.Role),
		ContentType:    message.ContentType(msgPO.ContentType),
		MessageType:    message.MessageType(msgPO.MessageType),
		ModelContent:   msgPO.ModelContent,
		Content:        msgPO.Content,
		DisplayContent: msgPO.DisplayContent,
		CreatedAt:      msgPO.CreatedAt,
		UpdatedAt:      msgPO.UpdatedAt,
	}

	var ext map[string]string
	err := json.Unmarshal([]byte(msgPO.Ext), &ext)
	if err == nil {
		msgDO.Ext = ext
	}

	return msgDO
}
