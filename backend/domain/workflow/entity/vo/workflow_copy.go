package vo

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
	PluginMap     map[int64]*PluginEntity
	PluginToolMap map[int64]int64

	KnowledgeMap map[int64]int64
	DatabaseMap  map[int64]int64
}

type CopyWorkflowPolicy struct {
	TargetSpaceID            *int64
	TargetAppID              *int64
	ModifiedCanvasSchema     *string
	ShouldModifyWorkflowName bool
}
