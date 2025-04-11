package entity

type Model struct {
	ID          int64
	Name        string
	Description string

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Meta     ModelMeta
	Scenario Scenario
}
