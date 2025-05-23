package ocr

import "context"

type OCR interface {
	FromBase64(ctx context.Context, b64 string) (texts []string, err error)
	FromURL(ctx context.Context, url string) (texts []string, err error)
}
