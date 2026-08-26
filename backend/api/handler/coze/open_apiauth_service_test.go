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

package coze

import (
	"context"
	"testing"

	"github.com/coze-dev/coze-studio/backend/api/model/permission/openapiauth"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/stretchr/testify/require"
)

func TestCheckCPATParams(t *testing.T) {
	ctx := context.Background()

	t.Run("valid preset duration", func(t *testing.T) {
		req := &openapiauth.CreatePersonalAccessTokenAndPermissionRequest{
			Name:        "Secret token",
			DurationDay: "30",
		}
		require.NoError(t, checkCPATParams(ctx, req))
	})

	t.Run("valid customize duration with expire", func(t *testing.T) {
		req := &openapiauth.CreatePersonalAccessTokenAndPermissionRequest{
			Name:        "Secret token",
			DurationDay: "customize",
			ExpireAt:    1778889600,
		}
		require.NoError(t, checkCPATParams(ctx, req))
	})

	t.Run("empty name", func(t *testing.T) {
		req := &openapiauth.CreatePersonalAccessTokenAndPermissionRequest{
			Name:        "",
			DurationDay: "30",
		}
		err := checkCPATParams(ctx, req)
		require.Error(t, err)
		var se errorx.StatusError
		require.ErrorAs(t, err, &se)
		require.Contains(t, se.Msg(), "name is required")
	})

	t.Run("empty duration_day", func(t *testing.T) {
		req := &openapiauth.CreatePersonalAccessTokenAndPermissionRequest{
			Name: "Secret token",
		}
		err := checkCPATParams(ctx, req)
		require.Error(t, err)
		var se errorx.StatusError
		require.ErrorAs(t, err, &se)
		require.Contains(t, se.Msg(), "duration_day is required")
	})

	t.Run("customize without expire_at", func(t *testing.T) {
		req := &openapiauth.CreatePersonalAccessTokenAndPermissionRequest{
			Name:        "Secret token",
			DurationDay: "customize",
		}
		err := checkCPATParams(ctx, req)
		require.Error(t, err)
		var se errorx.StatusError
		require.ErrorAs(t, err, &se)
		require.Contains(t, se.Msg(), "expire_at is required")
	})
}
