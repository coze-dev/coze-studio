package compose

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/cloudwego/eino/components/tool"
	einoCompose "github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	wf "code.byted.org/flow/opencoze/backend/domain/workflow"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
	"code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"
)

const answerKey = "output"

type invokableWorkflow struct {
	info          *schema.ToolInfo
	invoke        func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error)
	terminatePlan vo.TerminatePlan
	wfEntity      *entity.Workflow
	sc            *WorkflowSchema
	repo          wf.Repository
}

func NewInvokableWorkflow(info *schema.ToolInfo,
	invoke func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (map[string]any, error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &invokableWorkflow{
		info:          info,
		invoke:        invoke,
		terminatePlan: terminatePlan,
		wfEntity:      wfEntity,
		sc:            sc,
		repo:          repo,
	}
}

func (i *invokableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return i.info, nil
}

func (i *invokableWorkflow) InvokableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (string, error) {
	rInfo, found, err := getResumeInfo(opts...)
	if err != nil {
		return "", err
	}

	var (
		cancelCtx context.Context
		// executeID int64
		callOpts []einoCompose.Option
		in       map[string]any
	)
	if found {
		cancelCtx, _, callOpts, err = Prepare(ctx, "", i.wfEntity.GetBasic(int32(len(i.sc.GetAllNodes()))),
			rInfo, i.repo, i.sc,
			getIntermediateStreamWriter(opts...), false)
		if err != nil {
			return "", err
		}
	} else {
		in = make(map[string]any)
		if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return "", err
		}

		cancelCtx, _, callOpts, err = Prepare(ctx, argumentsInJSON, i.wfEntity.GetBasic(int32(len(i.sc.GetAllNodes()))),
			nil, i.repo, i.sc,
			getIntermediateStreamWriter(opts...), false)
		if err != nil {
			return "", err
		}
	}

	customOpts := getWorkflowCallOptions(opts...)
	callOpts = append(callOpts, customOpts...)

	out, err := i.invoke(cancelCtx, in, callOpts...)
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
	wfEntity      *entity.Workflow
	sc            *WorkflowSchema
	repo          wf.Repository
}

func NewStreamableWorkflow(info *schema.ToolInfo,
	stream func(ctx context.Context, input map[string]any, opts ...einoCompose.Option) (*schema.StreamReader[map[string]any], error),
	terminatePlan vo.TerminatePlan,
	wfEntity *entity.Workflow,
	sc *WorkflowSchema,
	repo wf.Repository,
) wf.ToolFromWorkflow {
	return &streamableWorkflow{
		info:          info,
		stream:        stream,
		terminatePlan: terminatePlan,
		wfEntity:      wfEntity,
		sc:            sc,
		repo:          repo,
	}
}

func (s streamableWorkflow) Info(_ context.Context) (*schema.ToolInfo, error) {
	return s.info, nil
}

func (s streamableWorkflow) StreamableRun(ctx context.Context, argumentsInJSON string, opts ...tool.Option) (*schema.StreamReader[string], error) {
	rInfo, found, err := getResumeInfo(opts...)
	if err != nil {
		return nil, err
	}

	var (
		cancelCtx context.Context
		// executeID int64
		callOpts []einoCompose.Option
		in       map[string]any
	)
	if found {
		cancelCtx, _, callOpts, err = Prepare(ctx, "", s.wfEntity.GetBasic(int32(len(s.sc.GetAllNodes()))),
			rInfo, s.repo, s.sc,
			getIntermediateStreamWriter(opts...), false)
		if err != nil {
			return nil, err
		}
	} else {
		in = make(map[string]any)
		if err := sonic.UnmarshalString(argumentsInJSON, &in); err != nil {
			return nil, err
		}

		cancelCtx, _, callOpts, err = Prepare(ctx, argumentsInJSON, s.wfEntity.GetBasic(int32(len(s.sc.GetAllNodes()))),
			nil, s.repo, s.sc,
			getIntermediateStreamWriter(opts...), false)
		if err != nil {
			return nil, err
		}
	}

	customOpts := getWorkflowCallOptions(opts...)
	callOpts = append(callOpts, customOpts...)

	outStream, err := s.stream(cancelCtx, in, callOpts...)
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
	resumeID    string
	resumeData  string
	sw          *schema.StreamWriter[*entity.Message]
}

func WithWorkflowCallOptions(callOpts ...einoCompose.Option) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.composeOpts = callOpts
	})
}

func WithResume(resumeID, data string) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.resumeID = resumeID
		opts.resumeData = data
	})
}

func WithIntermediateStreamWriter(sw *schema.StreamWriter[*entity.Message]) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.sw = sw
	})
}

func getWorkflowCallOptions(opts ...tool.Option) []einoCompose.Option {
	return tool.GetImplSpecificOptions(&workflowToolOption{}, opts...).composeOpts
}

func parseResumeID(resumeID string) (*entity.ResumeRequest, error) {
	parts := strings.Split(resumeID, "_")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid resume id: %s", resumeID)
	}
	executeID, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid execute id: %s", parts[0])
	}
	eventID, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid event id: %s", parts[1])
	}
	return &entity.ResumeRequest{
		ExecuteID: executeID,
		EventID:   eventID,
	}, nil
}

func getResumeInfo(opts ...tool.Option) (*entity.ResumeRequest, bool, error) {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	id := opt.resumeID
	if len(id) > 0 {
		rInfo, err := parseResumeID(id)
		if err != nil {
			return nil, false, err
		}

		rInfo.ResumeData = opt.resumeData

		return rInfo, true, nil
	}

	return nil, false, nil
}

func getIntermediateStreamWriter(opts ...tool.Option) *schema.StreamWriter[*entity.Message] {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.sw
}
