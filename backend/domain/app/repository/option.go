package repository

import (
	"code.byted.org/flow/opencoze/backend/domain/app/internal/dal"
)

type APPSelectedOptions func(*dal.APPSelectedOption)

func WithAPPID() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.APPID = true
	}
}

func WithAPPPublishAtMS() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.PublishAtMS = true
	}
}

func WithPublishVersion() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.PublishVersion = true
	}
}

func WithPublishRecordID() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.PublishRecordID = true
	}
}

func WithAPPPublishStatus() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.PublishStatus = true
	}
}

func WithPublishRecordExtraInfo() APPSelectedOptions {
	return func(opts *dal.APPSelectedOption) {
		opts.PublishRecordExtraInfo = true
	}
}
