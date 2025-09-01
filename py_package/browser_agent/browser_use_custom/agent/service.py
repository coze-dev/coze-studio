from browser_use import Agent

class MyAgent(Agent):
    # browser use 0.2.5版本 移除模型检测
	def _test_tool_calling_method(self, method: str) -> bool:
		return True