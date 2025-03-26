package model

type Protocol string

const (
	ProtocolOpenAI   Protocol = "openai"
	ProtocolClaude   Protocol = "claude"
	ProtocolDeepseek Protocol = "deepseek"
	ProtocolGemini   Protocol = "gemini"
	ProtocolArk      Protocol = "ark"
	ProtocolOllama   Protocol = "ollama"
	ProtocolQwen     Protocol = "qwen"
	ProtocolErnie    Protocol = "ernie"
)
