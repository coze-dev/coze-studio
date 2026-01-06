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

package builtin

import (
	"testing"
	"time"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"github.com/coze-dev/coze-studio/backend/infra/document"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func TestAssertVal(t *testing.T) {
	PatchConvey("test assertVal", t, func() {
		convey.So(assertVal(""), convey.ShouldEqual, document.ColumnData{
			Type:      document.TableColumnTypeUnknown,
			ValString: ptr.Of(""),
		})
		convey.So(assertVal("true"), convey.ShouldEqual, document.ColumnData{
			Type:       document.TableColumnTypeBoolean,
			ValBoolean: ptr.Of(true),
		})
		convey.So(assertVal("10"), convey.ShouldEqual, document.ColumnData{
			Type:       document.TableColumnTypeInteger,
			ValInteger: ptr.Of(int64(10)),
		})
		convey.So(assertVal("1.0"), convey.ShouldEqual, document.ColumnData{
			Type:      document.TableColumnTypeNumber,
			ValNumber: ptr.Of(1.0),
		})
		ts := time.Now().Format(timeFormat)
		now, err := time.Parse(timeFormat, ts)
		convey.So(err, convey.ShouldBeNil)
		convey.So(assertVal(ts), convey.ShouldEqual, document.ColumnData{
			Type:    document.TableColumnTypeTime,
			ValTime: ptr.Of(now),
		})
		convey.So(assertVal("hello"), convey.ShouldEqual, document.ColumnData{
			Type:      document.TableColumnTypeString,
			ValString: ptr.Of("hello"),
		})
	})
}

func TestAssertValAs(t *testing.T) {
	PatchConvey("test assertValAs", t, func() {
		type testCase struct {
			typ   document.TableColumnType
			val   string
			isErr bool
			data  *document.ColumnData
		}

		ts := time.Now().Format(timeFormat)
		now, _ := time.Parse(timeFormat, ts)
		cases := []testCase{
			{
				typ:   document.TableColumnTypeString,
				val:   "hello",
				isErr: false,
				data:  &document.ColumnData{Type: document.TableColumnTypeString, ValString: ptr.Of("hello")},
			},
			{
				typ:   document.TableColumnTypeInteger,
				val:   "1",
				isErr: false,
				data:  &document.ColumnData{Type: document.TableColumnTypeInteger, ValInteger: ptr.Of(int64(1))},
			},
			{
				typ:   document.TableColumnTypeInteger,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   document.TableColumnTypeTime,
				val:   ts,
				isErr: false,
				data:  &document.ColumnData{Type: document.TableColumnTypeTime, ValTime: ptr.Of(now)},
			},
			{
				typ:   document.TableColumnTypeTime,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   document.TableColumnTypeNumber,
				val:   "1.0",
				isErr: false,
				data:  &document.ColumnData{Type: document.TableColumnTypeNumber, ValNumber: ptr.Of(1.0)},
			},
			{
				typ:   document.TableColumnTypeNumber,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   document.TableColumnTypeBoolean,
				val:   "true",
				isErr: false,
				data:  &document.ColumnData{Type: document.TableColumnTypeBoolean, ValBoolean: ptr.Of(true)},
			},
			{
				typ:   document.TableColumnTypeBoolean,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   document.TableColumnTypeUnknown,
				val:   "hello",
				isErr: true,
			},
		}

		for _, c := range cases {
			v, err := assertValAs(c.typ, c.val)
			if c.isErr {
				convey.So(err, convey.ShouldNotBeNil)
				convey.So(v, convey.ShouldBeNil)
			} else {
				convey.So(err, convey.ShouldBeNil)
				convey.So(v, convey.ShouldEqual, c.data)
			}
		}
	})
}
