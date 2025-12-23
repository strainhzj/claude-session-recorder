---
name: start-recording
description: 开始记录Claude会话
allowed-tools: [Bash, Read]
---

# 开始记录会话

## 功能说明
此命令用于确保会话记录功能已激活。在新版本中，记录功能通过 hooks 自动触发，此命令用于检查当前记录状态。

## 执行步骤
1. 检查当前是否有活跃的记录会话
2. 读取配置文件中的会话状态
3. 向用户确认记录状态

## Claude执行指令
1. 读取当前会话状态文件：
   ```bash
   cat "C:\software\full_stack\claude-context-record\claude-session-recorder\config\.current-session" 2>/dev/null
   ```

2. 如果存在会话 ID，读取对应的会话文件：
   - 使用会话 ID 构建 session 文件路径
   - 使用 Read 工具读取会话信息
   - 显示会话开始时间和记录条数

3. 如果没有活跃会话，说明下次用户输入时将自动创建新会话

4. 向用户返回确认信息

## 注意事项
- 会话文件保存在 `sessions/` 目录下
- 文件命名格式：`conversation-YYYY-MM-DD_HH-MM-SS.json`
- Hook 可执行文件位于 `hooks-bin/` 目录
- TypeScript 实现自动处理会话创建和管理
