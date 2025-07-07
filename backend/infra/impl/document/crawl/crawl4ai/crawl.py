import asyncio
import sys
import json
from crawl4ai import *
import os

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
    async with AsyncWebCrawler(config=browser_config, thread_safe=True) as crawler:
        result = await crawler.arun(url=url, config=run_config)
        w = os.fdopen(3, "wb", )
        internal_raw = result.links.get('internal', [])
        external_raw = result.links.get('external', [])
        internal_links = [item.get('href', '') for item in internal_raw if 'href' in item]
        external_links = [item.get('href', '') for item in external_raw if 'href' in item]
        outputs = json.dumps({
            "content": result.markdown,
            "internal": internal_links,
            "external": external_links,
        }, ensure_ascii=False)
        w.write(str.encode(outputs))
        w.flush()
        w.close()

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else ''
    if not url:
        w = os.fdopen(3, "wb", )
        result = json.dumps({"error": "url is required"}, ensure_ascii=False)
        w.write(str.encode(result))
        w.flush()
        w.close()
        sys.exit(1)
    asyncio.run(main(url))