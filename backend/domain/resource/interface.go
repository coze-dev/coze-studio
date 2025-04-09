package resource

// Resource 资源库管理
type Resource interface {
	// List 含 filter 拉取列表
	List()
	// Sync 资源提供方同步信息到 resource
	Sync()
}
