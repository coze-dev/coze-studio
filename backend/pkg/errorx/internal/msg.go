package internal

import (
	"fmt"
)

type withMessage struct {
	cause error
	msg   string
}

func (w *withMessage) Unwrap() error {
	return w.cause
}

func (w *withMessage) Error() string {
	return fmt.Sprintf("%s\ncause=%s", w.msg, w.cause.Error())
}

func wrapf(err error, format string, args ...interface{}) error {
	if err == nil {
		return nil
	}
	err = &withMessage{
		cause: err,
		msg:   fmt.Sprintf(format, args...),
	}

	return err
}

func Wrapf(err error, format string, args ...interface{}) error {
	return withStackTraceIfNotExists(wrapf(err, format, args...))
}
