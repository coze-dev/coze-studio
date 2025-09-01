# Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
# Licensed under the 【火山方舟】原型应用软件自用许可协议
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at 
#     https://www.volcengine.com/docs/82379/1433703
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import io
import logging
from typing import Optional, Tuple
from PIL import Image, ImageChops
import numpy as np
from pydantic import BaseModel
import logging
import asyncio
import re
import markdownify
from bs4 import BeautifulSoup
from typing import Optional
from browser_use.browser import BrowserSession
from browser_use.controller.views import SearchGoogleAction
from browser_use.agent.views import ActionResult
from browser_use.controller.service import Controller
from playwright.async_api import Page
from pydantic import BaseModel,Field
from langchain_core.language_models.chat_models import BaseChatModel
from browser_agent.browser_use_custom.i18n import _
from langchain_core.prompts import PromptTemplate
from browser_agent.browser_use_custom.controller.screen import VisualChangeDetector,wait_for_visual_change,WaitForVisualChangeAction

logger = logging.getLogger(__name__)

class PauseAction(BaseModel):
    reason: str
    
class WaitForLoginAction(BaseModel):
    """Action parameters for waiting for login completion."""
    timeout: int = Field(
        default=300,
        description="Maximum time to wait for login completion in seconds"
    )
    check_interval: int = Field(
        default=5,
        description="Interval between checks for URL changes in seconds"
    )

class MyController(Controller):
    """Custom controller extending base Controller with additional actions.
    
    Features:
    - Inherits core controller functionality
    - Adds custom pause action handler
    - Maintains action registry with exclusion support
    """

    def __init__(
        self,
        exclude_actions: list[str] = [],
        output_model: type[BaseModel] | None = None,
    ):
        super().__init__(exclude_actions, output_model)
        # Basic Navigation Actions
        @self.registry.action(
            _('Search the query in Baidu in the current tab, the query should be a search query like humans search in Baidu, concrete and not vague or super long. More the single most important items.'),
            param_model=SearchGoogleAction,
        )
        async def search_google(params: SearchGoogleAction, browser_session: BrowserSession):
            search_url = f'https://www.baidu.com/s?wd={params.query}'
            
            page = await browser_session.get_current_page()
            await page.goto(search_url)
            await page.wait_for_load_state()
            msg = _('🔍 Searched for "{query}" in Baidu').format(query=params.query)
            logger.info(msg)
            return ActionResult(extracted_content=msg, include_in_memory=True)
        # Content Actions
        @self.registry.action(
            _('Extract page content to retrieve specific information from the page, e.g. all company names, a specific description, all information about xyc, 4 links with companies in structured format. Use include_links true if the goal requires links'),
        )
        async def extract_content(
            goal: str,
            page: Page,
            page_extraction_llm: BaseChatModel,
            include_links: bool = False,
        ):
            raw_content = await page.content()
            soup = BeautifulSoup(
                raw_content, 'html.parser')
            # remove all unnecessary http metadata
            for s in soup.select('script'):
                s.decompose()
            for s in soup.select('style'):
                s.decompose()
            for s in soup.select('textarea'):
                s.decompose()
            for s in soup.select('img'):
                s.decompose()
            for s in soup.find_all(style=re.compile("background-image.*")):
                s.decompose()
            content = markdownify.markdownify(str(soup))

            # manually append iframe text into the content so it's readable by the LLM (includes cross-origin iframes)
            for iframe in page.frames:
                if iframe.url != page.url and not iframe.url.startswith('data:'):
                    content += f'\n\nIFRAME {iframe.url}:\n'
                    content += markdownify.markdownify(await iframe.content())

            prompt = _('Your task is to extract the content of the page. You will be given a page and a goal and you should extract all relevant information around this goal from the page. If the goal is vague, summarize the page. Respond in json format. Extraction goal: {goal}, Page: {page}')
            template = PromptTemplate(input_variables=['goal', 'page'], template=prompt)
            try:
                output = await page_extraction_llm.ainvoke(template.format(goal=goal, page=content))
                msg = _('📄 Extracted from page\n: {content}\n').format(content=output.content)
                logger.info(msg)
                return ActionResult(extracted_content=msg, include_in_memory=True)
            except Exception as e:
                logger.debug(_('Error extracting content: {error}').format(error=e))
                msg = _('📄 Extracted from page\n: {content}\n').format(content=content)
                logger.info(msg)
                return ActionResult(extracted_content=msg)
        
        @self.registry.action(
            _('Pause agent'),
            param_model=PauseAction,
        )
        async def pause(params: PauseAction):
            msg = _('👩 Pause agent, reason: {reason}').format(reason=params.reason)
            logger.info(msg)
            return ActionResult(extracted_content=msg, include_in_memory=True)
        # Login detection and waiting action
        # @self.registry.action(
        #     _('Detects if current page requires login and waits for authentication to complete.Wait for login completion by monitoring URL changes.'),
        #     param_model=WaitForLoginAction,
        # )
        # async def wait_for_login(params: WaitForLoginAction, browser_session: BrowserSession):
        #     page = await browser_session.get_current_page()
            
        #     # Get initial URL for comparison
        #     initial_url = page.url
        #     logger.info(_('🔐 Starting login detection. Initial URL: {url}').format(url=initial_url))
            
        #     # Wait for URL change indicating login completion
        #     msg = _('🔐 Login page detected. Waiting for authentication completion (max {timeout}s)...').format(
        #         timeout=params.timeout
        #     )
        #     logger.info(msg)
            
        #     final_url = await self._wait_for_url_change(
        #         page, 
        #         initial_url, 
        #         params.timeout, 
        #         params.check_interval
        #     )
            
        #     if final_url and final_url != initial_url:
        #         success_msg = _('✅ Login completed successfully! URL changed from {initial} to {final}').format(
        #             initial=initial_url, 
        #             final=final_url
        #         )
        #         logger.info(success_msg)
        #         return ActionResult(
        #             extracted_content=success_msg,
        #             include_in_memory=True,
        #             success=True
        #         )
        #     else:
        #         timeout_msg = _('⏰ Login timeout or no URL change detected after {timeout} seconds').format(
        #             timeout=params.timeout
        #         )
        #         logger.warning(timeout_msg)
        #         return ActionResult(
        #             extracted_content=timeout_msg,
        #             include_in_memory=True,
        #             success=False
        #         )
    
    # async def _wait_for_url_change(
    #     self, 
    #     page: Page, 
    #     initial_url: str, 
    #     timeout: int, 
    #     check_interval: int
    # ) -> Optional[str]:
    #     """Wait for URL change indicating login completion."""
    #     start_time = asyncio.get_event_loop().time()
        
    #     while (asyncio.get_event_loop().time() - start_time) < timeout:
    #         try:
    #             current_url = page.url
                
    #             # If URL has changed, return the new URL
    #             if current_url != initial_url:
    #                 return current_url
                
    #             # Wait before checking again
    #             await asyncio.sleep(check_interval)
                
    #         except Exception as e:
    #             logger.warning(_('Error checking URL change: {error}').format(error=str(e)))
    #             await asyncio.sleep(check_interval)
        
    #     return None  # Timeout reached without URL change