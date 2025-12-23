/**
 * 核心记录器
 * 处理用户提示和工具结果的记录逻辑
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import { resolvePath } from '../utils/path'
import type { HookInput, PromptEntry, ResponseEntry, RecorderConfig } from '../types'

/**
 * 生成会话ID
 * 格式: YYYY-MM-DD_HH-MM-SS
 */
function generateSessionId(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
}

/**
 * 追加条目到会话
 */
async function appendEntry(
  type: 'prompts' | 'responses',
  entry: PromptEntry | ResponseEntry,
  config: RecorderConfig,
  configPath: string
): Promise<void> {
  const sessionFile = config.currentSessionFile

  if (!sessionFile) {
    // 创建新会话
    const sessionId = generateSessionId()
    const sessionsDir = resolvePath(config.sessionsDir)
    await mkdir(sessionsDir, { recursive: true })

    const newSessionFile = join(sessionsDir, `conversation-${sessionId}.json`)

    const newSession = {
      sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      prompts: type === 'prompts' ? [entry] : [],
      responses: type === 'responses' ? [entry] : []
    }

    await writeFile(newSessionFile, JSON.stringify(newSession, null, 2), 'utf-8')

    // 更新配置
    config.currentSessionFile = newSessionFile
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
  } else {
    // 追加到现有会话
    const sessionData = JSON.parse(await readFile(sessionFile, 'utf-8'))
    sessionData[type].push(entry)
    await writeFile(sessionFile, JSON.stringify(sessionData, null, 2), 'utf-8')
  }
}

/**
 * 处理用户提示
 */
export async function handleUserPrompt(
  input: HookInput,
  configPath: string
): Promise<void> {
  const prompt = input.user_prompt
  if (!prompt) {
    return
  }

  const config = JSON.parse(await readFile(configPath, 'utf-8')) as RecorderConfig
  const entry: PromptEntry = {
    timestamp: new Date().toISOString(),
    text: prompt
  }

  await appendEntry('prompts', entry, config, configPath)
}

/**
 * 处理工具结果
 */
export async function handleToolResult(
  input: HookInput,
  configPath: string
): Promise<void> {
  const { tool_name, tool_result } = input
  if (!tool_name || tool_result === undefined) {
    return
  }

  const config = JSON.parse(await readFile(configPath, 'utf-8')) as RecorderConfig
  const entry: ResponseEntry = {
    type: 'tool',
    toolName: tool_name,
    result: String(tool_result),
    timestamp: new Date().toISOString()
  }

  await appendEntry('responses', entry, config, configPath)
}

/**
 * 处理会话结束
 */
export async function handleSessionEnd(configPath: string): Promise<void> {
  const config = JSON.parse(await readFile(configPath, 'utf-8')) as RecorderConfig
  const sessionFile = config.currentSessionFile

  if (!sessionFile) {
    return
  }

  const sessionData = JSON.parse(await readFile(sessionFile, 'utf-8'))
  sessionData.endTime = new Date().toISOString()

  await writeFile(sessionFile, JSON.stringify(sessionData, null, 2), 'utf-8')

  // 清除当前会话状态
  config.currentSessionFile = undefined
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
}
