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
from urllib.parse import urlparse, urlunparse
import aiohttp
import websockets
from fastapi import HTTPException, WebSocket, WebSocketDisconnect


async def websocket_endpoint(websocket: WebSocket, page_id: str, port: str):
    await websocket.accept()

    try:
        # Construct the WebSocket URL for the specific page
        ws_url = f"ws://127.0.0.1:{port}/devtools/page/{page_id}"

        # Establish a connection to the CDP WebSocket
        async with websockets.connect(ws_url) as cdp_socket:
            # Create tasks for bidirectional communication
            receive_task = asyncio.create_task(
                receive_from_cdp(cdp_socket, websocket))
            send_task = asyncio.create_task(send_to_cdp(cdp_socket, websocket))

            # Wait for either task to complete
            done, pending = await asyncio.wait(
                [receive_task, send_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            # Cancel any remaining tasks
            for task in pending:
                task.cancel()

    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        await websocket.close()


async def websocket_browser_endpoint(websocket: WebSocket, browser_id: str, port: str):
    await websocket.accept()

    try:
        # Construct the WebSocket URL for the specific page
        ws_url = f"ws://0.0.0.0:{port}/devtools/browser/{browser_id}"

        # Establish a connection to the CDP WebSocket
        async with websockets.connect(ws_url) as cdp_socket:
            # Create tasks for bidirectional communication
            receive_task = asyncio.create_task(
                receive_from_cdp(cdp_socket, websocket))
            send_task = asyncio.create_task(send_to_cdp(cdp_socket, websocket))

            # Wait for either task to complete
            done, pending = await asyncio.wait(
                [receive_task, send_task],
                return_when=asyncio.FIRST_COMPLETED
            )

            # Cancel any remaining tasks
            for task in pending:
                task.cancel()

    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        await websocket.close()


async def receive_from_cdp(cdp_socket, websocket):
    try:
        while True:
            message = await cdp_socket.recv()
            await websocket.send_text(message)
    except websockets.exceptions.ConnectionClosed:
        logging.info("CDP WebSocket connection closed")
    except Exception as e:
        logging.error(f"Error receiving from CDP: {e}")


async def send_to_cdp(cdp_socket, websocket):
    try:
        while True:
            message = await websocket.receive_text()
            await cdp_socket.send(message)
    except WebSocketDisconnect:
        logging.info("Client WebSocket disconnected")
    except Exception as e:
        logging.error(f"Error sending to CDP: {e}")


async def get_websocket_targets(port: str):
    endpoint = os.getenv("CDP_ENDPOINT")
    logging.info(f"Getting websocket targets for endpoint: {endpoint}")
    try:
        async with aiohttp.ClientSession() as session:
            # Use the cdp_websocket parameter to dynamically construct the URL
            base_url = f"http://127.0.0.1:{port}/json/list"
            async with session.get(base_url) as response:
                if response.status == 200:
                    result = await response.json()

                    # If result is an empty list, return it immediately
                    if not result:
                        return result

                    # Modify the URLs in the result to use the provided cdp_websocket
                    for target in result:
                        # Replace devtoolsFrontendUrl
                        if 'devtoolsFrontendUrl' in target:
                            target['devtoolsFrontendUrl'] = target['devtoolsFrontendUrl'].replace(
                                '127.0.0.1:' + str(port), str(endpoint)
                            )

                        # Replace webSocketDebuggerUrl
                        if 'webSocketDebuggerUrl' in target:
                            target['webSocketDebuggerUrl'] = target['webSocketDebuggerUrl'].replace(
                                '127.0.0.1:' + str(port), str(endpoint)
                            )

                    return result
                else:
                    raise HTTPException(
                        status_code=response.status, detail="Failed to fetch JSON list")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching JSON list: {str(e)}")


async def get_websocket_version(port: str):
    endpoint = os.getenv("CDP_ENDPOINT")
    logging.info(f"Getting websocket version for endpoint: {endpoint}")
    try:
        async with aiohttp.ClientSession() as session:
            # Use the cdp_websocket parameter to dynamically construct the URL
            base_url = f"http://127.0.0.1:{port}/json/version"
            async with session.get(base_url) as response:
                if response.status == 200:
                    result = await response.json()

                    if not result:
                        return result

                    if 'webSocketDebuggerUrl' in result:
                        result['webSocketDebuggerUrl'] = result['webSocketDebuggerUrl'].replace(
                            '127.0.0.1:' + str(port), str(endpoint)
                        )

                    return result
                else:
                    raise HTTPException(
                        status_code=response.status, detail="Failed to fetch JSON list")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching JSON list: {str(e)}")

async def get_remote_websocket_version(browser_session_endpoint: str, browser_id: str):
    endpoint = os.getenv("CDP_ENDPOINT")
    logging.info(f"Getting websocket version for endpoint: {endpoint}")
    try:
        async with aiohttp.ClientSession() as session:
            # Use the cdp_websocket parameter to dynamically construct the URL
            base_url = f"{browser_session_endpoint}/{browser_id}/json/version"
            async with session.get(base_url) as response:
                if response.status == 200:
                    result = await response.json()
                    return result
                else:
                    raise HTTPException(
                        status_code=response.status, detail="Failed to fetch JSON version")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching JSON list: {str(e)}")


async def get_inspector(url):
    endpoint = os.getenv("CDP_ENDPOINT")
    logging.info(f"Getting websocket targets for endpoint: {endpoint}")

    # Convert Starlette URL to string
    url_str = str(url)

    # like this: http://127.0.0.1:8000/devtools/inspector.html?ws=scqevor9btoi2t6dnkcpg.apigateway-cn-beijing.volceapi.com/devtools/page/7D574C7E6237CB326E385DD2C3A5C845
    logging.info(f"Getting original inspector for URL: {url_str}")

    # Parse the URL
    parsed_url = urlparse(url_str)

    # Check if the current domain matches the endpoint
    if parsed_url.netloc == endpoint:
        # Replace only the netloc
        modified_url = parsed_url._replace(netloc="127.0.0.1:9222")
        url_str = urlunparse(modified_url)

    logging.info(f"Converted inspector for URL: {url_str}")

    # if parsed_url contains "127.0.0.1:9222", run a 301 redirect
    if "127.0.0.1" in parsed_url.netloc:
        url_str = url_str.replace("127.0.0.1:9222", endpoint)
        logging.info(f"Redirecting to: {url_str}")
        return await get_inspector(url_str)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url_str) as response:
                if response.status == 200:
                    # Check content type
                    content_type = response.headers.get(
                        'Content-Type', '').lower()

                    if 'application/json' not in content_type:
                        # If not JSON, read the content
                        content = await response.text()
                        logging.error(
                            f"Unexpected content type: {content_type}")
                        logging.error(f"Response content: {content[:500]}")

                        return {
                            "status": "error",
                            "content_type": content_type,
                            "content": content
                        }

                    result = await response.json()
                    return result
                else:
                    raise HTTPException(
                        status_code=response.status, detail="Failed to fetch inspector")
    except Exception as e:
        logging.error(f"Error fetching inspector: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching inspector: {str(e)}")
