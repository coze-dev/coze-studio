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

package service

import (
	"context"
	"fmt"
	"testing"

	"github.com/coze-dev/coze-studio/backend/domain/plugin/repository/mock"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"go.uber.org/mock/gomock"
)

type pluginOAuthSuite struct {
	suite.Suite
	ctrl *gomock.Controller
	ctx  context.Context

	mockOauthRepo *mock_plugin_oauth.MockOAuthRepository
}

func TestPluginOAuthSuite(t *testing.T) {
	suite.Run(t, &pluginOAuthSuite{})
}

func (s *pluginOAuthSuite) SetupSuite() {
	s.ctrl = gomock.NewController(s.T())
	s.mockOauthRepo = mock_plugin_oauth.NewMockOAuthRepository(s.ctrl)
}

func (s *pluginOAuthSuite) TearDownSuite() {
	s.ctrl.Finish()
}

func (s *pluginOAuthSuite) SetupTest() {
	s.ctx = context.Background()
}

func (s *pluginOAuthSuite) TearDownTest() {

}

func (s *pluginOAuthSuite) TestRefreshTokenFailedHandler() {
	mockRecordID := int64(123)
	mockErr := fmt.Errorf("mock error")
	mockSVC := &pluginServiceImpl{
		oauthRepo: s.mockOauthRepo,
	}

	mockSVC.refreshTokenFailedHandler(s.ctx, mockRecordID, mockErr)
	failedTimes, ok := failedCache.Load(mockRecordID)
	assert.True(s.T(), ok)
	assert.Equal(s.T(), 1, failedTimes.(int))

	for i := 2; i < 5; i++ {
		mockSVC.refreshTokenFailedHandler(s.ctx, mockRecordID, mockErr)
		failedTimes, ok = failedCache.Load(mockRecordID)
		assert.True(s.T(), ok)
		assert.Equal(s.T(), i, failedTimes.(int))
	}

	s.mockOauthRepo.EXPECT().BatchDeleteAuthorizationCodeByIDs(gomock.Any(), gomock.Any()).
		Return(nil).Times(1)

	mockSVC.refreshTokenFailedHandler(s.ctx, mockRecordID, mockErr)
	_, ok = failedCache.Load(mockRecordID)
	assert.False(s.T(), ok)
}
