/**
 * 跨平台路径处理工具
 * 使用 pathe 库进行跨平台路径操作
 */

import { normalize, join } from 'pathe'

/**
 * 解析路径
 * 支持相对路径和绝对路径，自动处理跨平台路径分隔符
 */
export function resolvePath(path: string): string {
  return normalize(path)
}

/**
 * 连接路径段
 * 自动处理跨平台路径分隔符
 */
export function joinPath(...segments: string[]): string {
  return join(...segments)
}

/**
 * 获取插件根目录
 * 优先使用环境变量 CLAUDE_PLUGIN_ROOT
 */
export function getPluginRoot(): string {
  const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT
  if (pluginRoot) {
    return normalize(pluginRoot)
  }

  // 如果没有设置环境变量，返回当前工作目录
  return normalize(process.cwd())
}

/**
 * 获取配置文件路径
 */
export function getConfigPath(): string {
  return joinPath(getPluginRoot(), 'config', 'recorder-config.json')
}
