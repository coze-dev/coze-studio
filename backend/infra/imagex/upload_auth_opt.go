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

package imagex

type UploadAuthOpt func(option *UploadAuthOption)

type UploadAuthOption struct {
	ContentTypeBlackList []string
	ContentTypeWhiteList []string
	FileSizeUpLimit      *string
	FileSizeBottomLimit  *string
	KeyPtn               *string
	UploadOverWrite      *bool
	conditions           map[string]string
	StoreKey             *string
}

func WithStoreKey(key string) UploadAuthOpt {
	return func(o *UploadAuthOption) {
		o.StoreKey = &key
	}
}

func WithUploadKeyPtn(ptn string) UploadAuthOpt {
	return func(o *UploadAuthOption) {
		o.KeyPtn = &ptn
	}
}

func WithUploadOverwrite(overwrite bool) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.UploadOverWrite = &overwrite
	}
}

func WithUploadContentTypeBlackList(blackList []string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.ContentTypeBlackList = blackList
	}
}

func WithUploadContentTypeWhiteList(whiteList []string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.ContentTypeWhiteList = whiteList
	}
}

func WithUploadFileSizeUpLimit(limit string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.FileSizeUpLimit = &limit
	}
}

func WithUploadFileSizeBottomLimit(limit string) UploadAuthOpt {
	return func(op *UploadAuthOption) {
		op.FileSizeBottomLimit = &limit
	}
}
