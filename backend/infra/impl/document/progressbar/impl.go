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

package progressbar

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/document/progressbar"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ProgressBarImpl struct {
	CacheCli     cache.Cmdable
	PrimaryKeyID int64
	Total        int64
	ErrMsg       string
}

const (
	ttl                             = time.Hour * 2
	ProgressBarStartTimeRedisKey    = "RedisBiz.Knowledge_ProgressBar_StartTime_%d"
	ProgressBarErrMsgRedisKey       = "RedisBiz.Knowledge_ProgressBar_ErrMsg_%d"
	ProgressBarTotalNumRedisKey     = "RedisBiz.Knowledge_ProgressBar_TotalNum_%d"
	ProgressBarProcessedNumRedisKey = "RedisBiz.Knowledge_ProgressBar_ProcessedNum_%d"
	DefaultProcessTime              = 300
	ProcessDone                     = 100
	ProcessInit                     = 0
)

func NewProgressBar(ctx context.Context, pkID int64, total int64, CacheCli cache.Cmdable, needInit bool) progressbar.ProgressBar {
	if needInit {
		CacheCli.Set(ctx, fmt.Sprintf(ProgressBarTotalNumRedisKey, pkID), total, ttl)
		CacheCli.Set(ctx, fmt.Sprintf(ProgressBarProcessedNumRedisKey, pkID), 0, ttl)
		CacheCli.Set(ctx, fmt.Sprintf(ProgressBarErrMsgRedisKey, pkID), "", ttl)
		CacheCli.Set(ctx, fmt.Sprintf(ProgressBarStartTimeRedisKey, pkID), time.Now().Unix(), ttl)
	}
	return &ProgressBarImpl{
		PrimaryKeyID: pkID,
		Total:        total,
		CacheCli:     CacheCli,
	}
}

func (p *ProgressBarImpl) AddN(n int) error {
	if p.ErrMsg != "" {
		return errors.New(p.ErrMsg)
	}
	_, err := p.CacheCli.IncrBy(context.Background(), fmt.Sprintf(ProgressBarProcessedNumRedisKey, p.PrimaryKeyID), int64(n)).Result()
	if err != nil {
		return err
	}
	return nil
}

func (p *ProgressBarImpl) ReportError(err error) error {
	p.ErrMsg = err.Error()
	_, err = p.CacheCli.Set(context.Background(), fmt.Sprintf(ProgressBarErrMsgRedisKey, p.PrimaryKeyID), err.Error(), ttl).Result()
	if err != nil {
		return err
	}
	return nil
}

func (p *ProgressBarImpl) GetProgress(ctx context.Context) (percent int, remainSec int, errMsg string) {
	var (
		totalNum     *int64
		processedNum *int64
		startTime    *int64
		err          error
	)
	errMsg, err = p.CacheCli.Get(ctx, fmt.Sprintf(ProgressBarErrMsgRedisKey, p.PrimaryKeyID)).Result()
	if err == cache.Nil {
		errMsg = ""
	} else if err != nil {
		return ProcessDone, 0, err.Error()
	}
	if len(errMsg) != 0 {
		return ProcessDone, 0, errMsg
	}
	totalNumStr, err := p.CacheCli.Get(ctx, fmt.Sprintf(ProgressBarTotalNumRedisKey, p.PrimaryKeyID)).Result()
	if err == cache.Nil || len(totalNumStr) == 0 {
		totalNum = ptr.Of(int64(0))
	} else if err != nil {
		return ProcessDone, 0, err.Error()
	} else {
		num, err := conv.StrToInt64(totalNumStr)
		if err != nil {
			totalNum = ptr.Of(int64(0))
		} else {
			totalNum = ptr.Of(num)
		}
	}
	processedNumStr, err := p.CacheCli.Get(ctx, fmt.Sprintf(ProgressBarProcessedNumRedisKey, p.PrimaryKeyID)).Result()
	if err == cache.Nil || len(processedNumStr) == 0 {
		processedNum = ptr.Of(int64(0))
	} else if err != nil {
		return ProcessDone, 0, err.Error()
	} else {
		num, err := conv.StrToInt64(processedNumStr)
		if err != nil {
			processedNum = ptr.Of(int64(0))
		} else {
			processedNum = ptr.Of(num)
		}
	}
	if ptr.From(totalNum) == 0 {
		return ProcessInit, DefaultProcessTime, ""
	}
	startTimeStr, err := p.CacheCli.Get(ctx, fmt.Sprintf(ProgressBarStartTimeRedisKey, p.PrimaryKeyID)).Result()
	if err == cache.Nil || len(startTimeStr) == 0 {
		startTime = ptr.Of(int64(0))
	} else if err != nil {
		return ProcessDone, 0, err.Error()
	} else {
		num, err := conv.StrToInt64(startTimeStr)
		if err != nil {
			startTime = ptr.Of(int64(0))
		} else {
			startTime = ptr.Of(num)
		}
	}
	percent = int(float64(ptr.From(processedNum)) / float64(ptr.From(totalNum)) * 100)
	if ptr.From(startTime) == 0 {
		remainSec = DefaultProcessTime
	} else {
		usedSec := time.Now().Unix() - ptr.From(startTime)
		remainSec = int(float64(ptr.From(totalNum)-ptr.From(processedNum)) / float64(ptr.From(processedNum)) * float64(usedSec))
	}
	return
}
