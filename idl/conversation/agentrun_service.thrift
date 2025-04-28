
include "./run.thrift"
namespace go agentrun_service

service AgentRunService {
    run.AgentRunResponse AgentRun(1: run.AgentRunRequest request)(api.post='/api/conversation/chat', api.category="conversation", api.gen_path= "agent_run")
}