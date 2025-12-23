---
name: start-recording
description: 开始记录Claude会话
allowed-tools: [Bash]
---

# 开始记录会话

## 功能说明
此命令用于开始或恢复记录Claude Code CLI会话。由于插件配置为自动记录，此命令主要用于确保记录功能已激活。

## 执行步骤
1. 检查当前是否有活跃的记录会话
2. 如果没有，则创建新的会话文件
3. 向用户确认记录已开始

## Claude执行指令
1. 运行以下命令检查记录状态：
   ```bash
   bash "C:\\software\\full_stack\\claude-context-record\\claude-session-recorder\\hooks\\scripts\\session-recorder.sh" get-session-file
   ```

2. 如果返回文件路径，说明已在记录中
3. 如果没有返回，则运行：
   ```bash
   bash "C:\\software\\full_stack\\claude-context-record\\claude-session-recorder\\hooks\\scripts\\session-recorder.sh" record-prompt "开始新的记录会话"
   ```

4. 向用户返回确认信息，包括会话文件名

## 注意事项
- 会话文件保存在 `./claude-sessions/` 目录下
- 文件命名格式：`conversation-YYYY-MM-DD_HH-MM-SS.json`
- 记录包含用户提示、工具调用结果和助手回复