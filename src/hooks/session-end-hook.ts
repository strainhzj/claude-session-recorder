#!/usr/bin/env node
/**
 * SessionEnd Hook
 * 处理会话结束
 */

import { handleSessionEnd } from '../core/Recorder'
import { getConfigPath } from '../utils/path'
import { createLogger } from '../utils/logger'

const logger = createLogger('SessionEndHook')

async function main(): Promise<void> {
  try {
    logger.debug('Session ending...')

    // 获取配置路径
    const configPath = getConfigPath()

    // 执行处理
    await handleSessionEnd(configPath)

    logger.info('Session ended successfully')

    process.exit(0)
  } catch (error) {
    logger.error('Failed to end session', error)
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }))
    process.exit(1)
  }
}

main()
