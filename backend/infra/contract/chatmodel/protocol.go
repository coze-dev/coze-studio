package chatmodel

import "code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/developer_api"

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

func (p Protocol) TOModelClass() developer_api.ModelClass {
	switch p {
	case ProtocolArk:
		return developer_api.ModelClass_SEED
	case ProtocolOpenAI:
		return developer_api.ModelClass_GPT
	case ProtocolDeepseek:
		return developer_api.ModelClass_DeekSeek
	case ProtocolClaude:
		return developer_api.ModelClass_Claude
	case ProtocolGemini:
		return developer_api.ModelClass_Gemini
	case ProtocolOllama:
		return developer_api.ModelClass_Llama
	case ProtocolQwen:
		return developer_api.ModelClass_QWen
	case ProtocolErnie:
		return developer_api.ModelClass_Ernie
	default:
		return developer_api.ModelClass_Other
	}
}
