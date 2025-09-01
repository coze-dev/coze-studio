from pydantic import BaseModel
from browser_agent.index import RunBrowserUseAgentCtx,LLMConfig
from typing import AsyncGenerator,Dict,Optional
from abc import ABC, abstractmethod
from datetime import datetime
from stream_helper.schema import SSEData
from langchain_core.language_models.chat_models import BaseChatModel
class BrowserAgentBase(BaseModel,ABC):
    query: str
    conversation_id: str = ''
    llm: BaseChatModel
    browser_session_endpoint: str
    endpoint_header: Dict[str, str] = {}
    max_steps: int = 20
    system_prompt: str = None
    extend_prompt: str = None
    @abstractmethod
    async def save_cookies(self):
        pass
    
    @abstractmethod
    async def get_llm(self)->BaseChatModel:
        pass
    
    @abstractmethod
    async def get_system_prompt(self)->str:
        pass
    
    async def run(self)->AsyncGenerator[SSEData,None]:
        pass
