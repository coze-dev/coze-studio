package nodes

type StructuredCallbackOutput struct {
	Output    map[string]any
	RawOutput map[string]any
	Extra     map[string]any // node specific extra info, will go into node execution's extra.ResponseExtra
}
