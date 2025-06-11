export const isMobileFromUA = () => {
  const { userAgent } = navigator;
  // 检查是否为移动设备
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent,
  );
};
