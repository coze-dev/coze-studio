package agentflow

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent/entity"
	workflowEntity "code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"github.com/cloudwego/eino/schema"
	"github.com/google/uuid"
)

func (r *AgentRunner) chatflowStreamExecute(ctx context.Context, req *AgentRequest) (
	sr *schema.StreamReader[*entity.AgentEvent], err error,
) {
	executeID := uuid.New()
	reader, err := r.chatflowRunner.Invoke(ctx, req)
	if err != nil {
		return nil, err
	}

	return sw, nil
}

func convertWorkflowMsg2AgentEvent(workflowID int64) func(msg *workflowEntity.Message) (res *entity.AgentEvent, err error) {
	// todo：待实现
	var (
		messageID int
		// executeID  int64
		// spaceID    int64
		// nodeID2Seq = make(map[string]int)
	)
	return func(msg *workflowEntity.Message) (res *entity.AgentEvent, err error) {
		defer func() {
			if err == nil {
				messageID++
			}
		}()
		return nil, nil
	}

}
