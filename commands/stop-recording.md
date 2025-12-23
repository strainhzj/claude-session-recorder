---
name: stop-recording
description: 停止记录当前Claude会话
allowed-tools: [Bash]
---

# 停止记录会话

## 功能说明
此命令用于结束当前会话的记录并保存会话文件。

## 执行步骤
1. 结束当前活跃的记录会话
2. 保存会话文件，包含结束时间
3. 显示会话文件位置和基本信息

## Claude执行指令
1. 运行以下命令结束会话：
   ```bash
   bash "C:\\software\\full_stack\\claude-context-record\\claude-session-recorder\\hooks\\scripts\\session-recorder.sh" end-session
   ```

2. 向用户显示：
   - 会话已结束
   - 会话文件位置
   - 提示用户可以在 `./claude-sessions/` 目录中查看所有记录

## 注意事项
- 结束会话后，下次用户输入将自动创建新的会话文件
- 旧会话文件会永久保存在 sessions 目录中
- 可以使用文件管理器或文本编辑器查看 JSON 格式的会话记录