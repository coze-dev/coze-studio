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

package openapiauth

import (
	"bytes"
	"testing"

	"github.com/cloudwego/hertz/pkg/common/ut"
	"github.com/stretchr/testify/require"
)

func TestBindRequiredNameMissing(t *testing.T) {
	// This is the root cause of #2685: Hertz enforces json:"name,required"
	// and rejects a body that has no "name" key with 400.
	body := `{"duration_day":"30","expire_at":1778889600}`
	ctx := ut.CreateUtRequestContext("POST", "/x", &ut.Body{Body: bytes.NewBufferString(body), Len: len(body)},
		ut.Header{Key: "Content-Type", Value: "application/json"})

	var req CreatePersonalAccessTokenAndPermissionRequest
	err := ctx.BindAndValidate(&req)
	require.Error(t, err)
	require.Contains(t, err.Error(), "required")
}

func TestBindCreateWithoutExpireAt(t *testing.T) {
	// frontend sends only name + duration_day when duration != customize
	body := `{"name":"Secret token","duration_day":"30"}`
	ctx := ut.CreateUtRequestContext("POST", "/x", &ut.Body{Body: bytes.NewBufferString(body), Len: len(body)},
		ut.Header{Key: "Content-Type", Value: "application/json"})

	var req CreatePersonalAccessTokenAndPermissionRequest
	err := ctx.BindAndValidate(&req)
	require.NoError(t, err)
	require.Equal(t, "Secret token", req.Name)
	require.Equal(t, "30", req.DurationDay)
}

func TestBindCreateNameEmptyString(t *testing.T) {
	// empty-string name binds fine; it is the handler's checkCPATParams that rejects it
	body := `{"name":"","duration_day":"30"}`
	ctx := ut.CreateUtRequestContext("POST", "/x", &ut.Body{Body: bytes.NewBufferString(body), Len: len(body)},
		ut.Header{Key: "Content-Type", Value: "application/json"})

	var req CreatePersonalAccessTokenAndPermissionRequest
	err := ctx.BindAndValidate(&req)
	require.NoError(t, err, "empty string name should bind (field present)")
	require.Equal(t, "", req.Name)
}
