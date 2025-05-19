package entity

type Connector struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
	URI  string `json:"uri"`
	URL  string `json:"url"`
	Desc string `json:"description"`
}
