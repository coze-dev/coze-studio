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

package model

import (
	"net/http"
	"strconv"

	"github.com/getkin/kin-openapi/openapi3"

	"github.com/coze-dev/coze-studio/backend/api/model/plugin_develop/common"
	"github.com/coze-dev/coze-studio/backend/crossdomain/plugin/consts"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func NewDefaultPluginManifest() *PluginManifest {
	return &PluginManifest{
		SchemaVersion: "v1",
		API: APIDesc{
			Type: consts.PluginTypeOfCloud,
		},
		Auth: &AuthV2{
			Type: consts.AuthzTypeOfNone,
		},
		CommonParams: map[consts.HTTPParamLocation][]*common.CommonParamSchema{
			consts.ParamInBody: {},
			consts.ParamInHeader: {
				{
					Name:  "User-Agent",
					Value: "Coze/1.0",
				},
			},
			consts.ParamInQuery: {},
		},
	}
}

func NewDefaultOpenapiDoc() *Openapi3T {
	return &Openapi3T{
		OpenAPI: "3.0.1",
		Info: &openapi3.Info{
			Version: "v1",
		},
		Paths:   openapi3.Paths{},
		Servers: openapi3.Servers{},
	}
}

func DefaultOpenapi3Responses() openapi3.Responses {
	return openapi3.Responses{
		strconv.Itoa(http.StatusOK): {
			Value: &openapi3.Response{
				Description: ptr.Of("description is required"),
				Content: openapi3.Content{
					consts.MediaTypeJson: &openapi3.MediaType{
						Schema: &openapi3.SchemaRef{
							Value: &openapi3.Schema{
								Type:       openapi3.TypeObject,
								Properties: map[string]*openapi3.SchemaRef{},
							},
						},
					},
				},
			},
		},
	}
}

func DefaultOpenapi3RequestBody() *openapi3.RequestBodyRef {
	return &openapi3.RequestBodyRef{
		Value: &openapi3.RequestBody{
			Content: map[string]*openapi3.MediaType{
				consts.MediaTypeJson: {
					Schema: &openapi3.SchemaRef{
						Value: &openapi3.Schema{
							Type:       openapi3.TypeObject,
							Properties: map[string]*openapi3.SchemaRef{},
						},
					},
				},
			},
		},
	}
}
