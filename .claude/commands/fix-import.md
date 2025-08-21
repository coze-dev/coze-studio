# 项目自定义命令

## `/fix-import` - 自动修复导包问题

快速诊断和修复前端包导入解析问题的完整流程命令。

**使用方式**：
```
/fix-import [package_name] [target_app]
```

**示例**：
```
/fix-import @coze-arch/bot-space-api @coze-studio/app
/fix-import @coze-arch/bot-api coze-studio
```

**自动执行步骤**：

### 1. 🔍 **问题诊断阶段**
- 检查包是否存在于 `frontend/packages/` 下
- 验证目标应用的 `package.json` 依赖配置
- 分析构建错误日志中的具体模块解析失败原因
- 检查包的 `package.json` 的 `main`, `exports` 配置

### 2. 🛠️ **自动修复阶段**
- **添加依赖关系**：自动添加缺失的包到目标应用依赖中
- **Node.js版本处理**：自动切换到项目要求的Node.js版本（>=21）
- **依赖更新**：运行 `rush update` 更新lockfile
- **包配置修复**：修复包的 `package.json` 模块类型配置

### 3. 🔧 **代码修复阶段**
- **导入语句分析**：检查代码中的import语句是否正确
- **API适配修复**：
  - 替换不存在的函数名（如 `listModels` → `getSpaceModelList`）
  - 修正类型导入（如 `ModelDetailOutput` → `SpaceModelItem`）
  - 调整API调用方式适配新的接口签名
- **类型转换处理**：添加必要的数据类型转换逻辑

### 4. ✅ **验证测试阶段**
- 运行 `rush build -t [target_app]` 验证修复效果
- 检查TypeScript类型检查是否通过
- 确认所有导入都能正确解析

**处理的常见问题**：
- `Module not found: Can't resolve 'package-name'`
- `nodeSupportedVersionRange=">=21"` Node.js版本要求
- 包依赖缺失或配置错误
- API函数名称变更导致的导入失败
- TypeScript类型不匹配

**生成的修复报告**：
```
✅ 包依赖已添加: @coze-arch/bot-space-api → @coze-studio/app
✅ Node.js版本已切换: v20.12.2 → v22.18.0  
✅ 依赖更新完成: rush update (57.91 seconds)
✅ 代码修复完成: 3处导入语句已修正
✅ 构建验证通过: @coze-studio/app

🔗 详细修复日志已保存到: .claude/fix-import-[timestamp].log
```

## `/diagnose-build` - 构建问题诊断

快速诊断Rush项目构建失败的根本原因。

**使用方式**：
```
/diagnose-build [target_package]
```

**诊断内容**：
- 依赖关系冲突检查
- Node.js版本兼容性
- 包配置完整性验证
- 常见构建错误模式识别

## `/node-upgrade` - Node.js版本管理

自动处理项目Node.js版本要求。

**使用方式**：
```
/node-upgrade [version]
```

**功能**：
- 自动检测项目要求的Node.js版本
- 使用nvm切换到合适版本
- 重新安装项目依赖
- 验证版本兼容性