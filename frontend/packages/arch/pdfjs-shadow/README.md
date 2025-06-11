# @coze-arch/pdfjs-shadow

## Description

原始的 pdfjs-dist 包兼容性过低，需要重新编译，增加 polyfill 之后才能正常运行，因此设计该 package，主要作用：

1. 收敛 pdfjs-dist 调用，避免 bot 环境中多出定义 pdfjs-dist 版本；
2. 收敛 worker src url 的计算逻辑。

注意，该 package 仅供 coze 消费。
