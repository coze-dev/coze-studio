package messages2query

import "code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"

type Option func(o *Options)

type Options struct {
	ChatModel chatmodel.BaseChatModel
}

func WithChatModel(cm chatmodel.BaseChatModel) Option {
	return func(o *Options) {
		o.ChatModel = cm
	}
}
