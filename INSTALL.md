# 快速安装指南

## 方法1：项目级安装（推荐）

1. 将插件复制到您的项目目录：
```bash
cp -r claude-session-recorder /path/to/your/project/
```

2. 在项目中启用插件：
```bash
cd /path/to/your/project
cc --plugin-dir ./claude-session-recorder
```

## 方法2：全局安装

1. 复制到Claude插件目录：
```bash
# macOS/Linux
cp -r claude-session-recorder ~/.claude/plugins/

# Windows
xcopy /E /I claude-session-recorder %USERPROFILE%\.claude\plugins\claude-session-recorder
```

2. 重启Claude Code

## 验证安装

安装后，运行 `/help` 命令，应该看到以下命令：
- `/start-recording`
- `/stop-recording`
- `/view-sessions`

## 使用说明

插件会自动开始记录您的会话。首次使用时会：
1. 自动创建 `./claude-sessions/` 目录
2. 创建第一个会话文件
3. 开始记录所有输入和输出

## 查看记录

```bash
# 列出所有会话
/view-sessions

# 查看特定会话内容
/view-sessions
[选择要查看的文件名]
```

## 文件位置

会话文件保存在：`./claude-sessions/conversation-YYYY-MM-DD_HH-MM-SS.json`