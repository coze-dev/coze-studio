package entity

type ScrollPageDirection string

const (
	ScrollPageDirectionPrev ScrollPageDirection = "up"
	ScrollPageDirectionNext ScrollPageDirection = "down"
)

type MessageStatus int32

const (
	MessageStatusAvailable MessageStatus = 1
	MessageStatusDeleted   MessageStatus = 2
	MessageStatusBroken    MessageStatus = 4
)
