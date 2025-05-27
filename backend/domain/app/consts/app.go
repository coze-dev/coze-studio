package consts

type PublishStatus int

const (
	PublishStatusOfProcessing PublishStatus = 1
	PublishStatusOfSuccess    PublishStatus = 2
	PublishStatusOfFailed     PublishStatus = 3
)
