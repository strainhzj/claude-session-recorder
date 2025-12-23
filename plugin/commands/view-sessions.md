---
name: view-sessions
description: 查看所有记录的会话文件
allowed-tools: [Bash, Read]
---

# 查看会话记录

## 功能说明
此命令用于列出所有已保存的会话记录文件，并可以选择查看特定会话的内容。

## 执行步骤
1. 列出 sessions 目录中的所有会话文件
2. 按时间排序显示
3. 如果用户需要，可以查看特定会话的详细内容

## Claude执行指令
1. 运行以下命令列出所有会话文件：
   ```bash
   ls -la "C:\software\full_stack\claude-context-record\claude-session-recorder\sessions\conversation-*.json" 2>/dev/null
   ```

2. 如果用户想要查看特定会话：
   - 询问用户要查看哪个会话文件
   - 使用 Read 工具读取该文件
   - 提供会话的基本信息：
     - sessionId: 会话唯一标识
     - startTime: 会话开始时间
     - endTime: 会话结束时间
     - prompts: 用户提示数量
     - responses: 响应数量

3. 显示会话文件的存储位置和命名规则

## 会话文件格式说明
每个会话文件包含以下信息：
- sessionId: 会话唯一标识
- startTime: 会话开始时间 (ISO 8601)
- endTime: 会话结束时间 (ISO 8601), null 表示进行中
- prompts: 用户提示列表
  - timestamp: 时间戳
  - text: 提示文本
- responses: 响应列表
  - type: 'assistant' 或 'tool'
  - text: 助手回复文本 (type='assistant')
  - toolName: 工具名称 (type='tool')
  - result: 工具执行结果 (type='tool')
  - timestamp: 时间戳

## 注意事项
- 会话文件以 JSON 格式存储
- 按创建时间排序，最新的在前
- 可以使用任何 JSON 查看器或文本编辑器打开
- TypeScript 实现确保跨平台兼容性
