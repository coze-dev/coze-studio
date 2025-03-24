package entity

type Hook struct {
	PreAgentJumpHook  []*HookItem
	PostAgentJumpHook []*HookItem
	FlowHook          []*HookItem
	AtomicHook        []*HookItem
	LLMCallHook       []*HookItem
	ResultParsingHook []*HookItem
	SuggestionHook    []*HookItem
}

type HookItem struct {
	URI         *string
	FilterRules []string
	StrongDep   *bool
	TimeoutMs   *int64
}
