package execute

import (
	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
)

type workflowToolOption struct {
	resumeReq *entity.ResumeRequest
	sw        *schema.StreamWriter[*entity.Message]
}

func WithResume(req *entity.ResumeRequest) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.resumeReq = req
	})
}

func WithIntermediateStreamWriter(sw *schema.StreamWriter[*entity.Message]) tool.Option {
	return tool.WrapImplSpecificOptFn(func(opts *workflowToolOption) {
		opts.sw = sw
	})
}

func GetResumeRequest(opts ...tool.Option) *entity.ResumeRequest {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.resumeReq
}

func GetIntermediateStreamWriter(opts ...tool.Option) *schema.StreamWriter[*entity.Message] {
	opt := tool.GetImplSpecificOptions(&workflowToolOption{}, opts...)
	return opt.sw
}
