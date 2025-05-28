package common

import "code.byted.org/flow/opencoze/backend/api/model/crossdomain/conversation"

var (
	SceneByName = map[string]conversation.Scene{
		"Scene.Default":           conversation.SceneDefault,
		"Scene.Explore":           conversation.SceneExplore,
		"Scene.BotStore":          conversation.SceneBotStore,
		"Scene.CozeHome":          conversation.SceneCozeHome,
		"Scene.Playground":        conversation.ScenePlayground,
		"Scene.Evaluation":        conversation.SceneEvaluation,
		"Scene.AgentAPP":          conversation.SceneAgentAPP,
		"Scene.PromptOptimize":    conversation.ScenePromptOptimize,
		"Scene.GenerateAgentInfo": conversation.SceneGenerateAgentInfo,
	}
	SceneByValue = map[conversation.Scene]string{
		conversation.SceneDefault:           "Scene.Default",
		conversation.SceneExplore:           "Scene.Explore",
		conversation.SceneBotStore:          "Scene.BotStore",
		conversation.SceneCozeHome:          "Scene.CozeHome",
		conversation.ScenePlayground:        "Scene.Playground",
		conversation.SceneEvaluation:        "Scene.Evaluation",
		conversation.SceneAgentAPP:          "Scene.AgentAPP",
		conversation.ScenePromptOptimize:    "Scene.PromptOptimize",
		conversation.SceneGenerateAgentInfo: "Scene.GenerateAgentInfo",
	}
)
