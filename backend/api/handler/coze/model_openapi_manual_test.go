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
	"net/http"
	"testing"

	"github.com/bytedance/mockey"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	appmodelmgr "github.com/coze-dev/coze-studio/backend/application/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/sonic"
)

func TestOpenAPIGetModelList(t *testing.T) {
	mockey.PatchConvey("test openapi get model list", t, func() {
		defer mockey.Mock((*appmodelmgr.ModelmgrApplicationService).GetModelList).To(
			func(ctx context.Context, req *developer_api.GetTypeListRequest) (*developer_api.GetTypeListResponse, error) {
				require.True(t, req.GetModel())
				require.Equal(t, "123", req.GetSpaceID())

				return &developer_api.GetTypeListResponse{
					Code: 0,
					Msg:  "success",
					Data: &developer_api.GetTypeListData{
						ModelList: []*developer_api.Model{
							{
								Name:       "DeepSeek V4 Flash",
								ModelType:  61030,
								ModelName:  "deepseek-v4-flash",
								IsOffline:  false,
								ModelClass: developer_api.ModelClass_DeekSeek,
							},
						},
					},
				}, nil
			},
		).Build().UnPatch()

		h := server.Default()
		defer func() {
			_ = h.Close()
		}()
		h.GET("/v1/models", OpenAPIGetModelList)

		w := ut.PerformRequest(h.Engine, http.MethodGet, "/v1/models?model=true&space_id=123", nil)
		res := w.Result()
		require.Equal(t, http.StatusOK, res.StatusCode())

		var resp developer_api.GetTypeListResponse
		require.NoError(t, sonic.Unmarshal(res.Body(), &resp))
		require.NotNil(t, resp.Data)
		require.Len(t, resp.Data.ModelList, 1)
		assert.Equal(t, int64(0), resp.Code)
		assert.Equal(t, "success", resp.Msg)
		assert.Equal(t, int64(61030), resp.Data.ModelList[0].ModelType)
		assert.Equal(t, "DeepSeek V4 Flash", resp.Data.ModelList[0].Name)
	})
}
