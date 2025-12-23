/**
 * 存储抽象层
 * 负责会话数据的持久化和检索
 */

import { readFile, writeFile, readdir, unlink } from 'fs/promises'
import { join } from 'path'
import { resolvePath } from '../utils/path'
import type { Session, RecorderConfig } from '../types'

/**
 * 存储类 - 处理会话文件的 CRUD 操作
 */
export class Storage {
  constructor(private config: RecorderConfig) {}

  /**
   * 创建新会话
   */
  async createSession(sessionId: string): Promise<Session> {
    const session: Session = {
      sessionId,
      startTime: new Date().toISOString(),
      endTime: null,
      prompts: [],
      responses: []
    }

    await this.writeSession(sessionId, session)
    return session
  }

  /**
   * 加载会话
   */
  async loadSession(sessionId: string): Promise<Session | null> {
    try {
      const content = await readFile(this.getSessionPath(sessionId), 'utf-8')
      return JSON.parse(content) as Session
    } catch {
      return null
    }
  }

  /**
   * 更新会话
   */
  async updateSession(
    sessionId: string,
    updater: (session: Session) => Session
  ): Promise<void> {
    const session = await this.loadSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const updated = updater(session)
    await this.writeSession(sessionId, updated)
  }

  /**
   * 列出所有会话
   */
  async listSessions(): Promise<Session[]> {
    const sessionsDir = resolvePath(this.config.sessionsDir)
    const files = await readdir(sessionsDir)
    const sessionFiles = files.filter(
      f => f.startsWith('conversation-') && f.endsWith('.json')
    )

    const sessions: Session[] = []
    for (const file of sessionFiles) {
      try {
        const content = await readFile(join(sessionsDir, file), 'utf-8')
        sessions.push(JSON.parse(content) as Session)
      } catch {
        // 跳过损坏的文件
      }
    }

    return sessions.sort((a, b) =>
      b.startTime.localeCompare(a.startTime)
    )
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    await unlink(this.getSessionPath(sessionId))
  }

  /**
   * 写入会话文件
   */
  private async writeSession(sessionId: string, session: Session): Promise<void> {
    const sessionPath = this.getSessionPath(sessionId)
    const dir = join(sessionPath, '..')

    // 确保目录存在
    const { mkdir } = await import('fs/promises')
    await mkdir(dir, { recursive: true })

    await writeFile(
      sessionPath,
      JSON.stringify(session, null, 2),
      'utf-8'
    )
  }

  /**
   * 获取会话文件路径
   */
  private getSessionPath(sessionId: string): string {
    return join(resolvePath(this.config.sessionsDir), `conversation-${sessionId}.json`)
  }
}
