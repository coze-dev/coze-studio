package execute

import (
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type workflowToolOption struct {
	resumeReq            *entity.ResumeRequest
	sw                   *schema.StreamWriter[*entity.Message]
	exeCfg               vo.ExecuteConfig
	allInterruptEvents   map[string]*entity.ToolInterruptEvent
	parentTokenCollector *TokenCollector
}

func WithResume(req *entity.ResumeRequest, all map[string]*entity.ToolInterruptEvent) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.resumeReq = req
		opts.allInterruptEvents = all
	})
}

func WithIntermediateStreamWriter(sw *schema.StreamWriter[*entity.Message]) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.sw = sw
	})
}

func WithExecuteConfig(cfg vo.ExecuteConfig) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.exeCfg = cfg
	})
}

func GetResumeRequest(opts ...tool.Option) (*entity.ResumeRequest, map[string]*entity.ToolInterruptEvent) {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.resumeReq, opt.allInterruptEvents
}

func GetIntermediateStreamWriter(opts ...tool.Option) *schema.StreamWriter[*entity.Message] {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.sw
}

func GetExecuteConfig(opts ...tool.Option) vo.ExecuteConfig {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.exeCfg
}

// WithMessagePipe returns an Option which is meant to be passed to the tool workflow, as well as a StreamReader to read the messages from the tool workflow.
// This Option will apply to ALL workflow tools to be executed by eino's ToolsNode. The workflow tools will emit messages to this stream.
// The caller can receive from the returned StreamReader to get the messages from the tool workflow.
func WithMessagePipe() (compose.Option, *schema.StreamReader[*entity.Message]) {
	sr, sw := schema.Pipe[*entity.Message](10)
	opt := compose.WithToolsNodeOption(compose.WithToolOption(WithIntermediateStreamWriter(sw)))
	return opt, sr
}
