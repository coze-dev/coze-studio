package vo

type WorkFlowAsToolInfo struct {
	ID            int64
	Name          string
	Desc          string
	Icon          string
	PublishStatus PublishStatus
	VersionName   string
	InputParams   []*NamedTypeInfo
}
