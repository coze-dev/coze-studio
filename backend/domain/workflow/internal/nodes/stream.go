package nodes

var KeyIsFinished = "\x1FKey is finished\x1F"

type Mode string

const (
	Streaming    Mode = "streaming"
	NonStreaming Mode = "non-streaming"
)
