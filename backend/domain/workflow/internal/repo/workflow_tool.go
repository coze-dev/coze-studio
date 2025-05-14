package repo

import (
	"context"
	"fmt"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

const answerKey = "output"

type invokableWorkflow struct {
	info          *schema.ToolInfo
	invoke        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error)
	terminatePlan vo.TerminatePlan
}

func (i *invokableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return i.info, nil
}

func (i *invokableWorkflow) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	in := make(map[string]any)
	if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
		return "", err
	}

	callOpts := getWorkflowCallOptions(opts...)

	// TODO: designate options and start event handle

	out, err := i.invoke(ctx, in, callOpts...)
	if err != nil {
		return "", err
	}

	if i.terminatePlan == vo.ReturnVariables {
		return sonic.MarshalString(out)
	}

	content, ok := out[answerKey]
	if !ok {
		return "", fmt.Errorf("no answer found when terminate plan is use answer content. out: %v", out)
	}

	contentStr, ok := content.(string)
	if !ok {
		return "", fmt.Errorf("answer content is not string. content: %v", content)
	}

	if strings.HasSuffix(contentStr, nodes.KeyIsFinished) {
		contentStr = strings.TrimSuffix(contentStr, nodes.KeyIsFinished)
	}

	return contentStr, nil
}

func (i *invokableWorkflow) TerminatePlan() vo.TerminatePlan {
	return i.terminatePlan
}

type streamableWorkflow struct {
	info          *schema.ToolInfo
	stream        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error)
	terminatePlan vo.TerminatePlan
}

func (s streamableWorkflow) Info(ctx context.Context) (*schema.ToolInfo, error) {
	return s.info, nil
}

func (s streamableWorkflow) StreamableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (*schema.StreamReader[string], error) {
	in := make(map[string]any)
	if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
		return nil, err
	}

	callOpts := getWorkflowCallOptions(opts...)

	// TODO: designate options and start event handle

	outStream, err := s.stream(ctx, in, callOpts...)
	if err != nil {
		return nil, err
	}

	return schema.StreamReaderWithConvert(outStream, func(in map[string]any) (string, error) {
		content, ok := in["output"]
		if !ok {
			return "", fmt.Errorf("no output found when stream plan is use output content. out: %v", in)
		}

		contentStr, ok := content.(string)
		if !ok {
			return "", fmt.Errorf("output content is not string. content: %v", content)
		}

		if strings.HasSuffix(contentStr, nodes.KeyIsFinished) {
			contentStr = strings.TrimSuffix(contentStr, nodes.KeyIsFinished)
			if len(contentStr) == 0 {
				return "", schema.ErrNoValue
			}
		}

		return contentStr, nil
	}), nil
}

func (s streamableWorkflow) TerminatePlan() vo.TerminatePlan {
	return s.terminatePlan
}

type workflowToolOption struct {
	composeOpts []einoCompose.Option
}

func WithWorkflowCallOptions(callOpts ...einoCompose.Option) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.composeOpts = callOpts
	})
}

func getWorkflowCallOptions(opts ...tool.Option) []einoCompose.Option {
	return tool.GetImplSpecificOptions(&workflowToolOption{}, opts...).composeOpts
}
