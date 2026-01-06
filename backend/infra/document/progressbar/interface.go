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

package progressbar

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/infra/cache"
)

// ProgressBar is the interface for the progress bar.
type ProgressBar interface {
	AddN(n int) error
	ReportError(err error) error
	GetProgress(ctx context.Context) (percent int, remainSec int, errMsg string)
}

var New func(ctx context.Context, pkID int64, total int64, CacheCli cache.Cmdable, needInit bool) ProgressBar

const (
	ProcessDone = 100
	ProcessInit = 0
)
