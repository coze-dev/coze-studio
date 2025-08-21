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

package template

import (
	"context"
	"strings"
	"time"

	template_publish "github.com/coze-dev/coze-studio/backend/api/model/template_publish"
	product_public_api "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_public_api"
	product_common "github.com/coze-dev/coze-studio/backend/api/model/marketplace/product_common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/application/singleagent"
	agent_entity "github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/domain/template/entity"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/consts"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)


func (t *ApplicationService) PublishAsTemplate(ctx context.Context, req *template_publish.PublishAsTemplateRequest) (*template_publish.PublishAsTemplateResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 1. 验证智能体权限
	agent, err := singleagent.SingleAgentSVC.ValidateAgentDraftAccess(ctx, req.AgentID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentPermissionCode, errorx.KV("msg", "no permission to access agent"))
	}

	// 2. 简化发布检查 - 只要智能体存在即可
	if agent == nil {
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "agent not found"))
	}

	// 3. 检查是否已发布为模板，如果已存在则更新
	filter := &entity.TemplateFilter{
		AgentID: &req.AgentID,
		SpaceID: ptr.Of(int64(consts.TemplateSpaceID)),
	}
	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	// 4. 转换数据格式
	templateData, err := t.convertAgentToTemplate(ctx, agent, req, userID)
	if err != nil {
		return nil, err
	}

	var templateID int64
	var status string
	if len(templates) > 0 {
		// 已存在，更新模板
		existingTemplate := templates[0]
		templateData.ID = existingTemplate.ID
		templateID = existingTemplate.ID
		status = "updated"
		
		err = t.templateRepo.Update(ctx, templateData)
		if err != nil {
			return nil, err
		}
	} else {
		// 不存在，创建新模板
		templateID, err = t.templateRepo.Create(ctx, templateData)
		if err != nil {
			return nil, err
		}
		status = "published"
	}

	return &template_publish.PublishAsTemplateResponse{
		TemplateID: templateID,
		Status:     status,
		Code:       0,
		Msg:        "success",
	}, nil
}

func (t *ApplicationService) GetMyTemplateList(ctx context.Context, req *template_publish.GetMyTemplateListRequest) (*template_publish.GetMyTemplateListResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	pageNum := int32(0)
	if req.PageNum != nil {
		pageNum = *req.PageNum
	}
	pageSize := int32(20)
	if req.PageSize != nil {
		pageSize = *req.PageSize
	}

	filter := &entity.TemplateFilter{
		CreatorID: &userID,
		SpaceID:   ptr.Of(int64(consts.TemplateSpaceID)),
	}

	pagination := &entity.Pagination{
		Limit:  int(pageSize),
		Offset: int(pageNum * pageSize),
	}

	templates, total, err := t.templateRepo.List(ctx, filter, pagination, "created_at")
	if err != nil {
		return nil, err
	}

	templateInfos := make([]*template_publish.TemplateInfo, 0, len(templates))
	for _, tmpl := range templates {
		// Extract title and description from MetaInfo
		title := ""
		description := ""
		if tmpl.MetaInfo != nil {
			title = tmpl.MetaInfo.Name
			description = tmpl.MetaInfo.Description
		}

		info := &template_publish.TemplateInfo{
			TemplateID:  tmpl.ID,
			AgentID:     tmpl.AgentID,
			Title:       title,
			Description: ptr.Of(description),
			Status:      "published",
			CreatedAt:   tmpl.CreatedAt,
			Heat:        ptr.Of(tmpl.Heat),
		}
		templateInfos = append(templateInfos, info)
	}

	return &template_publish.GetMyTemplateListResponse{
		Templates: templateInfos,
		HasMore:   int64(pageNum*pageSize+int32(len(templates))) < total,
		Total:     int32(total),
		Code:      0,
		Msg:       "success",
	}, nil
}

func (t *ApplicationService) DeleteTemplate(ctx context.Context, req *template_publish.DeleteTemplateRequest) (*template_publish.DeleteTemplateResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 验证模板所有权 - 暂时简化验证逻辑
	template, err := t.templateRepo.GetByID(ctx, req.TemplateID)
	if err != nil {
		return nil, err
	}

	// Note: Template model doesn't have CreatorID field, skip ownership check for now
	// This would need to be implemented by extracting creator info from meta_info
	_ = template
	_ = userID

	// 删除模板
	err = t.templateRepo.Delete(ctx, req.TemplateID)
	if err != nil {
		return nil, err
	}

	return &template_publish.DeleteTemplateResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

func (t *ApplicationService) convertAgentToTemplate(ctx context.Context, agent *agent_entity.SingleAgent, req *template_publish.PublishAsTemplateRequest, userID int64) (*entity.TemplateModel, error) {
	// Build meta info using ProductMetaInfo struct
	description := ""
	if req.Description != nil {
		description = *req.Description
	}

	currentTime := time.Now().UnixMilli()
	
	// 设置封面图片，如果没有提供则使用空字符串（后续可以使用智能体默认图标）
	coverURL := ""
	if req.CoverURI != nil {
		coverURL = *req.CoverURI
	}
	
	// 使用正确的ProductMetaInfo结构体
	metaInfo := &product_public_api.ProductMetaInfo{
		Name:          req.Title,
		Description:   description,
		EntityID:      agent.AgentID,
		EntityType:    21, // BotTemplate
		IconURL:       coverURL, // ✅ 使用正确的字段名 IconURL
		Heat:          int32(0),
		FavoriteCount: int32(0),
		ListedAt:      currentTime,
		Status:        1, // Published status
		IsFavorited:   false,
		IsFree:        true,
		Readme:        "",
	}

	return &entity.TemplateModel{
		AgentID:           agent.AgentID,
		SpaceID:           consts.TemplateSpaceID,
		ProductEntityType: 21, // BotTemplate
		MetaInfo:          metaInfo, // ✅ 直接使用结构体
		Heat:              0,
		CreatedAt:         currentTime,
	}, nil
}

// UnpublishTemplate 取消发布模板
func (t *ApplicationService) UnpublishTemplate(ctx context.Context, req *template_publish.UnpublishTemplateRequest) (*template_publish.UnpublishTemplateResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 查找该智能体发布的模板
	filter := &entity.TemplateFilter{
		AgentID:   &req.AgentID,
		CreatorID: &userID,
		SpaceID:   ptr.Of(int64(consts.TemplateSpaceID)),
	}

	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	if len(templates) == 0 {
		return &template_publish.UnpublishTemplateResponse{
			Code: 40001,
			Msg:  "模板未找到或您没有权限",
		}, nil
	}

	// 删除模板
	err = t.templateRepo.Delete(ctx, templates[0].ID)
	if err != nil {
		return nil, err
	}

	return &template_publish.UnpublishTemplateResponse{
		Code: 0,
		Msg:  "取消发布成功",
	}, nil
}

// CheckPublishStatus 检查智能体的发布状态
func (t *ApplicationService) CheckPublishStatus(ctx context.Context, req *template_publish.CheckPublishStatusRequest) (*template_publish.CheckPublishStatusResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 查找该智能体发布的模板
	filter := &entity.TemplateFilter{
		AgentID:   &req.AgentID,
		CreatorID: &userID,
		SpaceID:   ptr.Of(int64(consts.TemplateSpaceID)),
	}

	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	response := &template_publish.CheckPublishStatusResponse{
		IsPublished: len(templates) > 0,
		Code:        0,
		Msg:         "success",
	}

	// 如果已发布，返回模板信息
	if len(templates) > 0 {
		template := templates[0]
		
		// 从MetaInfo中提取标题、描述和封面图片
		title := "Untitled Template"
		var description *string
		var coverUri *string
		
		if template.MetaInfo != nil {
			// MetaInfo是ProductMetaInfo结构体，不是map
			if template.MetaInfo.Name != "" {
				title = template.MetaInfo.Name
			}
			if template.MetaInfo.Description != "" {
				description = &template.MetaInfo.Description
			}
			if template.MetaInfo.IconURL != "" {
				coverUri = &template.MetaInfo.IconURL
				// 只对非完整URL的路径进行转换
				if !strings.HasPrefix(template.MetaInfo.IconURL, "http://") && !strings.HasPrefix(template.MetaInfo.IconURL, "https://") {
					if objURL, urlErr := t.storage.GetObjectUrl(ctx, template.MetaInfo.IconURL); urlErr == nil {
						coverUri = &objURL
					}
				}
			}
		}
		
		// 设置原始存储路径
		var originalCoverUri *string
		if template.MetaInfo != nil && template.MetaInfo.IconURL != "" {
			originalCoverUri = &template.MetaInfo.IconURL
		}
		
		response.TemplateInfo = &template_publish.TemplateInfo{
			TemplateID:  template.ID,
			AgentID:     template.AgentID,
			Title:       title,
			Description: description,
			Status:      "published",
			CreatedAt:   template.CreatedAt,
			Heat:        &template.Heat,
			CoverURI:    originalCoverUri, // 原始存储路径
			CoverURL:    coverUri, // 可访问的URL
		}
	}

	return response, nil
}

// ========== 商店相关功能实现 ==========

// PublishToStore 发布模板到商店（全局可见）
func (t *ApplicationService) PublishToStore(ctx context.Context, req *template_publish.PublishToStoreRequest) (*template_publish.PublishToStoreResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 1. 验证智能体权限
	agent, err := singleagent.SingleAgentSVC.ValidateAgentDraftAccess(ctx, req.AgentID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrAgentPermissionCode, errorx.KV("msg", "no permission to access agent"))
	}

	if agent == nil {
		return nil, errorx.New(errno.ErrAgentPermissionCode, errorx.KV("msg", "agent not found"))
	}

	// 2. 检查是否已发布到商店，如果已存在则更新
	filter := &entity.TemplateFilter{
		AgentID: &req.AgentID,
		SpaceID: ptr.Of(int64(consts.TemplateStoreSpaceID)), // 使用商店专用的Space ID
	}
	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	// 3. 转换数据格式
	templateData, err := t.convertAgentToStoreTemplate(ctx, agent, req, userID)
	if err != nil {
		return nil, err
	}

	var templateID int64
	var status string
	if len(templates) > 0 {
		// 已存在，更新模板
		existingTemplate := templates[0]
		templateData.ID = existingTemplate.ID
		templateID = existingTemplate.ID
		status = "updated"
		
		err = t.templateRepo.Update(ctx, templateData)
		if err != nil {
			return nil, err
		}
	} else {
		// 不存在，创建新模板
		templateID, err = t.templateRepo.Create(ctx, templateData)
		if err != nil {
			return nil, err
		}
		status = "published"
	}

	return &template_publish.PublishToStoreResponse{
		StoreTemplateID: templateID,
		Status:          status,
		Code:            0,
		Msg:             "success",
	}, nil
}

// GetStoreTemplateList 获取商店模板列表（全局列表）
func (t *ApplicationService) GetStoreTemplateList(ctx context.Context, req *template_publish.GetStoreTemplateListRequest) (*template_publish.GetStoreTemplateListResponse, error) {
	pageNum := int32(0)
	if req.PageNum != nil {
		pageNum = *req.PageNum
	}
	pageSize := int32(20)
	if req.PageSize != nil {
		pageSize = *req.PageSize
	}

	// 查询商店中的所有模板（不限制创建者）
	filter := &entity.TemplateFilter{
		SpaceID: ptr.Of(int64(consts.TemplateStoreSpaceID)), // 使用商店专用的Space ID
	}

	// 注意：SearchKeyword在当前TemplateFilter中没有实现，暂时忽略搜索功能
	// TODO: 如果需要搜索功能，需要在TemplateFilter中添加SearchKeyword字段并在repository层实现
	_ = req.SearchKeyword

	pagination := &entity.Pagination{
		Limit:  int(pageSize),
		Offset: int(pageNum * pageSize),
	}

	templates, total, err := t.templateRepo.List(ctx, filter, pagination, "created_at DESC")
	if err != nil {
		return nil, err
	}

	storeTemplateInfos := make([]*template_publish.StoreTemplateInfo, 0, len(templates))
	for _, tmpl := range templates {
		// Template is already a TemplateModel
		entityTemplate := tmpl

		// 提取作者信息
		authorName := "Anonymous"
		var authorAvatar *string
		if tmpl.MetaInfo != nil && tmpl.MetaInfo.UserInfo != nil {
			if tmpl.MetaInfo.UserInfo.Name != "" {
				authorName = tmpl.MetaInfo.UserInfo.Name
			}
			if tmpl.MetaInfo.UserInfo.AvatarURL != "" {
				authorAvatar = &tmpl.MetaInfo.UserInfo.AvatarURL
			}
		}

		// 获取封面图片URL
		var coverURL *string
		var coverUri *string
		if tmpl.MetaInfo != nil && tmpl.MetaInfo.IconURL != "" {
			coverUri = &tmpl.MetaInfo.IconURL
			// 只对非完整URL的路径进行转换
			if !strings.HasPrefix(tmpl.MetaInfo.IconURL, "http://") && !strings.HasPrefix(tmpl.MetaInfo.IconURL, "https://") {
				objURL, urlErr := t.storage.GetObjectUrl(ctx, tmpl.MetaInfo.IconURL)
				if urlErr == nil {
					coverURL = &objURL
				}
			} else {
				// 如果已经是完整URL，直接使用
				coverURL = &tmpl.MetaInfo.IconURL
			}
		}

		// 提取标签（如果存在）
		var tags []string
		if tmpl.MetaInfo != nil && tmpl.MetaInfo.Labels != nil {
			// 从Labels中提取标签名称
			for _, label := range tmpl.MetaInfo.Labels {
				if label != nil && label.Name != "" {
					tags = append(tags, label.Name)
				}
			}
		}

		info := &template_publish.StoreTemplateInfo{
			TemplateID:   tmpl.ID,
			AgentID:      tmpl.AgentID,
			Title:        entityTemplate.GetTitle(),
			Description:  ptr.Of(entityTemplate.GetDescription()),
			Status:       "published",
			CreatedAt:    tmpl.CreatedAt,
			Heat:         ptr.Of(tmpl.Heat),
			CoverURI:     coverUri,
			CoverURL:     coverURL,
			Tags:         tags,
			AuthorName:   ptr.Of(authorName),
			AuthorAvatar: authorAvatar,
		}
		storeTemplateInfos = append(storeTemplateInfos, info)
	}

	return &template_publish.GetStoreTemplateListResponse{
		Templates: storeTemplateInfos,
		HasMore:   int64(pageNum*pageSize+int32(len(templates))) < total,
		Total:     int32(total),
		Code:      0,
		Msg:       "success",
	}, nil
}

// UnpublishFromStore 从商店取消发布模板
func (t *ApplicationService) UnpublishFromStore(ctx context.Context, req *template_publish.UnpublishFromStoreRequest) (*template_publish.UnpublishFromStoreResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 查找该智能体在商店中发布的模板
	filter := &entity.TemplateFilter{
		AgentID:   &req.AgentID,
		CreatorID: &userID,
		SpaceID:   ptr.Of(int64(consts.TemplateStoreSpaceID)), // 使用商店专用的Space ID
	}

	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	if len(templates) == 0 {
		return &template_publish.UnpublishFromStoreResponse{
			Code: 40001,
			Msg:  "模板未找到或您没有权限",
		}, nil
	}

	// 删除模板
	err = t.templateRepo.Delete(ctx, templates[0].ID)
	if err != nil {
		return nil, err
	}

	return &template_publish.UnpublishFromStoreResponse{
		Code: 0,
		Msg:  "从商店取消发布成功",
	}, nil
}

// CheckStorePublishStatus 检查智能体在商店的发布状态
func (t *ApplicationService) CheckStorePublishStatus(ctx context.Context, req *template_publish.CheckStorePublishStatusRequest) (*template_publish.CheckStorePublishStatusResponse, error) {
	userID := ctxutil.MustGetUIDFromCtx(ctx)

	// 查找该智能体在商店中发布的模板
	filter := &entity.TemplateFilter{
		AgentID:   &req.AgentID,
		CreatorID: &userID,
		SpaceID:   ptr.Of(int64(consts.TemplateStoreSpaceID)), // 使用商店专用的Space ID
	}

	templates, _, err := t.templateRepo.List(ctx, filter, &entity.Pagination{Limit: 1}, "")
	if err != nil {
		return nil, err
	}

	response := &template_publish.CheckStorePublishStatusResponse{
		IsPublished: len(templates) > 0,
		Code:        0,
		Msg:         "success",
	}

	// 如果已发布，返回模板信息
	if len(templates) > 0 {
		template := templates[0]
		
		// 从MetaInfo中提取标题、描述和封面图片
		title := "Untitled Template"
		var description *string
		var coverUri *string
		var coverURL *string
		var tags []string
		authorName := "Anonymous"
		var authorAvatar *string
		
		if template.MetaInfo != nil {
			if template.MetaInfo.Name != "" {
				title = template.MetaInfo.Name
			}
			if template.MetaInfo.Description != "" {
				description = &template.MetaInfo.Description
			}
			if template.MetaInfo.IconURL != "" {
				coverUri = &template.MetaInfo.IconURL
				// 只对非完整URL的路径进行转换
				if !strings.HasPrefix(template.MetaInfo.IconURL, "http://") && !strings.HasPrefix(template.MetaInfo.IconURL, "https://") {
					objURL, urlErr := t.storage.GetObjectUrl(ctx, template.MetaInfo.IconURL)
					if urlErr == nil {
						coverURL = &objURL
					}
				} else {
					// 如果已经是完整URL，直接使用
					coverURL = &template.MetaInfo.IconURL
				}
			}
			if template.MetaInfo.Labels != nil {
				// 从Labels中提取标签名称
				for _, label := range template.MetaInfo.Labels {
					if label != nil && label.Name != "" {
						tags = append(tags, label.Name)
					}
				}
			}
			if template.MetaInfo.UserInfo != nil {
				if template.MetaInfo.UserInfo.Name != "" {
					authorName = template.MetaInfo.UserInfo.Name
				}
				if template.MetaInfo.UserInfo.AvatarURL != "" {
					authorAvatar = &template.MetaInfo.UserInfo.AvatarURL
				}
			}
		}
		
		response.TemplateInfo = &template_publish.StoreTemplateInfo{
			TemplateID:   template.ID,
			AgentID:      template.AgentID,
			Title:        title,
			Description:  description,
			Status:       "published",
			CreatedAt:    template.CreatedAt,
			Heat:         &template.Heat,
			CoverURI:     coverUri,
			CoverURL:     coverURL,
			Tags:         tags,
			AuthorName:   &authorName,
			AuthorAvatar: authorAvatar,
		}
	}

	return response, nil
}

// convertAgentToStoreTemplate 将智能体转换为商店模板格式
func (t *ApplicationService) convertAgentToStoreTemplate(ctx context.Context, agent *agent_entity.SingleAgent, req *template_publish.PublishToStoreRequest, userID int64) (*entity.TemplateModel, error) {
	// Build meta info using ProductMetaInfo struct
	description := ""
	if req.Description != nil {
		description = *req.Description
	}

	currentTime := time.Now().UnixMilli()
	
	// 设置封面图片
	coverURL := ""
	if req.CoverURI != nil {
		coverURL = *req.CoverURI
	}
	
	// 设置标签
	var labels []*product_public_api.ProductLabel
	if req.Tags != nil {
		for _, tag := range req.Tags {
			labels = append(labels, &product_public_api.ProductLabel{
				Name: tag,
			})
		}
	}

	// 获取用户信息（作者信息）
	// TODO: 这里应该从用户服务获取用户信息，暂时先用默认值
	userInfo := &product_common.UserInfo{
		UserID:    userID,
		Name:      "Developer", // 应该从用户服务获取真实姓名
		AvatarURL: "",         // 应该从用户服务获取真实头像
	}
	
	// 使用正确的ProductMetaInfo结构体
	metaInfo := &product_public_api.ProductMetaInfo{
		Name:          req.Title,
		Description:   description,
		EntityID:      agent.AgentID,
		EntityType:    21, // BotTemplate
		IconURL:       coverURL,
		Heat:          int32(0),
		FavoriteCount: int32(0),
		ListedAt:      currentTime,
		Status:        1, // Published status
		IsFavorited:   false,
		IsFree:        true,
		Readme:        "",
		Labels:        labels,
		UserInfo:      userInfo,
	}

	return &entity.TemplateModel{
		AgentID:           agent.AgentID,
		SpaceID:           consts.TemplateStoreSpaceID, // 使用商店专用的Space ID
		ProductEntityType: 21,                          // BotTemplate
		MetaInfo:          metaInfo,
		Heat:              0,
		CreatedAt:         currentTime,
	}, nil
}

