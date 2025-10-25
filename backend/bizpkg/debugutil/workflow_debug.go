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

package debugutil

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func GetWorkflowDebugURL(ctx context.Context, workflowID, spaceID, executeID int64) string {
	defaultURL := fmt.Sprintf("http://127.0.0.1:8888/work_flow?execute_id=%d&space_id=%d&workflow_id=%d&execute_mode=2", executeID, spaceID, workflowID)

	serverHost, err := config.Base().GetServerHost(ctx)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetWorkflowDebugURL] get base config failed, use default debug url instead, err: %v", err)
		return defaultURL
	}

	workFlowURL, err := url.JoinPath(serverHost, "work_flow")
	if err != nil {
		logs.CtxErrorf(ctx, "[GetWorkflowDebugURL] join path failed, use default debug url instead, err: %v", err)
		return defaultURL
	}

	u, err := url.Parse(workFlowURL)
	if err != nil {
		logs.CtxErrorf(ctx, "[GetWorkflowDebugURL] parse workflow url failed, use default debug url instead, err: %v", err)
		return defaultURL
	}

	q := u.Query()
	q.Set("execute_id", strconv.FormatInt(executeID, 10))
	q.Set("space_id", strconv.FormatInt(spaceID, 10))
	q.Set("workflow_id", strconv.FormatInt(workflowID, 10))
	q.Set("execute_mode", "2")
	u.RawQuery = q.Encode()

	return u.String()
}
