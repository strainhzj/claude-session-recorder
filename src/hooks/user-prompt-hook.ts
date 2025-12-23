#!/usr/bin/env node
/**
 * UserPromptSubmit Hook
 * 捕获用户提交的提示词
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { handleUserPrompt } from '../core/Recorder'
import { getConfigPath } from '../utils/path'
import { createLogger } from '../utils/logger'
import type { HookInput } from '../types'

const logger = createLogger('UserPromptHook')

async function main(): Promise<void> {
  try {
    // 从 stdin 读取 JSON 输入
    const input = readFileSync(0, 'utf-8')
    const data: HookInput = JSON.parse(input)

    logger.debug(`Received user prompt: ${data.user_prompt?.substring(0, 50)}...`)

    // 获取配置路径
    const configPath = getConfigPath()

    // 执行处理
    await handleUserPrompt(data, configPath)

    logger.info('User prompt recorded successfully')

    process.exit(0)
  } catch (error) {
    logger.error('Failed to record user prompt', error)
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }))
    process.exit(1)
  }
}

main()
