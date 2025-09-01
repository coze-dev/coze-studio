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

import asyncio
import logging
import os
import aiohttp
from playwright.async_api import async_playwright
from playwright.async_api import Browser
from playwright.async_api._generated import Playwright as AsyncPlaywright

browser_ready_event = asyncio.Event()

class BrowserWrapper:
    def __init__(self, port, browser: Browser, playwright: AsyncPlaywright, remote_browser_id: str = None, endpoint: str = None):
        self.port = port
        self.browser = browser
        self.playwright = playwright
        self.remote_browser_id = remote_browser_id
        self.endpoint = endpoint

    async def stop(self):
        if self.browser:
            logging.info(f"Closing browser on port {self.port}...")
            # try:
            #     for context in self.browser.contexts:
            #         await context.close()
            # except Exception as e:
            #     logging.error(f"Error closing contexts: {e}")
            await self.browser.close()
            logging.info(f"Browser on port {self.port} closed successfully")
        if self.playwright:
            logging.info(f"Closing playwright session {self.port}...")
            await self.playwright.stop()
            logging.info(
                f"Paywright session on port {self.port} closed successfully")
        if self.remote_browser_id and self.endpoint:
            logging.info(f"Closing remote browser {self.remote_browser_id}...")
            try:
                async with aiohttp.ClientSession() as session:
                    delete_url = f"{self.endpoint}/{self.remote_browser_id}"
                    async with session.delete(delete_url, timeout=30) as response:
                        if response.status == 200:
                            logging.info(f"Remote browser {self.remote_browser_id} closed successfully")
                        else:
                            error_text = await response.text()
                            logging.error(f"Failed to close remote browser. Status: {response.status}, Error: {error_text}")
            except Exception as e:
                logging.error(f"Error closing remote browser {self.remote_browser_id}: {e}")


async def start_local_browser(port):
    logging.info(f"Attempting to start browser on port {port}")
    p = None
    browser = None

    try:
        p = await async_playwright().start()

        w = BrowserWrapper(port, None, p)

        try:
            # Configure proxy if environment variables are set
            proxy_config = None
            proxy_server = os.getenv('PROXY_SERVER')
            if proxy_server:
                proxy_config = {
                    'server': proxy_server,
                    'bypass': '127.0.0.1,localhost'
                }

            browser = await p.chromium.launch(
                # executable_path="/opt/chromium.org/browser_use/chromium/chromium-browser-use",
                headless=False,
                args=[
                    f'--remote-debugging-port={port}',
                    '--remote-allow-origins=*',
                    '--remote-debugging-address=0.0.0.0',
                    '--no-sandbox'
                ],
                proxy=proxy_config
            )

            w = BrowserWrapper(port, browser, p)

            logging.info(f"Browser launched successfully on port {port}")

            # Verify CDP is actually running
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"http://127.0.0.1:{port}/json/version", timeout=5) as response:
                        if response.status == 200:
                            version_info = await response.json()
                            logging.info(
                                f"successfully connected to cdp: {version_info}")
                        else:
                            logging.error(
                                f"Failed to get CDP version. Status: {response.status}")
            except Exception as cdp_e:
                logging.error(f"Error checking CDP availability: {cdp_e}")

                logging.info('closing playwright driver and browser')
                await w.stop()
                raise
            return BrowserWrapper(port, browser, p)

        except Exception as launch_e:
            logging.error(f"Failed to launch browser: {launch_e}")
            browser_ready_event.clear()

            logging.info('closing playwright driver and browser')
            await w.stop()
            raise
    except Exception as p_e:
        logging.error(f"Playwright initialization error: {p_e}")
        browser_ready_event.clear()

        logging.info('closing playwright driver and browser')
        await w.stop()
        raise

async def start_remote_browser(endpoint):
    logging.info(f"Attempting to create browser via remote endpoint: {endpoint}")
    
    try:
        async with aiohttp.ClientSession() as session:
            data = {"timeout": 30}
            
            async with session.post(
                endpoint,
                json=data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    logging.info(f"Browser created successfully: {result}")
                    id_value = result.get('id', None)
                    if id_value is None:
                        result['id'] = 'id'
                    return BrowserWrapper(None, None, None, result['id'], endpoint)
                else:
                    error_text = await response.text()
                    logging.error(f"Failed to create browser. Status: {response.status}, Error: {error_text}")
                    raise Exception(f"Failed to create browser: {response.status} - {error_text}")
                    
    except Exception as e:
        logging.error(f"Error creating remote browser: {e}")
        raise    
    
