package builtin

import (
	"fmt"
	"testing"
	"time"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/domain/knowledge/internal/convert"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestAlignTableSchema(t *testing.T) {
	PatchConvey("test alignTableSchema", t, func() {
		PatchConvey("test len not same", func() {
			a := []*entity.TableColumn{{}, {}}
			b := []*entity.TableColumn{{}}
			convey.So(alignTableSchema(a, b), convey.ShouldBeError, fmt.Errorf("[alignTableSchema] length not same"))
		})

		PatchConvey("test name not same", func() {
			a := []*entity.TableColumn{{Name: "123"}, {Name: "321"}}
			b := []*entity.TableColumn{{Name: "123"}, {Name: "322"}}
			convey.So(alignTableSchema(a, b), convey.ShouldBeError, fmt.Errorf("[alignTableSchema] col name not found, name=322"))
		})

		PatchConvey("test success", func() {
			a := []*entity.TableColumn{{Name: "123"}, {Name: "321"}}
			b := []*entity.TableColumn{{Name: "123"}, {Name: "321"}}
			convey.So(alignTableSchema(a, b), convey.ShouldBeNil)

		})
	})
}

func TestAssertVal(t *testing.T) {
	PatchConvey("test assertVal", t, func() {
		convey.So(convert.AssertVal(""), convey.ShouldEqual, entity.TableColumnData{
			Type:      entity.TableColumnTypeUnknown,
			ValString: ptr.Of(""),
		})
		convey.So(convert.AssertVal("true"), convey.ShouldEqual, entity.TableColumnData{
			Type:       entity.TableColumnTypeBoolean,
			ValBoolean: ptr.Of(true),
		})
		convey.So(convert.AssertVal("10"), convey.ShouldEqual, entity.TableColumnData{
			Type:       entity.TableColumnTypeInteger,
			ValInteger: ptr.Of(int64(10)),
		})
		convey.So(convert.AssertVal("1.0"), convey.ShouldEqual, entity.TableColumnData{
			Type:      entity.TableColumnTypeNumber,
			ValNumber: ptr.Of(1.0),
		})
		ts := time.Now().Format(convert.TimeFormat)
		now, err := time.Parse(convert.TimeFormat, ts)
		convey.So(err, convey.ShouldBeNil)
		convey.So(convert.AssertVal(ts), convey.ShouldEqual, entity.TableColumnData{
			Type:    entity.TableColumnTypeTime,
			ValTime: ptr.Of(now),
		})
		convey.So(convert.AssertVal("hello"), convey.ShouldEqual, entity.TableColumnData{
			Type:      entity.TableColumnTypeString,
			ValString: ptr.Of("hello"),
		})
	})
}

func TestAssertValAs(t *testing.T) {
	PatchConvey("test assertValAs", t, func() {
		type testCase struct {
			typ   entity.TableColumnType
			val   string
			isErr bool
			data  *entity.TableColumnData
		}

		ts := time.Now().Format(convert.TimeFormat)
		now, _ := time.Parse(convert.TimeFormat, ts)
		cases := []testCase{
			{
				typ:   entity.TableColumnTypeString,
				val:   "hello",
				isErr: false,
				data:  &entity.TableColumnData{Type: entity.TableColumnTypeString, ValString: ptr.Of("hello")},
			},
			{
				typ:   entity.TableColumnTypeInteger,
				val:   "1",
				isErr: false,
				data:  &entity.TableColumnData{Type: entity.TableColumnTypeInteger, ValInteger: ptr.Of(int64(1))},
			},
			{
				typ:   entity.TableColumnTypeInteger,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   entity.TableColumnTypeTime,
				val:   ts,
				isErr: false,
				data:  &entity.TableColumnData{Type: entity.TableColumnTypeTime, ValTime: ptr.Of(now)},
			},
			{
				typ:   entity.TableColumnTypeTime,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   entity.TableColumnTypeNumber,
				val:   "1.0",
				isErr: false,
				data:  &entity.TableColumnData{Type: entity.TableColumnTypeNumber, ValNumber: ptr.Of(1.0)},
			},
			{
				typ:   entity.TableColumnTypeNumber,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   entity.TableColumnTypeBoolean,
				val:   "true",
				isErr: false,
				data:  &entity.TableColumnData{Type: entity.TableColumnTypeBoolean, ValBoolean: ptr.Of(true)},
			},
			{
				typ:   entity.TableColumnTypeBoolean,
				val:   "hello",
				isErr: true,
			},
			{
				typ:   entity.TableColumnTypeUnknown,
				val:   "hello",
				isErr: true,
			},
		}

		for _, c := range cases {
			v, err := convert.AssertValAs(c.typ, c.val)
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
