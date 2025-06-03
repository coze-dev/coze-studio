package dal

type PluginSelectedOption struct {
	PluginID   bool
	OpenapiDoc bool
	Version    bool
}

type ToolSelectedOption struct {
	ToolID          bool
	DebugStatus     bool
	ActivatedStatus bool
}
