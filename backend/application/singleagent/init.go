package singleagent

import "code.byted.org/flow/opencoze/backend/domain/agent/singleagent"

var singleAgentDomainSVC singleagent.SingleAgent

type SingleAgent = singleagent.SingleAgent

func InjectService() {
	// TODO
}

func GetSingleAgentDomainSVC() singleagent.SingleAgent {
	return singleAgentDomainSVC
}
