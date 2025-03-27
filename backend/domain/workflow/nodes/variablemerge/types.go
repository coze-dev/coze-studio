package variablemerge

type Group struct {
	Name   string
	Values []any
}

type MergeRequest struct {
	Groups []Group
}
