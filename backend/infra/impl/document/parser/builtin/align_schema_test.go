package builtin

import (
	"testing"
	"time"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/infra/contract/document"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
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
