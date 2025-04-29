package validate

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/bytedance/mockey"
	"github.com/stretchr/testify/assert"
	"go.uber.org/mock/gomock"

	"code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable"
	mockvar "code.byted.org/flow/opencoze/backend/domain/workflow/crossdomain/variable/varmock"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/canvas"
	mockWorkflowRepo "code.byted.org/flow/opencoze/backend/domain/workflow/internal/repo/mockrepo"
)

func TestCanvasValidate(t *testing.T) {

	mockey.PatchConvey("workflow_has_loop", t, func() {
		data, err := os.ReadFile("../examples/validate/workflow_has_loop.json")
		st := time.Now()
		defer func() {
			fmt.Printf("workflow_has_loop time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()

		validator, err := NewCanvasValidator(ctx, &Config{
			Canvas: c,
		})
		assert.NoError(t, err)
		is, err := validator.DetectCycles(ctx)
		assert.NoError(t, err)
		println(is)
		bs, _ := json.Marshal(is)
		fmt.Println(string(bs))
		paths := map[string]string{
			"161668": "101917",
			"101917": "177387",
			"177387": "161668",
			"166209": "102541",
			"102541": "109507",
			"109507": "166209",
		}

		for _, i := range is {
			assert.Equal(t, paths[i.PathErr.StartNode], i.PathErr.EndNode)
		}

	})

	mockey.PatchConvey("workflow_has_no_connected_nodes", t, func() {
		data, err := os.ReadFile("../examples/validate/workflow_has_no_connected_nodes.json")
		st := time.Now()
		defer func() {
			fmt.Printf("workflow_has_no_connected_nodes time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()

		validate, err := NewCanvasValidator(ctx, &Config{
			Canvas: c,
		})

		is, err := validate.ValidateConnections(ctx)
		assert.NoError(t, err)
		for _, i := range is {
			if i.NodeErr != nil {
				if i.NodeErr.NodeID == "108984" {
					assert.Equal(t, i.Message, `node "代码_1" not connected`)
				}
				if i.NodeErr.NodeID == "160892" {
					assert.Contains(t, i.Message, `node "意图识别"'s port "branch_1" not connected`, `node "意图识别"'s port "default" not connected;`)
				}

			}
		}

	})

	mockey.PatchConvey("workflow_ref_variable", t, func() {
		st := time.Now()
		defer func() {
			fmt.Printf("workflow_ref_variable time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		data, err := os.ReadFile("../examples/validate/workflow_ref_variable.json")

		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()

		validate, err := NewCanvasValidator(ctx, &Config{
			Canvas: c,
		})

		is, err := validate.CheckRefVariable(ctx)
		assert.NoError(t, err)
		for _, i := range is {
			if i.NodeErr != nil {
				if i.NodeErr.NodeID == "118685" {
					assert.Equal(t, i.Message, `the node id "118685" on which node id "165568" depends does not exist`)
				}

				if i.NodeErr.NodeID == "128176" {
					assert.Equal(t, i.Message, `the node id "128176" on which node id "11384000" depends does not exist`)
				}
			}
		}
	})

	mockey.PatchConvey("workflow_nested_has_loop_or_batch", t, func() {
		data, err := os.ReadFile("../examples/validate/workflow_nested_has_loop_or_batch.json")
		st := time.Now()
		defer func() {
			fmt.Printf("workflow_nested_has_loop_or_batch time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		assert.NoError(t, err)
		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()
		validate, err := NewCanvasValidator(ctx, &Config{
			Canvas: c,
		})

		is, err := validate.ValidateNestedFlows(ctx)
		assert.NoError(t, err)
		assert.Equal(t, is[0].Message, `nested nodes do not support batch/loop`)
	})

	mockey.PatchConvey("workflow_variable_assigner", t, func() {
		data, err := os.ReadFile("../examples/validate/workflow_variable_assigner.json")
		assert.NoError(t, err)
		st := time.Now()
		defer func() {
			fmt.Printf("workflow_variable_assigner time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()

		mockVarGetter := mockvar.NewMockVariablesMetaGetter(ctrl)
		mockey.Mock(variable.GetVariablesMetaGetter).Return(mockVarGetter).Build()

		vars := make([]*variable.VarMeta, 0)

		vars = append(vars, &variable.VarMeta{
			Name: "app_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v1",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeArray,
				ElemTypeInfo: &variable.VarTypeInfo{
					Type: variable.VarTypeString,
				},
			},
		})
		vars = append(vars, &variable.VarMeta{
			Name: "app_list_v2",
			TypeInfo: variable.VarTypeInfo{
				Type: variable.VarTypeString,
			},
		})

		mockVarGetter.EXPECT().GetProjectVariablesMeta(gomock.Any(), gomock.Any(), gomock.Any()).Return(vars, nil)

		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()
		validate, err := NewCanvasValidator(ctx, &Config{
			Canvas:              c,
			VariablesMetaGetter: mockVarGetter,
			ProjectID:           "project_id",
		})

		is, err := validate.CheckGlobalVariables(ctx)
		assert.NoError(t, err)
		bs, _ := json.Marshal(is)

		assert.Equal(t, string(bs), `[{"NodeErr":{"nodeID":"193133","nodeName":"变量赋值"},"PathErr":null,"Message":"node name 变量赋值,param [app_list_v2] is updated, please update the param"}]`)
	})
	mockey.PatchConvey("sub_workflow_terminate_plan_type", t, func() {

		data, err := os.ReadFile("../examples/validate/sub_workflow_terminate_plan_type.json")
		assert.NoError(t, err)
		st := time.Now()
		defer func() {
			fmt.Printf("sub_workflow_terminate_plan_type time spend: %v ms\n", time.Since(st).Milliseconds())
		}()
		ctrl := gomock.NewController(t)
		defer ctrl.Finish()
		mockRepository := mockWorkflowRepo.NewMockRepository(ctrl)
		canvasMapByte := []byte(`{"130338": {"nodes": [{"id": "","type": "2","data": {"inputs": {"content": null,"terminatePlan": "useAnswerContent"}}},{"id": "","type": "1","data": {"inputs": {"content": null,"terminatePlan": "useAnswerContent"}}}],"edges": null}}`)
		cs := make(map[string]*canvas.Canvas)
		err = json.Unmarshal(canvasMapByte, &cs)
		assert.NoError(t, err)

		mockRepository.EXPECT().BatchGetSubWorkflowCanvas(gomock.Any(), gomock.Any()).Return(cs, nil)

		c := &canvas.Canvas{}
		err = json.Unmarshal(data, c)
		ctx := t.Context()
		validate, err := NewCanvasValidator(ctx, &Config{
			Canvas:       c,
			WfRepository: mockRepository,
		})

		is, err := validate.CheckSubWorkFlowTerminatePlanType(ctx)
		assert.NoError(t, err)
		bs, _ := json.Marshal(is)

		assert.Equal(t, string(bs), `[{"NodeErr":{"nodeID":"130338","nodeName":"variable"},"PathErr":null,"Message":"sub workflow has been modified, please refresh the page"}]`)
	})
}
