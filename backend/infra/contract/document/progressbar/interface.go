package progressbar

import "context"

// ProgressBar is the interface for the progress bar.
type ProgressBar interface {
	AddN(n int) error
	ReportError(err error) error
	GetProgress(ctx context.Context) (percent int, remainSec int, errMsg string)
}
