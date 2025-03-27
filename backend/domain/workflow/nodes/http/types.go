package http

type Location uint8

const (
	Header         Location = 1
	QueryParameter Location = 2
)

type Body struct {
	ContentType string // application/json | application/x-www-form-urlencoded | multipart/form-data | text/plain | application/octet-stream | none
	Data        []byte
}

type Auth struct {
	Key      string
	Value    string
	Location Location
}

type Request struct {
	URL             string
	Headers         map[string]string
	QueryParameters map[string]string
	Body            *Body
	Auth            *Auth
}

type Response struct {
	Body       string
	StatusCode int
	Headers    string
}
