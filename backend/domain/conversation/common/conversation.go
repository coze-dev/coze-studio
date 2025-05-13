package common

type Scene int32

const (
	SceneDefault           Scene = 0
	SceneExplore           Scene = 1
	SceneBotStore          Scene = 2
	SceneCozeHome          Scene = 3
	ScenePlayground        Scene = 4
	SceneEvaluation        Scene = 5
	SceneAgentAPP          Scene = 6
	ScenePromptOptimize    Scene = 7
	SceneGenerateAgentInfo Scene = 8
)

var (
	SceneByName = map[string]Scene{
		"Scene.Default":           SceneDefault,
		"Scene.Explore":           SceneExplore,
		"Scene.BotStore":          SceneBotStore,
		"Scene.CozeHome":          SceneCozeHome,
		"Scene.Playground":        ScenePlayground,
		"Scene.Evaluation":        SceneEvaluation,
		"Scene.AgentAPP":          SceneAgentAPP,
		"Scene.PromptOptimize":    ScenePromptOptimize,
		"Scene.GenerateAgentInfo": SceneGenerateAgentInfo,
	}
	SceneByValue = map[Scene]string{
		SceneDefault:           "Scene.Default",
		SceneExplore:           "Scene.Explore",
		SceneBotStore:          "Scene.BotStore",
		SceneCozeHome:          "Scene.CozeHome",
		ScenePlayground:        "Scene.Playground",
		SceneEvaluation:        "Scene.Evaluation",
		SceneAgentAPP:          "Scene.AgentAPP",
		ScenePromptOptimize:    "Scene.PromptOptimize",
		SceneGenerateAgentInfo: "Scene.GenerateAgentInfo",
	}
)
