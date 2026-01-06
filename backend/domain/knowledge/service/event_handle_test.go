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
	"encoding/json"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
)

func TestEventHandle(t *testing.T) {
	PatchConvey("test EventHandle", t, func() {
		ctx := context.Background()
		k := &knowledgeSVC{}

		PatchConvey("test event type not found", func() {
			event := &entity.Event{Type: "test_type"}
			b, err := json.Marshal(event)
			convey.So(err, convey.ShouldBeNil)

			err = k.HandleMessage(ctx, &eventbus.Message{Body: b})
			convey.So(err, convey.ShouldBeNil)
		})
	})
}
