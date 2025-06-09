package imageunderstand

import "context"

type ImageUnderstand interface {
	ImageUnderstand(ctx context.Context, image []byte) (content string, err error)
}
