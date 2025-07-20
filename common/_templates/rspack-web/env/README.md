# 环境变量
## 配置
index.ts 文件中配置环境变量，可根据多环境（地区）的环境变量可分别设置相关变量。

# 注意事项
## dts 自动生成约定
- src/typings/env/index.d.ts 由脚本自动更新
- 类型来源：env/index.ts 文件中的 envs 变量，请确保新增的环境变量都作为 envs 的一组 key-value

