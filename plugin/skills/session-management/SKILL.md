---
name: session-management
description: 会话管理和记录的最佳实践
version: 2.0.0
---

# 会话管理技能

此技能提供Claude Code CLI会话记录和管理的最佳实践指导。插件使用 TypeScript 实现并通过 pkg 打包为独立可执行文件。

## 何时使用

当用户询问以下问题时使用此技能：
- "如何查看我的对话历史？"
- "会话记录保存在哪里？"
- "如何导出我的Claude对话？"
- "会话文件格式是什么？"
- "如何搜索历史对话？"
- "备份和迁移会话记录"
- "如何构建或打包插件？"

## 技术架构

### 核心技术栈
- **TypeScript 5.x** - 类型安全的业务逻辑
- **Node.js 18+** - 运行时环境
- **pkg** - 打包为独立可执行文件
- **pathe** - 跨平台路径处理

### 目录结构
```
claude-session-recorder/
├── src/                        # TypeScript 源码
│   ├── core/                   # 核心业务逻辑
│   ├── hooks/                  # Hook 处理器
│   ├── utils/                  # 工具函数
│   └── types/                  # 类型定义
├── dist/                       # 编译输出
├── hooks-bin/                  # Hook 可执行文件 (pkg 打包)
├── sessions/                   # 会话数据存储
├── config/                     # 配置文件
└── hooks/                      # Hook 配置
```

## 会话记录概述

Claude Session Recorder插件通过 hooks 自动捕获并保存您的所有会话内容，包括：
- 用户输入的提示词 (UserPromptSubmit hook)
- 工具调用的完整结果 (PostToolUse hook)
- 精确的时间戳
- 会话生命周期管理 (SessionEnd hook)

### Hook 可执行文件

插件提供三个跨平台的 Hook 可执行文件：
- `hooks-bin/user-prompt-hook` - 捕获用户提示
- `hooks-bin/tool-result-hook` - 捕获工具结果
- `hooks-bin/session-end-hook` - 处理会话结束

这些文件由 TypeScript 源码通过 pkg 打包生成，无需 Node.js 运行时即可执行。

## 文件管理

### 默认存储位置
会话文件保存在 `./sessions/` 目录中，文件命名格式为：
```
conversation-YYYY-MM-DD_HH-MM-SS.json
```

### 会话文件结构
每个JSON文件包含：
```json
{
  "sessionId": "2024-01-01_10-00-00",
  "startTime": "2024-01-01T10:00:00.000Z",
  "endTime": "2024-01-01T10:30:00.000Z",
  "prompts": [
    {
      "timestamp": "2024-01-01T10:01:00.000Z",
      "text": "用户提示内容"
    }
  ],
  "responses": [
    {
      "type": "assistant",
      "text": "Claude的回复",
      "timestamp": "2024-01-01T10:01:05.000Z"
    },
    {
      "type": "tool",
      "toolName": "Bash",
      "result": "工具执行结果",
      "timestamp": "2024-01-01T10:01:10.000Z"
    }
  ]
}
```

## 最佳实践

### 1. 构建和打包
TypeScript 源码需要编译和打包：
```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 打包 Hook 可执行文件
npm run package
```

### 2. 定期备份
建议定期备份sessions目录：
```bash
# 创建备份
cp -r ./sessions/ /path/to/backup/sessions-$(date +%Y%m%d)

# 或使用压缩
tar -czf sessions-backup-$(date +%Y%m%d).tar.gz ./sessions/
```

### 3. 存储空间管理
- 监控sessions目录大小
- 定期清理旧记录（配置 retentionDays）
- 考虑将重要记录移动到其他存储位置

### 4. 隐私保护
- 会话文件可能包含敏感信息
- 如需分享，请先审查并编辑敏感内容
- 考虑加密存储敏感会话

### 5. 搜索技巧
使用jq工具搜索会话内容：
```bash
# 搜索包含特定关键词的提示
jq '.prompts[] | select(.text | contains("关键词"))' sessions/*.json

# 查找特定日期的会话
jq 'select(.startTime | startswith("2024-01-01"))' sessions/conversation-2024-01-01*.json
```

## 常见问题

### Q: TypeScript 编译失败怎么办？
A: 确保安装了正确的依赖：
```bash
npm install
npm run build
```

### Q: pkg 打包出错？
A: 检查 Node.js 版本和 pkg 配置：
```bash
node --version  # 应该是 18+
npm run package:hooks
```

### Q: 如何调试 Hook 可执行文件？
A: 查看日志输出或直接运行编译后的 JS 文件：
```bash
node dist/hooks/user-prompt-hook.js < test-input.json
```

### Q: 跨平台兼容性问题？
A: 使用 pathe 库处理路径，pkg 自动处理平台差异：
- Windows: user-prompt-hook.exe
- Linux/macOS: user-prompt-hook

## 相关资源

参考配置文件和源码：
- 配置模板：`config/recorder-config.json`
- TypeScript 类型：`src/types/`
- 核心逻辑：`src/core/`
- Hook 源码：`src/hooks/`
- Hook 配置：`hooks/hooks.json`
- 构建配置：`package.json`, `tsconfig.json`

这些文件展示了会话记录系统的内部工作机制，可以根据需要进行自定义配置。
