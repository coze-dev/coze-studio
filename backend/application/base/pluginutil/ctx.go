package pluginutil

import (
	"context"
	"github.com/coze-dev/coze-studio/backend/domain/plugin/entity"
)

func SetExtHeader(ctx context.Context, logId, userId string, botId, conversationId int64) context.Context {
	return context.WithValue(ctx, "extendHeader", entity.PluginExtHeader{
		LogId:          logId,
		UserId:         userId,
		BotId:          botId,
		ConversationId: conversationId,
	})
}

func GetExtHeader(ctx context.Context) entity.PluginExtHeader {
	return ctx.Value("extendHeader").(entity.PluginExtHeader)
}
