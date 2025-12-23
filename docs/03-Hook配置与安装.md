# Hook 配置与跨平台安装

## 一、Hook 配置

### 1.1 hooks.json

```json
{
  "description": "Claude Session Recorder - 全 TypeScript 实现",
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-bin/user-prompt-hook.exe\"",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-bin/tool-result-hook.exe\"",
            "timeout": 10
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-bin/session-end-hook.exe\"",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

**说明：**
- 统一使用 `.exe` 后缀，pkg 在 Unix 系统上会自动处理
- `${CLAUDE_PLUGIN_ROOT}` 是 Claude Code CLI 提供的环境变量
- `timeout` 设置为合理的超时时间

### 1.2 平台处理方案

#### 方案A：统一后缀（推荐）

在 `hooks.json` 中统一使用 `.exe` 后缀：

```json
{
  "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-bin/user-prompt-hook.exe\""
}
```

**优点：**
- 配置文件简洁统一
- pkg 自动处理跨平台差异

**实现：**
- Windows: `user-prompt-hook.exe`
- Linux/macOS: `user-prompt-hook`（pkg 自动去除 .exe）

#### 方案B：安装时动态配置

在安装脚本中根据平台修改 `hooks.json`：

```typescript
// 安装时根据平台更新 hooks.json
const platform = process.platform === 'win32' ? 'win' : 'unix'
const extension = process.platform === 'win32' ? '.exe' : ''

hooksJson.hooks.UserPromptSubmit[0].hooks[0].command =
  `"${CLAUDE_PLUGIN_ROOT}/hooks-bin/user-prompt-hook${extension}"`
```

**推荐：方案A（统一后缀）**

## 二、安装脚本

### 2.1 安装脚本实现

```typescript
// src/scripts/install.ts
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { platform, arch } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 平台映射
 */
const PLATFORM_MAP: Record<string, string> = {
  'win32': 'win',
  'linux': 'linux',
  'darwin': 'macos'
}

/**
 * 获取平台信息
 */
function getPlatformInfo() {
  const osPlatform = platform()
  const cpuArch = arch()

  const platformName = PLATFORM_MAP[osPlatform]
  if (!platformName) {
    throw new Error(`Unsupported platform: ${osPlatform}`)
  }

  return {
    platform: platformName,
    isWindows: osPlatform === 'win32',
    arch: cpuArch === 'arm64' ? 'arm64' : 'x64',
    osPlatform
  }
}

/**
 * 安装 Hook 可执行文件
 */
async function installHooks() {
  const { platform, isWindows, arch } = getPlatformInfo()
  const projectRoot = process.cwd()
  const hookBinDir = join(projectRoot, 'hooks-bin')
  const binDir = join(projectRoot, 'bin')

  // 确保 hooks-bin 目录存在
  if (!existsSync(hookBinDir)) {
    mkdirSync(hookBinDir, { recursive: true })
  }

  // 复制平台对应的可执行文件
  const hooks = [
    { src: 'user-prompt-hook', dst: 'user-prompt-hook' },
    { src: 'tool-result-hook', dst: 'tool-result-hook' },
    { src: 'session-end-hook', dst: 'session-end-hook' }
  ]

  console.log(`\n🔧 Installing hooks for ${platform}-${arch}...\n`)

  for (const hook of hooks) {
    const ext = isWindows ? '.exe' : ''
    const srcFile = join(binDir, `${hook.src}-${platform}-${arch}${ext}`)

    // 如果特定架构不存在，尝试默认 x64
    let finalSrcFile = srcFile
    if (!existsSync(srcFile) && arch === 'arm64') {
      const fallbackFile = join(binDir, `${hook.src}-${platform}-x64${ext}`)
      if (existsSync(fallbackFile)) {
        console.log(`⚠️  Using x64 fallback for ${hook.src}`)
        finalSrcFile = fallbackFile
      }
    }

    const dstFile = join(hookBinDir, `${hook.dst}${ext}`)

    if (existsSync(finalSrcFile)) {
      copyFileSync(finalSrcFile, dstFile)

      // Unix 系统设置可执行权限
      if (!isWindows) {
        const { chmodSync } = await import('fs')
        chmodSync(dstFile, 0o755)
      }

      console.log(`✅ Installed: ${hook.dst}`)
    } else {
      console.warn(`⚠️  Source not found: ${finalSrcFile}`)
    }
  }

  console.log(`\n🎉 Installation complete for ${platform}!\n`)
  console.log(`📁 Hook binary location: ${hookBinDir}`)
}

/**
 * 主函数
 */
async function main() {
  try {
    await installHooks()
  } catch (error) {
    console.error('❌ Installation failed:', error)
    process.exit(1)
  }
}

main()
```

### 2.2 构建脚本

```typescript
// src/scripts/build.ts
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

console.log('\n🔨 Building Claude Session Recorder...\n')

// 1. 编译 TypeScript
console.log('📝 Compiling TypeScript...')
try {
  execSync('tsc', { stdio: 'inherit' })
  console.log('✅ TypeScript compilation complete\n')
} catch (error) {
  console.error('❌ TypeScript compilation failed')
  process.exit(1)
}

// 2. 确保 bin 目录存在
const binDir = join(process.cwd(), 'bin')
if (!existsSync(binDir)) {
  mkdirSync(binDir, { recursive: true })
}

// 3. 打包 Hook 可执行文件
const hooks = ['user-prompt-hook', 'tool-result-hook', 'session-end-hook']
const targets = ['node18-win-x64', 'node18-linux-x64', 'node18-macos-x64', 'node18-macos-arm64']

console.log('📦 Packaging hook executables...')

for (const hook of hooks) {
  const hookSrc = `src/hooks/${hook}.ts`

  for (const target of targets) {
    try {
      const [nodeVer, os, arch] = target.split('-')
      const output = `bin/${hook}-${os}-${arch}`

      console.log(`  Building ${hook} for ${os}-${arch}...`)

      execSync(
        `pkg ${hookSrc} --target ${target} --output ${output}`,
        { stdio: 'inherit' }
      )

      // Unix 系统添加可执行权限（在打包后的文件上）
      if (os !== 'win') {
        try {
          execSync(`chmod +x ${output}`, { stdio: 'inherit' })
        } catch {
          // chmod 在 Windows 上不可用，忽略
        }
      }

      console.log(`  ✅ ${output}`)
    } catch (error) {
      console.error(`  ❌ Failed to build ${hook} for ${target}`)
    }
  }
}

console.log('\n✅ Build complete!\n')
console.log('📁 Output files:')
console.log(`  - bin/`)
console.log(`\n💡 Run "npm run install-hooks" to install platform-specific binaries`)
```

### 2.3 Shell 构建脚本

```bash
#!/bin/bash
# build.sh - 跨平台构建脚本

set -e

echo ""
echo "🔨 Building Claude Session Recorder..."
echo ""

# 检测平台
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PLATFORM="windows"
    EXE_EXT=".exe"
else
    PLATFORM="unix"
    EXE_EXT=""
fi

# 1. 清理旧的构建产物
echo "🧹 Cleaning old builds..."
rm -rf dist/ bin/ hooks-bin/
mkdir -p dist bin hooks-bin

# 2. 编译 TypeScript
echo "📝 Compiling TypeScript..."
npm run build

# 3. 打包 Hook 可执行文件
echo "📦 Packaging hooks..."

if [ "$PLATFORM" == "windows" ]; then
    # Windows: 使用 cmd 执行 pkg
    cmd //c "npm run package:hooks"
else
    # Unix: 直接执行
    npm run package:hooks
fi

# 4. 安装平台特定的 Hook
echo "🔧 Installing platform-specific hooks..."
node dist/scripts/install.js

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Build artifacts:"
ls -lh bin/
echo ""
ls -lh hooks-bin/
echo ""
echo "🎉 Ready to use!"
```

## 三、package.json 脚本

```json
{
  "scripts": {
    "build": "tsc",
    "build:hooks": "tsc src/hooks/*.ts --outDir dist/hooks",
    "package": "npm run build && npm run package:hooks",
    "package:hooks": "node dist/scripts/build.js",
    "package:all": "npm run package && pkg . --targets node18-win-x64,node18-linux-x64,node18-macos-x64 --output bin/session-recorder",
    "install-hooks": "node dist/scripts/install.js",
    "dev": "tsc --watch",
    "test": "vitest",
    "clean": "rm -rf dist/ bin/ hooks-bin/"
  }
}
```

## 四、构建产物说明

### 4.1 文件结构

```
bin/
├── user-prompt-hook-win-x64.exe      # Windows x64
├── user-prompt-hook-linux-x64        # Linux x64
├── user-prompt-hook-macos-x64        # macOS Intel
├── user-prompt-hook-macos-arm64      # macOS Apple Silicon
├── tool-result-hook-win-x64.exe
├── tool-result-hook-linux-x64
├── tool-result-hook-macos-x64
├── tool-result-hook-macos-arm64
├── session-end-hook-win-x64.exe
├── session-end-hook-linux-x64
├── session-end-hook-macos-x64
└── session-end-hook-macos-arm64

hooks-bin/                            # 安装后的平台特定文件
├── user-prompt-hook.exe              # Windows
├── user-prompt-hook                  # Linux/macOS
├── tool-result-hook.exe
├── tool-result-hook
├── session-end-hook.exe
└── session-end-hook
```

### 4.2 安装流程

```bash
# 1. 构建项目
npm run build

# 2. 打包可执行文件
npm run package

# 3. 安装平台特定的 Hook
npm run install-hooks
```

### 4.3 验证安装

```bash
# 列出 hooks-bin 目录
ls -lh hooks-bin/

# 测试 Hook 执行
echo '{"user_prompt":"测试"}' | ./hooks-bin/user-prompt-hook.exe

# 检查退出码
echo $?  # 应该输出 0
```

## 五、跨平台兼容性

### 5.1 平台检测

```typescript
// 检测当前平台
function getPlatform() {
  return {
    os: process.platform,  // 'win32', 'linux', 'darwin'
    arch: process.arch,    // 'x64', 'arm64'
    isWindows: process.platform === 'win32',
    isMac: process.platform === 'darwin',
    isLinux: process.platform === 'linux'
  }
}
```

### 5.2 路径处理

```typescript
import { join, normalize } from 'path'

// 使用 path.join 处理跨平台路径
const configPath = join(PLUGIN_ROOT, 'config', 'recorder-config.json')

// 规范化路径
const normalizedPath = normalize(somePath)
```

### 5.3 文件权限

```typescript
import { chmodSync, constants } from 'fs'

// Unix 系统设置可执行权限
if (process.platform !== 'win32') {
  chmodSync(filePath, constants.S_IRWXU | constants.S_IRGRP | constants.S_IXGRP | constants.S_IROTH | constants.S_IXOTH)
}
```

### 5.4 stdin/stdout 处理

```typescript
import { readFileSync } from 'fs'

// 跨平台 stdin 读取
const input = readFileSync(0, 'utf-8')  // fd 0 = stdin

// 写入 stdout
console.log(JSON.stringify(output))
```

## 六、故障排查

### 6.1 常见问题

#### 问题1：Hook 可执行文件无法执行

**Windows:**
```bash
# 检查文件是否存在
dir hooks-bin\

# 检查文件权限
icacls hooks-bin\user-prompt-hook.exe
```

**Linux/macOS:**
```bash
# 检查文件权限
ls -lh hooks-bin/

# 添加可执行权限
chmod +x hooks-bin/user-prompt-hook
```

#### 问题2：pkg 打包失败

```bash
# 清理缓存
rm -rf node_modules/.cache/

# 重新安装依赖
npm ci

# 重新构建
npm run clean && npm run build
```

#### 问题3：Hook 超时

```json
// 在 hooks.json 中增加超时时间
{
  "type": "command",
  "command": "...",
  "timeout": 30  // 增加到 30 秒
}
```

### 6.2 调试技巧

```typescript
// 添加调试输出
console.error('DEBUG:', JSON.stringify({
  platform: process.platform,
  arch: process.arch,
  cwd: process.cwd(),
  env: process.env
}))
```

## 七、总结

本方案实现了：

1. ✅ **零 Shell 脚本**：100% TypeScript 实现
2. ✅ **独立可执行**：pkg 打包，无需 Node.js
3. ✅ **跨平台兼容**：统一配置，自动平台检测
4. ✅ **自动化安装**：一键安装平台特定二进制文件
5. ✅ **简化维护**：单一构建流程，统一发布
