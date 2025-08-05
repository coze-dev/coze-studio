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

package schema

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/compose"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/entity/vo"
)

// Port type constants
const (
	PortDefault      = "default"
	PortBranchError  = "branch_error"
	PortBranchFormat = "branch_%d"
)

// BranchSchema defines the schema for workflow branches.
type BranchSchema struct {
	From             vo.NodeKey                `json:"from_node"`
	DefaultMapping   map[string]bool           `json:"default_mapping,omitempty"`
	ExceptionMapping map[string]bool           `json:"exception_mapping,omitempty"`
	Mappings         map[int64]map[string]bool `json:"mappings,omitempty"`
}

// BuildBranches builds branch schemas from connections.
func BuildBranches(connections []*Connection) (map[vo.NodeKey]*BranchSchema, error) {
	var branchMap map[vo.NodeKey]*BranchSchema

	for _, conn := range connections {
		if conn.FromPort == nil || len(*conn.FromPort) == 0 {
			continue
		}

		port := *conn.FromPort
		sourceNodeKey := conn.FromNode

		if branchMap == nil {
			branchMap = map[vo.NodeKey]*BranchSchema{}
		}

		// Get or create branch schema for source node
		branch, exists := branchMap[sourceNodeKey]
		if !exists {
			branch = &BranchSchema{
				From: sourceNodeKey,
			}
			branchMap[sourceNodeKey] = branch
		}

		// Classify port type and add to appropriate mapping
		switch {
		case port == PortDefault:
			if branch.DefaultMapping == nil {
				branch.DefaultMapping = map[string]bool{}
			}
			branch.DefaultMapping[string(conn.ToNode)] = true
		case port == PortBranchError:
			if branch.ExceptionMapping == nil {
				branch.ExceptionMapping = map[string]bool{}
			}
			branch.ExceptionMapping[string(conn.ToNode)] = true
		default:
			var branchNum int64
			_, err := fmt.Sscanf(port, PortBranchFormat, &branchNum)
			if err != nil || branchNum < 0 {
				return nil, fmt.Errorf("invalid port format '%s' for connection %+v", port, conn)
			}
			if branch.Mappings == nil {
				branch.Mappings = map[int64]map[string]bool{}
			}
			if _, exists := branch.Mappings[branchNum]; !exists {
				branch.Mappings[branchNum] = make(map[string]bool)
			}
			branch.Mappings[branchNum][string(conn.ToNode)] = true
		}
	}

	return branchMap, nil
}

func (bs *BranchSchema) OnlyException() bool {
	return len(bs.Mappings) == 0 && len(bs.ExceptionMapping) > 0 && len(bs.DefaultMapping) > 0
}

func (bs *BranchSchema) GetExceptionBranch() *compose.GraphBranch {
	condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
		isSuccess, ok := in["isSuccess"]
		if ok && isSuccess != nil && !isSuccess.(bool) {
			return bs.ExceptionMapping, nil
		}

		return bs.DefaultMapping, nil
	}

	// Combine ExceptionMapping and DefaultMapping into a new map
	endNodes := make(map[string]bool)
	for node := range bs.ExceptionMapping {
		endNodes[node] = true
	}
	for node := range bs.DefaultMapping {
		endNodes[node] = true
	}

	return compose.NewGraphMultiBranch(condition, endNodes)
}

func (bs *BranchSchema) GetFullBranch(ctx context.Context, bb BranchBuilder) (*compose.GraphBranch, error) {
	extractor, hasBranch := bb.BuildBranch(ctx)
	if !hasBranch {
		return nil, fmt.Errorf("branch expected but BranchBuilder thinks not. BranchSchema: %v", bs)
	}

	if len(bs.ExceptionMapping) == 0 { // no exception, it's a normal branch
		condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
			index, isDefault, err := extractor(ctx, in)
			if err != nil {
				return nil, err
			}

			if isDefault {
				return bs.DefaultMapping, nil
			}

			if _, ok := bs.Mappings[index]; !ok {
				return nil, fmt.Errorf("chosen index= %d, out of range", index)
			}

			return bs.Mappings[index], nil
		}

		// Combine DefaultMapping and normal mappings into a new map
		endNodes := make(map[string]bool)
		for node := range bs.DefaultMapping {
			endNodes[node] = true
		}
		for _, ms := range bs.Mappings {
			for node := range ms {
				endNodes[node] = true
			}
		}

		return compose.NewGraphMultiBranch(condition, endNodes), nil
	}

	condition := func(ctx context.Context, in map[string]any) (map[string]bool, error) {
		isSuccess, ok := in["isSuccess"]
		if ok && isSuccess != nil && !isSuccess.(bool) {
			return bs.ExceptionMapping, nil
		}

		index, isDefault, err := extractor(ctx, in)
		if err != nil {
			return nil, err
		}

		if isDefault {
			return bs.DefaultMapping, nil
		}

		return bs.Mappings[index], nil
	}

	// Combine ALL mappings into a new map
	endNodes := make(map[string]bool)
	for node := range bs.ExceptionMapping {
		endNodes[node] = true
	}
	for node := range bs.DefaultMapping {
		endNodes[node] = true
	}
	for _, ms := range bs.Mappings {
		for node := range ms {
			endNodes[node] = true
		}
	}

	return compose.NewGraphMultiBranch(condition, endNodes), nil
}
