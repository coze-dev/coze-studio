/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package repository

import (
	"github.com/coze-dev/coze-studio/backend/domain/app/internal/dal"
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
