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

package veimagex

import (
	"context"
	"errors"
	"time"

	"github.com/volcengine/volc-sdk-golang/base"
	veimagex "github.com/volcengine/volc-sdk-golang/service/imagex/v2"

	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

func New(ak, sk, domain, uploadHost, template string, serverIDs []string) (imagex.ImageX, error) {
	instance := veimagex.DefaultInstance
	instance.SetCredential(base.Credentials{
		AccessKeyID:     ak,
		SecretAccessKey: sk,
	})

	if len(serverIDs) == 0 {
		return nil, errors.New("imageX serverIDs is empty")
	}

	return &veImageX{
		ak:         ak,
		sk:         sk,
		domain:     domain,
		uploadHost: uploadHost,
		template:   template,
		serverIDs:  serverIDs,
	}, nil
}

type veImageX struct {
	ak         string
	sk         string
	domain     string
	uploadHost string
	template   string
	serverIDs  []string
}

func (v *veImageX) GetUploadAuth(ctx context.Context, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	return v.GetUploadAuthWithExpire(ctx, time.Hour, opt...)
}

func (v *veImageX) GetUploadAuthWithExpire(ctx context.Context, expire time.Duration, opt ...imagex.UploadAuthOpt) (*imagex.SecurityToken, error) {
	// Opt to UploadAuthOption
	option := &imagex.UploadAuthOption{}
	for _, o := range opt {
		o(option)
	}
	policy := &veimagex.UploadPolicy{}
	if len(option.ContentTypeBlackList) > 0 {
		policy.ContentTypeBlackList = option.ContentTypeBlackList
	}

	if len(option.ContentTypeWhiteList) > 0 {
		policy.ContentTypeWhiteList = option.ContentTypeWhiteList
	}

	if option.FileSizeUpLimit != nil {
		policy.FileSizeUpLimit = *option.FileSizeUpLimit
	}

	if option.FileSizeBottomLimit != nil {
		policy.FileSizeBottomLimit = *option.FileSizeBottomLimit
	}

	keyPtn := "*"
	if option.KeyPtn != nil {
		keyPtn = *option.KeyPtn
	}

	instance := veimagex.DefaultInstance
	token, err := instance.GetUploadAuth(v.serverIDs,
		veimagex.WithUploadOverwrite(false),
		veimagex.WithUploadKeyPtn(keyPtn),
		veimagex.WithUploadPolicy(policy))
	if err != nil {
		return nil, err
	}

	return &imagex.SecurityToken{
		AccessKeyID:     token.AccessKeyID,
		SecretAccessKey: token.SecretAccessKey,
		SessionToken:    token.SessionToken,
		ExpiredTime:     token.ExpiredTime,
		CurrentTime:     token.CurrentTime,
		HostScheme:      "https",
	}, nil
}

func (v *veImageX) GetResourceURL(ctx context.Context, uri string, opts ...imagex.GetResourceOpt) (*imagex.ResourceURL, error) {
	if len(v.serverIDs) == 0 {
		return nil, errors.New("serverIDs is empty")
	}

	serverID := v.serverIDs[0]

	option := &imagex.GetResourceOption{}
	for _, o := range opts {
		o(option)
	}

	if option.Expire < 3600 {
		option.Expire = 3600
	}

	if option.Template == "" {
		option.Template = v.template
	}

	if option.Template == "" {
		p1 := &veimagex.GetAllImageTemplatesQuery{
			ServiceID: serverID,
			Limit:     1,
		}

		instance := veimagex.DefaultInstance
		r1, err := instance.GetAllImageTemplates(ctx, p1)
		if err != nil {
			return nil, err
		}

		if len(r1.Result.Templates) == 0 {
			return nil, errors.New("templates is empty")
		}

		option.Template = r1.Result.Templates[0].TemplateName
	}

	param := &veimagex.GetResourceURLQuery{
		Domain:    v.domain,
		ServiceID: serverID,
		URI:       uri,
		Format:    option.Format,
		Proto:     option.Proto,
		Timestamp: option.Expire,
		Tpl:       option.Template,
	}

	logs.CtxInfof(ctx, "GetResourceURL param: %+v", param)

	instance := veimagex.DefaultInstance
	resp, err := instance.GetResourceURL(context.Background(), param)
	if err != nil {
		return nil, err
	}

	return &imagex.ResourceURL{
		URL:        resp.Result.URL,
		CompactURL: resp.Result.CompactURL,
	}, nil
}

func (v *veImageX) Upload(ctx context.Context, data []byte, opts ...imagex.UploadAuthOpt) (*imagex.UploadResult, error) {
	if len(v.serverIDs) == 0 {
		return nil, errors.New("serverIDs is empty")
	}

	serverID := v.serverIDs[0]

	option := &imagex.UploadAuthOption{}
	for _, o := range opts {
		o(option)
	}

	overWrite := false
	if option.UploadOverWrite != nil {
		overWrite = *option.UploadOverWrite
	}

	params := &veimagex.ApplyUploadImageParam{
		ServiceId: serverID,
		Overwrite: overWrite,
	}

	if option.StoreKey != nil {
		params.StoreKeys = []string{*option.StoreKey}
	}

	instance := veimagex.DefaultInstance
	resp, err := instance.UploadImages(params, [][]byte{data})
	if err != nil {
		return nil, err
	}

	if len(resp.Results) == 0 {
		return nil, errors.New("results is empty")
	}

	r := &imagex.UploadResult{
		RequestId: resp.RequestId,
		Result: &imagex.Result{
			Uri:       resp.Results[0].Uri,
			UriStatus: resp.Results[0].UriStatus,
		},
	}

	if len(resp.ImageInfos) > 0 {
		r.FileInfo = &imagex.FileInfo{
			Name:        resp.ImageInfos[0].FileName,
			Uri:         resp.ImageInfos[0].ImageUri,
			ImageWidth:  resp.ImageInfos[0].ImageWidth,
			ImageHeight: resp.ImageInfos[0].ImageHeight,
			Md5:         resp.ImageInfos[0].ImageMd5,
			ImageFormat: resp.ImageInfos[0].ImageFormat,
			ImageSize:   resp.ImageInfos[0].ImageSize,
			FrameCnt:    resp.ImageInfos[0].FrameCnt,
			Duration:    resp.ImageInfos[0].Duration,
		}
	}

	return r, nil
}

func (v *veImageX) GetServerID() string {
	return v.serverIDs[0]
}

func (v *veImageX) GetUploadHost(ctx context.Context) string {
	return v.uploadHost
}
