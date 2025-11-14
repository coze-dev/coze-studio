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
)

type permissionImpl struct{}

func NewService() Permission {
	return &permissionImpl{}
}

func DefaultSVC() Permission {
	return NewService()
}

func (p *permissionImpl) CheckAuthz(ctx context.Context, req *CheckAuthzData) (*CheckAuthzResult, error) {

	authzChecker := NewAuthzChecker()

	for _, resourceIdentifier := range req.ResourceIdentifier {
		allowed, err := authzChecker.CheckResourcePermission(ctx, &ResourcePermissionRequest{
			ResourceType: resourceIdentifier.Type,
			ResourceIDs:  resourceIdentifier.ID,
			Action:       resourceIdentifier.Action,
			OperatorID:   req.OperatorID,
			IsDraft:      req.IsDraft,
		})
		if err != nil {
			return nil, err
		}

		if !allowed {
			return &CheckAuthzResult{Decision: Deny}, nil
		}
	}

	return &CheckAuthzResult{Decision: Allow}, nil
}
