/**
 * 会话管理器
 * 负责会话的生命周期管理
 */

import { readFile, writeFile, unlink } from 'fs/promises'
import { join, dirname } from 'path'
import { mkdir } from 'fs/promises'
import { resolvePath } from '../utils/path'
import type { Session, RecorderConfig, PromptEntry, ResponseEntry } from '../types'
import { Storage } from './Storage'

/**
 * 会话管理器类
 */
export class SessionManager {
  private currentSessionId: string | null = null
  private storage: Storage
  private statePath: string

  constructor(private config: RecorderConfig) {
    this.storage = new Storage(config)
    // 状态文件路径：config/.current-session
    this.statePath = join(dirname(resolvePath(config.sessionsDir)), '.current-session')
  }

  /**
   * 开始新会话
   */
  async startSession(sessionId?: string): Promise<Session> {
    // 确保会话目录存在
    const sessionsDir = resolvePath(this.config.sessionsDir)
    await mkdir(sessionsDir, { recursive: true })

    const id = sessionId || this.generateSessionId()
    const session = await this.storage.createSession(id)

    this.currentSessionId = id
    await this.saveState(id)

    return session
  }

  /**
   * 结束当前会话
   */
  async endSession(): Promise<void> {
    if (!this.currentSessionId) {
      return
    }

    await this.storage.updateSession(this.currentSessionId, session => ({
      ...session,
      endTime: new Date().toISOString()
    }))

    await this.clearState()
    this.currentSessionId = null
  }

  /**
   * 获取当前会话
   */
  async getCurrentSession(): Promise<Session | null> {
    if (!this.currentSessionId) {
      this.currentSessionId = await this.loadState()
    }

    return this.currentSessionId
      ? this.storage.loadSession(this.currentSessionId)
      : null
  }

  /**
   * 添加用户提示
   */
  async addPrompt(text: string): Promise<void> {
    if (!this.currentSessionId) {
      await this.startSession()
    }

    const entry: PromptEntry = {
      timestamp: new Date().toISOString(),
      text
    }

    await this.storage.updateSession(this.currentSessionId!, session => ({
      ...session,
      prompts: [...session.prompts, entry]
    }))
  }

  /**
   * 添加响应
   */
  async addResponse(entry: ResponseEntry): Promise<void> {
    if (!this.currentSessionId) {
      return
    }

    await this.storage.updateSession(this.currentSessionId!, session => ({
      ...session,
      responses: [...session.responses, entry]
    }))
  }

  /**
   * 列出所有会话
   */
  listSessions(): Promise<Session[]> {
    return this.storage.listSessions()
  }

  /**
   * 生成会话ID
   * 格式: YYYY-MM-DD_HH-MM-SS
   */
  private generateSessionId(): string {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  }

  /**
   * 保存状态
   */
  private async saveState(sessionId: string): Promise<void> {
    await mkdir(dirname(this.statePath), { recursive: true })
    await writeFile(this.statePath, sessionId, 'utf-8')
  }

  /**
   * 加载状态
   */
  private async loadState(): Promise<string | null> {
    try {
      return await readFile(this.statePath, 'utf-8')
    } catch {
      return null
    }
  }

  /**
   * 清除状态
   */
  private async clearState(): Promise<void> {
    try {
      await unlink(this.statePath)
    } catch {
      // 忽略错误
    }
  }
}
