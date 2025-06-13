package dal

type PluginSelectedOption struct {
	PluginID   bool
	OpenapiDoc bool
	Version    bool
}

type ToolSelectedOption struct {
	ToolID          bool
	ToolMethod      bool
	ToolSubURL      bool
	DebugStatus     bool
	ActivatedStatus bool
}
