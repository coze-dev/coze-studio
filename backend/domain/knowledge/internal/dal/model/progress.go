package model

type SliceStatus int32

const (
	SliceStatusProcessing SliceStatus = 0
	SliceStatusDone       SliceStatus = 1
	SliceStatusFailed     SliceStatus = 2
)

type SliceProgress struct {
	Status    SliceStatus
	StatusMsg string
}
