---
name: stop-recording
description: 停止记录当前Claude会话
allowed-tools: [Bash, Read, Write]
---

# 停止记录会话

## 功能说明
此命令用于结束当前会话的记录并保存会话文件。

## 执行步骤
1. 检查是否有活跃的记录会话
2. 如果有，执行会话结束逻辑
3. 显示会话文件位置和基本信息

## Claude执行指令
1. 读取当前会话状态：
   ```bash
   cat "C:\software\full_stack\claude-context-record/claude-session-recorder\config\.current-session" 2>/dev/null
   ```

2. 如果存在活跃会话：
   - 使用会话 ID 构建 session 文件路径
   - 使用 Read 工具读取会话信息
   - 使用 Write 工具更新会话，添加 endTime
   - 删除 `.current-session` 状态文件：
     ```bash
     rm "C:\software\full_stack\claude-context-record\claude-session-recorder\config\.current-session"
     ```

3. 向用户显示：
   - 会话已结束
   - 会话文件位置
   - 会话基本信息（开始时间、提示数量、响应数量）

## 注意事项
- 结束会话后，下次用户输入将自动创建新的会话文件
- 旧会话文件会永久保存在 sessions 目录中
- 会话文件为 JSON 格式，可用文本编辑器查看
- hooks-bin 目录中的 session-end-hook 也会在会话结束时自动执行
