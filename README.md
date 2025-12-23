# Claude Session Recorder Plugin

自动捕获并保存Claude Code CLI的提示词输入和输出结果。

## 功能特性

- ✅ **自动记录**：插件加载后自动开始记录会话
- ✅ **完整捕获**：记录用户提示、Claude响应和工具调用结果
- ✅ **JSON格式**：结构化存储，易于解析和处理
- ✅ **时间戳**：精确记录每个事件的时间
- ✅ **会话管理**：自动检测clear/compact并创建新会话文件
- ✅ **简洁命令**：提供基本的会话控制命令

## 安装

### 方法1：本地安装
```bash
# 克隆到Claude插件目录
git clone https://github.com/your-username/claude-session-recorder.git ~/.claude/plugins/claude-session-recorder

# 或复制到项目目录
cp -r claude-session-recorder /path/to/your/project/.claude-plugin/
```

### 方法2：从插件市场安装
```bash
# 在Claude Code中运行
/plugin install claude-session-recorder
```

## 快速开始

安装后插件会自动开始记录您的会话。无需额外配置。

### 查看记录
```bash
# 查看所有会话文件
/view-sessions

# 停止当前会话记录
/stop-recording

# 开始新会话记录（通常不需要，会自动开始）
/start-recording
```

## 文件结构

```
claude-session-recorder/
├── .claude-plugin/
│   └── plugin.json          # 插件清单
├── commands/                # 用户命令
│   ├── start-recording.md   # 开始记录命令
│   ├── stop-recording.md    # 停止记录命令
│   └── view-sessions.md     # 查看会话命令
├── hooks/                   # 事件处理器
│   ├── hooks.json          # Hook配置
│   └── scripts/            # 执行脚本
├── skills/                  # 技能
│   └── session-management/  # 会话管理技能
├── sessions/               # 会话文件存储目录
├── config/                 # 配置文件
│   └── recorder-config.json
└── README.md
```

## 会话文件格式

会话文件以JSON格式保存在 `./claude-sessions/` 目录中，命名格式为：
```
conversation-YYYY-MM-DD_HH-MM-SS.json
```

### 示例会话文件
```json
{
  "sessionId": "2024-01-01_10-00-00",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T10:30:00Z",
  "prompts": [
    {
      "timestamp": "2024-01-01T10:01:00Z",
      "text": "帮我写一个Python函数"
    }
  ],
  "responses": [
    {
      "type": "assistant",
      "text": "这是您的Python函数...",
      "timestamp": "2024-01-01T10:01:05Z"
    },
    {
      "type": "tool",
      "toolName": "Write",
      "result": "File created successfully",
      "timestamp": "2024-01-01T10:01:10Z"
    }
  ]
}
```

## 配置选项

编辑 `config/recorder-config.json` 文件来自定义记录行为：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoStart` | boolean | true | 插件加载时自动开始记录 |
| `format` | string | "json" | 记录文件格式（仅支持json） |
| `includeToolResults` | boolean | true | 是否包含工具调用结果 |
| `includeTimestamps` | boolean | true | 是否包含时间戳 |
| `maxSessionSize` | string | "100MB" | 单个会话文件最大大小 |
| `retentionDays` | number | 90 | 保留天数（0表示永久保留） |

## 命令参考

### /start-recording
开始或恢复会话记录。通常不需要手动执行，因为插件会自动记录。

### /stop-recording
结束当前会话记录并保存文件。

### /view-sessions
列出所有已保存的会话文件，并可查看详细内容。

## 技能

### session-management
提供会话管理的最佳实践，包括：
- 文件管理和组织
- 备份和迁移
- 搜索和分析技巧
- 隐私保护建议

## 工作原理

插件通过Hooks实现自动记录：

1. **UserPromptSubmit Hook**：捕获用户输入的每个提示
2. **PostToolUse Hook**：捕获工具执行结果
3. **SessionEnd Hook**：检测会话结束（clear/compact/exit）

## 隐私和安全

- 会话文件可能包含敏感信息
- 默认情况下不会自动上传或分享
- 建议定期备份重要会话
- 分享前请审查并编辑敏感内容

## 故障排除

### 记录未工作
1. 确认插件已正确安装和启用
2. 检查是否有权限写入sessions目录
3. 查看Claude Code错误日志

### 文件位置问题
会话文件保存在运行Claude Code的目录下的 `claude-sessions/` 文件夹中。

### 空会话文件
可能是因为：
- 会话还没有结束
- 没有触发捕获事件
- 权限问题

## 贡献

欢迎提交Issue和Pull Request！

### 开发环境
```bash
# 克隆仓库
git clone https://github.com/your-username/claude-session-recorder.git

# 进入目录
cd claude-session-recorder

# 测试插件
cc --plugin-dir ./
```

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本
- 自动记录功能
- JSON格式存储
- 基础命令支持