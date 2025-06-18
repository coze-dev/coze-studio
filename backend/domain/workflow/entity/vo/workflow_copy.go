package vo

type CopyWorkflowConfig struct {
	TargetSpaceID *int64
	TargetAppID   *int64
}

type PluginEntity struct {
	PluginID      int64
	PluginVersion *string
}

type DependenceResource struct {
	PluginIDs    []int64
	KnowledgeIDs []int64
	DatabaseIDs  []int64
}

type ExternalResourceRelated struct {
	PluginMap    map[int64]*PluginEntity
	KnowledgeMap map[int64]int64
	DatabaseMap  map[int64]int64
}
