package service

import (
	"context"
	"encoding/json"
	"testing"

	. "github.com/bytedance/mockey"
	"github.com/smartystreets/goconvey/convey"

	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
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
