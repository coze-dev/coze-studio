import asyncio
import io,base64
import logging,time
from typing import Optional, Tuple
from PIL import Image, ImageChops
import numpy as np
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class VisualChangeDetector:
    """视觉变化检测器（基于屏幕截图比对）"""
    
    def __init__(
        self,
        similarity_threshold: float = 0.95,
        pixel_change_threshold: int = 1000,
        resize_width: Optional[int] = 800
    ):
        """
        Args:
            similarity_threshold: 相似度阈值（0-1）
            pixel_change_threshold: 变化像素数量阈值
            resize_width: 缩放宽度（提升性能）
        """
        self.similarity_threshold = similarity_threshold
        self.pixel_threshold = pixel_change_threshold
        self.resize_width = resize_width

    async def capture_screenshot(self, page, upload_service=None,logger=None) -> Image.Image:
        """捕获页面截图（自动优化）"""
        screenshot_bytes = await page.screenshot(timeout=10000,type='jpeg',quality=50,full_page=False,animations='disabled')
        img = Image.open(io.BytesIO(screenshot_bytes))
        
        # 统一缩放尺寸（提升比对性能）
        if self.resize_width:
            w, h = img.size
            new_h = int(h * (self.resize_width / w))
            img = img.resize((self.resize_width, new_h))
        if upload_service:
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            binary_data = img_byte_arr.getvalue()
            if not binary_data:
                return
            file_name = f"screenshot_{int(time.time())}.jpg"
            base64_str = base64.b64encode(binary_data).decode('ascii')
            if logger:
                logger.info(f'upload screenshot to {file_name}')
            else:
                logging.info(f'upload screenshot to {file_name}')
            try:
                await upload_service.upload_file('',file_name,base64_content=base64_str)
            except Exception as e:
                if logger:
                    logger.error(f"Failed to upload screenshot to {file_name}: {e}")
                else:
                    logging.error(f"Failed to upload screenshot to {file_name}: {e}")
                return img.convert('RGB')
        return img.convert('RGB')  # 确保RGB模式

    def calculate_change(
        self, 
        img1: Image.Image, 
        img2: Image.Image
    ) -> Tuple[float, Image.Image]:
        """
        计算两图差异
        
        Returns:
            tuple: (相似度百分比, 差异图)
        """
        # 确保尺寸一致
        if img1.size != img2.size:
            img2 = img2.resize(img1.size)
        
        arr1 = np.array(img1)  # shape: (height, width, 3)
        arr2 = np.array(img2)  # shape: (height, width, 3)

        # 计算绝对差异（每个通道单独计算）
        diff = np.abs(arr1.astype(int) - arr2.astype(int))

        # 变化像素计算（任一通道有变化即视为该像素变化）
        # 先检查每个像素的3个通道是否有变化
        pixel_changed = np.any(diff > 0, axis=2)  # shape: (height, width)
        changed_pixels = np.sum(pixel_changed)    # 变化像素总数

        # 总像素数（不需要除以3，因为pixel_changed已经是像素级别的判断）
        total_pixels = arr1.shape[0] * arr1.shape[1]

        # 生成差异图（可视化用）
        diff_img = ImageChops.difference(img1, img2)

        # 计算相似度
        similarity = 1 - (changed_pixels / total_pixels)

        return similarity, diff_img

    async def detect_change(
        self,
        browser_session,
        reference_img: Optional[Image.Image] = None,
        max_attempts: int = 5,
        attempt_interval: float = 1.5,
        upload_service = None,
        logger = None
    ) -> Tuple[bool, Optional[Image.Image], Optional[Image.Image]]:
        """
        检测视觉变化
        
        Args:
            page: 浏览器页面对象
            reference_img: 基准截图（None则自动捕获）
            max_attempts: 最大检测次数
            attempt_interval: 检测间隔（秒）
            
        Returns:
            tuple: (是否变化, 基准截图, 差异图)
        """
        # 首次捕获基准图
        if reference_img is None:
            page = await browser_session.get_current_page()
            reference_img = await self.capture_screenshot(page,upload_service=upload_service,logger=logger)
        logger.info("start detect change")
        for attempt in range(max_attempts):
            await asyncio.sleep(attempt_interval)
            
            # 捕获当前截图
            page = await browser_session.get_current_page()
            current_img = await self.capture_screenshot(page,upload_service=upload_service,logger=logger)
            if not current_img:
                logger.error(f"Failed to capture screenshot on attempt {attempt + 1}")
                continue
            # 计算变化
            similarity, diff_img = self.calculate_change(reference_img, current_img)
            logger.info(f"Attempt {attempt + 1}: 相似度 {similarity:.2f}, 变化像素 {np.sum(np.array(diff_img) > 0)}")
            # 判断是否显著变化
            if similarity < self.similarity_threshold:
                diff_pixels = np.sum(np.array(diff_img) > 0)
                if diff_pixels > self.pixel_threshold:
                    logger.info(f"视觉变化 detected (相似度: {similarity:.2f}, 变化像素: {diff_pixels})")
                    return True, reference_img, diff_img
        
        return False, reference_img, None

class WaitForVisualChangeAction(BaseModel):
    """等待视觉变化的参数模型"""
    timeout: int = 30
    check_interval: float = 2
    similarity_threshold: float = 0.95
    pixel_threshold: int = 5000

async def wait_for_visual_change(
    params: WaitForVisualChangeAction,
    browser_session,
    initial_screenshot: Optional[Image.Image] = None,
    upload_service = None,
    logger = None
) -> Tuple[bool, Optional[Image.Image], Optional[Image.Image]]:
    """
    等待页面视觉变化（完整工作流）
    
    Args:
        params: 配置参数
        browser_session: 浏览器会话
        initial_screenshot: 初始截图（可选）
        
    Returns:
        tuple: (是否变化, 初始截图, 差异图)
    """
    detector = VisualChangeDetector(
        similarity_threshold=params.similarity_threshold,
        pixel_change_threshold=params.pixel_threshold
    )
    
    max_attempts = int(params.timeout / params.check_interval)
    
    return await detector.detect_change(
        browser_session=browser_session,
        reference_img=initial_screenshot,
        max_attempts=max_attempts,
        attempt_interval=params.check_interval,
        upload_service=upload_service,
        logger=logger,
    )