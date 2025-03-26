package common

type Info struct {
	ID          int64
	Name        string
	Description string

	DeveloperID int64
	SpaceID     int64

	CreateTimeMS int64
	UpdateTimeMS int64
	DeleteTimeMS int64
}
