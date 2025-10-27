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

package permission

import (
	"context"
	"fmt"
)

type ResourcePermissionRequest struct {
	ResourceType ResourceType
	ResourceIDs  []int64
	Action       Action
	OperatorID   int64
	IsDraft      *bool
}

type ResourceInfo struct {
	ID        int64
	CreatorID int64
	SpaceID   *int64
}

type ResourceQueryer interface {
	QueryResourceInfo(ctx context.Context, resourceIDs []int64, isDraft *bool) ([]*ResourceInfo, error)

	GetResourceType() ResourceType
}

type AuthzChecker struct {
	resourceQueryers map[ResourceType]ResourceQueryer
}

func NewAuthzChecker() *AuthzChecker {
	checker := &AuthzChecker{
		resourceQueryers: make(map[ResourceType]ResourceQueryer),
	}

	checker.registerResourceQueryers()

	return checker
}

func (c *AuthzChecker) registerResourceQueryers() {

	c.resourceQueryers[ResourceTypeWorkspace] = NewWorkspaceResourceQueryer()
	
	c.resourceQueryers[ResourceTypeAgent] = NewAgentResourceQueryer()

	c.resourceQueryers[ResourceTypePlugin] = NewPluginResourceQueryer()

	c.resourceQueryers[ResourceTypeWorkflow] = NewWorkflowResourceQueryer()

	c.resourceQueryers[ResourceTypeKnowledge] = NewKnowledgeResourceQueryer()
	c.resourceQueryers[ResourceTypeKnowledgeSlice] = NewKnowledgeSliceResourceQueryer()
	c.resourceQueryers[ResourceTypeKnowledgeDocument] = NewKnowledgeDocumentResourceQueryer()

	c.resourceQueryers[ResourceTypeDatabase] = NewDatabaseResourceQueryer()

	c.resourceQueryers[ResourceTypeApp] = NewAppResourceQueryer()

}

func (c *AuthzChecker) CheckResourcePermission(ctx context.Context, req *ResourcePermissionRequest) (bool, error) {

	queryeer, exists := c.resourceQueryers[req.ResourceType]
	if !exists {
		return false, fmt.Errorf("unsupported resource type: %d", req.ResourceType)
	}

	resourceInfos, err := queryeer.QueryResourceInfo(ctx, req.ResourceIDs, req.IsDraft)
	if err != nil {
		return false, fmt.Errorf("failed to query resource info: %w", err)
	}

	for _, resourceInfo := range resourceInfos {
		allowed := c.checkSingleResourcePermission(req.OperatorID, resourceInfo, req.Action)
		if !allowed {
			return false, nil
		}
	}

	return true, nil
}

func (c *AuthzChecker) checkSingleResourcePermission(operatorID int64, resourceInfo *ResourceInfo, action Action) bool {

	if operatorID == resourceInfo.CreatorID {
		return true
	}

	switch action {
	case ActionRead:
		return c.checkReadPermission(operatorID, resourceInfo)
	case ActionWrite:
		return c.checkWritePermission(operatorID, resourceInfo)
	default:
		return false
	}
}

func (c *AuthzChecker) checkReadPermission(operatorID int64, resourceInfo *ResourceInfo) bool {

	return operatorID == resourceInfo.CreatorID
}

func (c *AuthzChecker) checkWritePermission(operatorID int64, resourceInfo *ResourceInfo) bool {

	return operatorID == resourceInfo.CreatorID
}
