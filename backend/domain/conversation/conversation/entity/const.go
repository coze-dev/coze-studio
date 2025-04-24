package entity

type ConversationStatus int32

const (
	ConversationStatusNormal  ConversationStatus = 1
	ConversationStatusDeleted ConversationStatus = 2
)
