package builtin

import (
	"fmt"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
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
			convey.So(alignTableSchema(a, b), convey.ShouldBeError, fmt.Errorf("[alignTableSchema] col name invalid, expect=321, got=322"))
		})

		PatchConvey("test success", func() {
			a := []*entity.TableColumn{{Name: "123"}, {Name: "321"}}
			b := []*entity.TableColumn{{Name: "123"}, {Name: "321"}}
			convey.So(alignTableSchema(a, b), convey.ShouldBeNil)

		})
	})
}
