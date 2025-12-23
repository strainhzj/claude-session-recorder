---
name: session-management
description: 会话管理和记录的最佳实践
version: 1.0.0
---

# 会话管理技能

此技能提供Claude Code CLI会话记录和管理的最佳实践指导。

## 何时使用

当用户询问以下问题时使用此技能：
- "如何查看我的对话历史？"
- "会话记录保存在哪里？"
- "如何导出我的Claude对话？"
- "会话文件格式是什么？"
- "如何搜索历史对话？"
- "备份和迁移会话记录"

## 会话记录概述

Claude Session Recorder插件自动捕获并保存您的所有会话内容，包括：
- 用户输入的提示词
- Claude的响应
- 工具调用的完整结果
- 精确的时间戳

## 文件管理

### 默认存储位置
会话文件保存在 `./claude-sessions/` 目录中，文件命名格式为：
```
conversation-YYYY-MM-DD_HH-MM-SS.json
```

### 会话文件结构
每个JSON文件包含：
```json
{
  "sessionId": "唯一标识符",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:30:00Z",
  "prompts": [
    {
      "timestamp": "2024-01-01T10:01:00Z",
      "text": "用户提示内容"
    }
  ],
  "responses": [
    {
      "type": "assistant",
      "text": "Claude的回复",
      "timestamp": "2024-01-01T10:01:05Z"
    },
    {
      "type": "tool",
      "toolName": "Bash",
      "result": "工具执行结果",
      "timestamp": "2024-01-01T10:01:10Z"
    }
  ]
}
```

## 最佳实践

### 1. 定期备份
建议定期备份sessions目录：
```bash
# 创建备份
cp -r ./claude-sessions/ /path/to/backup/claude-sessions-$(date +%Y%m%d)

# 或使用压缩
tar -czf claude-sessions-backup-$(date +%Y%m%d).tar.gz ./claude-sessions/
```

### 2. 存储空间管理
- 监控sessions目录大小
- 定期清理旧记录
- 考虑将重要记录移动到其他存储位置

### 3. 隐私保护
- 会话文件可能包含敏感信息
- 如需分享，请先审查并编辑敏感内容
- 考虑加密存储敏感会话

### 4. 搜索技巧
使用jq工具搜索会话内容：
```bash
# 搜索包含特定关键词的提示
jq '.prompts[] | select(.text | contains("关键词"))' sessions/*.json

# 查找特定日期的会话
jq 'select(.startTime | startswith("2024-01-01"))' sessions/conversation-2024-01-01*.json
```

## 常见问题

### Q: 如何导出会话为Markdown格式？
A: 使用脚本转换JSON到Markdown：
```bash
# 创建转换脚本
jq -r ' "# 会话 \(.sessionId)\n\n开始时间: \(.startTime)\n结束时间: \(.endTime)\n\n## 提示历史\n\(.prompts | map("- \(.)") | join("\n"))\n\n## 响应历史\n\(.responses | map("- \(.)") | join("\n"))"' session.json
```

### Q: 可以在不同设备间同步会话记录吗？
A: 可以，通过以下方式：
- 使用云同步文件夹（如Dropbox、OneDrive）
- 使用Git仓库（注意不要提交敏感内容）
- 手动复制sessions目录

### Q: 如何清理旧的会话记录？
A: 根据时间或大小清理：
```bash
# 删除30天前的记录
find ./claude-sessions -name "conversation-*.json" -mtime +30 -delete

# 限制保留最近100个文件
ls -t ./claude-sessions/conversation-*.json | tail -n +101 | xargs rm
```

### Q: 会话记录会影响性能吗？
A: 影响极小：
- 写入操作是异步的
- JSON文件体积小
- 不会阻塞Claude的响应

## 高级用法

### 1. 会话分析
分析会话模式：
```bash
# 统计会话数量
ls ./claude-sessions/conversation-*.json | wc -l

# 分析最活跃的时间段
jq -r '.startTime | .[0:10]' sessions/*.json | sort | uniq -c
```

### 2. 内容提取
提取特定类型的内容：
```bash
# 提取所有代码块
jq -r '.responses[] | select(.text | contains("```")) | .text' sessions/*.json

# 提取所有工具调用
jq -r '.responses[] | select(.type == "tool") | .toolName' sessions/*.json | sort | uniq -c
```

### 3. 会话合并
合并相关会话：
```bash
# 使用脚本合并指定日期的所有会话
jq -s 'reduce .[] as $item ({}; . + $item | .responses += $item.responses)' sessions/conversation-2024-01-01*.json
```

## 相关资源

参考配置文件和脚本：
- 配置模板：`config/recorder-config.json`
- 主记录脚本：`hooks/scripts/session-recorder.sh`
- Hook配置：`hooks/hooks.json`

这些文件展示了会话记录系统的内部工作机制，可以根据需要进行自定义配置。