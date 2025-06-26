import asyncio
import sys
import json
from crawl4ai import *

async def main(url):
    browser_config = BrowserConfig(
       headless=True,
       viewport_width=1280,
       viewport_height=720,
       user_agent_mode="random",
       text_mode=False,
    )
    run_config = CrawlerRunConfig(
       cache_mode=CacheMode.DISABLED,
       markdown_generator=DefaultMarkdownGenerator(),
    )
    async with AsyncWebCrawler(browser_config=browser_config, run_config=run_config, thread_safe=True) as crawler:
        result = await crawler.arun(url=url, config=run_config)
        # 输出json字符串
        print(json.dumps({
            "content": result.markdown,
            # 可以加上其他需要的字段
        }))

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else ''
    if not url:
        print(json.dumps({"error": "url is required"}))
        sys.exit(1)
    asyncio.run(main(url))