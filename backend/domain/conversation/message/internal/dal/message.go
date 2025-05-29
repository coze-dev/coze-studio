package dal

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/entity"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/dal/model"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message/internal/dal/query"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/pkg/errorx"
	"code.byted.org/flow/opencoze/backend/pkg/lang/slices"
	"code.byted.org/flow/opencoze/backend/types/errno"
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

func (dao *MessageDAO) List(ctx context.Context, conversationID int64, userID int64, limit int, cursor int64, direction entity.ScrollPageDirection, messageType *message.MessageType) ([]*entity.Message, bool, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Debug().Where(m.ConversationID.Eq(conversationID)).Where(m.UserID.Eq(userID)).Where(m.Status.Eq(int32(entity.MessageStatusAvailable)))

	if messageType != nil {
		do = do.Where(m.MessageType.Eq(string(*messageType)))
	}

	if limit > 0 {
		do = do.Limit(int(limit) + 1)
	}

	if cursor > 0 {
		if direction == entity.ScrollPageDirectionPrev {
			do = do.Where(m.CreatedAt.Lt(cursor))
		} else {
			do = do.Where(m.CreatedAt.Gt(cursor))
		}
	}

	do = do.Order(m.CreatedAt.Desc())
	messageList, err := do.Find()

	var hasMore bool

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, hasMore, nil
	}
	if err != nil {
		return nil, false, err
	}

	if len(messageList) > limit {
		hasMore = true
		messageList = messageList[:limit]
	}

	return dao.batchMessagePO2DO(messageList), hasMore, nil
}

func (dao *MessageDAO) GetByRunIDs(ctx context.Context, runIDs []int64, orderBy string) ([]*entity.Message, error) {
	m := dao.query.Message
	do := m.WithContext(ctx).Debug().Where(m.RunID.In(runIDs...))
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

func (dao *MessageDAO) Edit(ctx context.Context, msgID int64, columns map[string]interface{}) (int64, error) {
	m := dao.query.Message
	do, err := m.WithContext(ctx).Where(m.ID.Eq(msgID)).UpdateColumns(columns)
	if err != nil {
		return 0, err
	}
	return do.RowsAffected, nil
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

func (dao *MessageDAO) Delete(ctx context.Context, msgIDs []int64, runIDs []int64) error {
	if len(msgIDs) == 0 && len(runIDs) == 0 {
		return nil
	}

	updateColumns := make(map[string]interface{})
	updateColumns["status"] = int32(entity.MessageStatusDeleted)
	m := dao.query.Message
	do := m.WithContext(ctx)

	if len(runIDs) > 0 {
		do = do.Where(m.RunID.In(runIDs...))
	}
	if len(msgIDs) > 0 {
		do = do.Where(m.ID.In(msgIDs...))
	}
	_, err := do.UpdateColumns(&updateColumns)
	return err
}

func (dao *MessageDAO) messageDO2PO(ctx context.Context, msgDo *entity.Message) (*model.Message, error) {
	id, gErr := dao.idgen.GenID(ctx)
	if gErr != nil {
		return nil, gErr
	}
	msgPO := &model.Message{
		ID:             id,
		ConversationID: msgDo.ConversationID,
		RunID:          msgDo.RunID,
		AgentID:        msgDo.AgentID,
		SectionID:      msgDo.SectionID,
		UserID:         msgDo.UserID,
		Role:           string(msgDo.Role),
		ContentType:    string(msgDo.ContentType),
		MessageType:    string(msgDo.MessageType),
		DisplayContent: msgDo.DisplayContent,
		Content:        msgDo.Content,
		BrokenPosition: msgDo.Position,
		Status:         int32(entity.MessageStatusAvailable),
		CreatedAt:      time.Now().UnixMilli(),
		UpdatedAt:      time.Now().UnixMilli(),
	}

	mc, err := dao.buildModelContent(msgDo)
	if err != nil {
		return nil, err
	}
	msgPO.ModelContent = mc

	ext, err := json.Marshal(msgDo.Ext)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrorJsonMarshal)
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
		Role:    msgDO.Role,
		Name:    msgDO.Name,
		Content: msgDO.Content,
	}

	var multiContent []schema.ChatMessagePart
	for _, contentData := range msgDO.MultiContent {
		one := schema.ChatMessagePart{}
		switch contentData.Type {
		case message.InputTypeText:
			one.Type = schema.ChatMessagePartTypeText
			one.Text = contentData.Text
		case message.InputTypeImage:
			one.Type = schema.ChatMessagePartTypeImageURL
			one.ImageURL = &schema.ChatMessageImageURL{
				URL: contentData.FileData[0].Url,
			}
		case message.InputTypeFile:
			one.Type = schema.ChatMessagePartTypeFileURL
			one.FileURL = &schema.ChatMessageFileURL{
				URL: contentData.FileData[0].Url,
			}
		}
		multiContent = append(multiContent, one)
	}

	modelContentObj.MultiContent = multiContent

	mcObjByte, err := json.Marshal(modelContentObj)
	if err != nil {
		return "", errorx.WrapByCode(err, errno.ErrorJsonMarshal)
	}

	return string(mcObjByte), nil
}

func (dao *MessageDAO) batchMessagePO2DO(msgPOs []*model.Message) []*entity.Message {
	return slices.Transform(msgPOs, func(msgPO *model.Message) *entity.Message {
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
			Position:       msgPO.BrokenPosition,
			ModelContent:   msgPO.ModelContent,
			Content:        msgPO.Content,
			Status:         message.MessageStatus(msgPO.Status),
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
