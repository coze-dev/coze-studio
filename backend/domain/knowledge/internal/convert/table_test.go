package convert

import (
	"fmt"
	"testing"
	"time"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/pkg/lang/ptr"
)

func TestParseAnyData(t *testing.T) {
	PatchConvey("test ParseAnyData", t, func() {
		PatchConvey("test data is nil", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeString,
			}

			resp, err := ParseAnyData(col, nil)
			convey.So(err, convey.ShouldBeNil)
			convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
				ColumnID:   col.ID,
				ColumnName: col.Name,
				Type:       col.Type,
			})
		})

		PatchConvey("test unsupported type", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: 10001,
			}
			data := 123
			resp, err := ParseAnyData(col, data)
			convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] column type not support, type=%d", col.Type))
			convey.So(resp, convey.ShouldBeNil)
		})

		PatchConvey("test string", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeString,
			}

			PatchConvey("test string", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValString:  ptr.Of(data),
				})
			})

			PatchConvey("test []byte", func() {
				data := "hello"
				resp, err := ParseAnyData(col, []byte(data))
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValString:  ptr.Of(data),
				})
			})

			PatchConvey("test failed", func() {
				data := 123
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

		PatchConvey("test integer", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeInteger,
			}

			PatchConvey("test int", func() {
				allData := []any{1, int8(1), int16(1), int32(1), int64(1)}
				for _, data := range allData {
					resp, err := ParseAnyData(col, data)
					convey.So(err, convey.ShouldBeNil)
					convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
						ColumnID:   col.ID,
						ColumnName: col.Name,
						Type:       col.Type,
						ValInteger: ptr.Of(int64(1)),
					})
				}
			})

			PatchConvey("test uint", func() {
				allData := []any{uint(1), uint8(1), uint16(1), uint32(1), uint64(1), uintptr(1)}
				for _, data := range allData {
					resp, err := ParseAnyData(col, data)
					convey.So(err, convey.ShouldBeNil)
					convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
						ColumnID:   col.ID,
						ColumnName: col.Name,
						Type:       col.Type,
						ValInteger: ptr.Of(int64(1)),
					})
				}
			})

			PatchConvey("test failed", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

		PatchConvey("test time", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeTime,
			}

			PatchConvey("test time", func() {
				data := time.Now()
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValTime:    ptr.Of(data),
				})
			})

			PatchConvey("test failed", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

		PatchConvey("test number", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeNumber,
			}

			PatchConvey("test float", func() {
				allData := []any{float32(1), 1.0}
				for _, data := range allData {
					resp, err := ParseAnyData(col, data)
					convey.So(err, convey.ShouldBeNil)
					convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
						ColumnID:   col.ID,
						ColumnName: col.Name,
						Type:       col.Type,
						ValNumber:  ptr.Of(float64(1)),
					})
				}
			})

			PatchConvey("test failed", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

		PatchConvey("test boolean", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeBoolean,
			}

			PatchConvey("test float", func() {
				resp, err := ParseAnyData(col, true)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValBoolean: ptr.Of(true),
				})

			})

			PatchConvey("test failed", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

		PatchConvey("test image", func() {
			col := &entity.TableColumn{
				ID:   123,
				Name: "test",
				Type: entity.TableColumnTypeImage,
			}

			PatchConvey("test string", func() {
				data := "hello"
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValImage:   ptr.Of(data),
				})
			})

			PatchConvey("test []byte", func() {
				data := "hello"
				resp, err := ParseAnyData(col, []byte(data))
				convey.So(err, convey.ShouldBeNil)
				convey.So(resp, convey.ShouldEqual, &entity.TableColumnData{
					ColumnID:   col.ID,
					ColumnName: col.Name,
					Type:       col.Type,
					ValImage:   ptr.Of(data),
				})
			})

			PatchConvey("test failed", func() {
				data := 123
				resp, err := ParseAnyData(col, data)
				convey.So(err, convey.ShouldBeError, fmt.Errorf("[AssertDataType] type assertion failed"))
				convey.So(resp, convey.ShouldBeNil)
			})
		})

	})
}
