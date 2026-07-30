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
	"errors"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	knowledgeModel "github.com/coze-dev/coze-studio/backend/crossdomain/knowledge/model"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/entity"
	"github.com/coze-dev/coze-studio/backend/domain/knowledge/internal/consts"
	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
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

func TestPackInsertData(t *testing.T) {
	PatchConvey("test packInsertData", t, func() {
		PatchConvey("should return parse result empty error when raw content is empty", func() {
			data, err := packInsertData([]*entity.Slice{{
				Info: knowledgeModel.Info{ID: 123},
			}})

			convey.So(data, convey.ShouldBeNil)
			convey.So(err, convey.ShouldNotBeNil)
			var statusErr errorx.StatusError
			convey.So(errors.As(err, &statusErr), convey.ShouldBeTrue)
			convey.So(statusErr.Code(), convey.ShouldEqual, errno.ErrKnowledgeParseResultEmptyCode)
			convey.So(err.Error(), convey.ShouldContainSubstring, "slice 123 raw content is empty")
		})

		PatchConvey("should return invalid param error when table raw content is invalid", func() {
			data, err := packInsertData([]*entity.Slice{{
				Info: knowledgeModel.Info{ID: 456},
				RawContent: []*knowledgeModel.SliceContent{{
					Type: knowledgeModel.SliceContentTypeText,
				}},
			}})

			convey.So(data, convey.ShouldBeNil)
			convey.So(err, convey.ShouldNotBeNil)
			var statusErr errorx.StatusError
			convey.So(errors.As(err, &statusErr), convey.ShouldBeTrue)
			convey.So(statusErr.Code(), convey.ShouldEqual, errno.ErrKnowledgeInvalidParamCode)
			convey.So(err.Error(), convey.ShouldContainSubstring, "slice 456 table raw content is invalid")
		})

		PatchConvey("should pack valid table rows without primary key column", func() {
			data, err := packInsertData([]*entity.Slice{{
				Info: knowledgeModel.Info{ID: 789},
				RawContent: []*knowledgeModel.SliceContent{{
					Type: knowledgeModel.SliceContentTypeTable,
					Table: &knowledgeModel.SliceTable{Columns: []*document.ColumnData{
						{ColumnID: 1001, ColumnName: "name", Type: document.TableColumnTypeString, ValString: stringPtr("alice")},
						{ColumnID: 1002, ColumnName: "age", Type: document.TableColumnTypeInteger, ValInteger: int64Ptr(18)},
						{ColumnID: 1003, ColumnName: "id", Type: document.TableColumnTypeInteger, ValInteger: int64Ptr(999)},
					}},
				}},
			}})

			convey.So(err, convey.ShouldBeNil)
			convey.So(len(data), convey.ShouldEqual, 1)
			convey.So(data[0][consts.RDBFieldID], convey.ShouldEqual, int64(789))
			convey.So(*(data[0]["c_1001"].(*string)), convey.ShouldEqual, "alice")
			convey.So(*(data[0]["c_1002"].(*int64)), convey.ShouldEqual, int64(18))
			convey.So(*(data[0]["c_1003"].(*int64)), convey.ShouldEqual, int64(999))
		})
	})
}

func stringPtr(v string) *string { return &v }

func int64Ptr(v int64) *int64 { return &v }
