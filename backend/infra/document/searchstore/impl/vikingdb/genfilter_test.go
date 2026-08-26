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

package vikingdb

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/components/retriever"
	"github.com/stretchr/testify/require"
	"github.com/volcengine/volc-sdk-golang/service/vikingdb"

	"github.com/coze-dev/coze-studio/backend/infra/document/searchstore"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func vkStoreWithPartition() *vkSearchStore {
	return &vkSearchStore{
		collection: &vikingdb.Collection{
			Fields: []vikingdb.Field{
				{FieldName: "tenant", FieldType: vikingdb.String},
			},
		},
	}
}

func TestGenFilterPartitionWithExistingFilter(t *testing.T) {
	v := vkStoreWithPartition()
	ctx := context.Background()

	// A pre-existing DSL filter (e.g. a field equality constraint).
	co := &retriever.Options{
		DSLInfo: map[string]any{
			"dsl": &searchstore.DSL{Op: searchstore.OpEq, Field: "status", Value: "active"},
		},
	}
	ro := &searchstore.RetrieverOptions{
		PartitionKey: ptr.Of("tenant"),
		Partitions:   []string{"acme"},
	}

	filter, err := v.genFilter(ctx, co, ro)
	require.NoError(t, err)
	require.NotNil(t, filter)

	// The partition condition must be merged with the DSL filter, not drop it.
	require.Equal(t, "and", filter["op"])
	conds, ok := filter["conds"].([]map[string]any)
	require.True(t, ok, "conds should be a list of filter nodes")
	require.Len(t, conds, 2, "both the DSL filter and the partition condition must be present")
}

func TestGenFilterPartitionOnly(t *testing.T) {
	v := vkStoreWithPartition()
	ctx := context.Background()

	// No DSL filter; the partition condition alone should be the filter.
	ro := &searchstore.RetrieverOptions{
		PartitionKey: ptr.Of("tenant"),
		Partitions:   []string{"acme"},
	}

	filter, err := v.genFilter(ctx, &retriever.Options{}, ro)
	require.NoError(t, err)
	require.NotNil(t, filter)
	require.Equal(t, "must", filter["op"])
	require.Equal(t, "tenant", filter["field"])
	require.Len(t, filter["conds"], 1, "conds should contain the single partition value")
}
