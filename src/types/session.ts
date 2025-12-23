/**
 * 会话类型定义
 */

/**
 * 会话数据结构
 */
export interface Session {
  /** 会话唯一标识 */
  sessionId: string
  /** 会话开始时间 (ISO 8601) */
  startTime: string
  /** 会话结束时间 (ISO 8601), null 表示会话仍在进行中 */
  endTime: string | null
  /** 用户提示列表 */
  prompts: PromptEntry[]
  /** 响应列表（助手回复和工具结果） */
  responses: ResponseEntry[]
  /** 会话元数据 */
  metadata?: SessionMetadata
}

/**
 * 用户提示条目
 */
export interface PromptEntry {
  /** 时间戳 (ISO 8601) */
  timestamp: string
  /** 提示文本内容 */
  text: string
}

/**
 * 响应条目
 */
export interface ResponseEntry {
  /** 响应类型：助手回复或工具结果 */
  type: 'assistant' | 'tool'
  /** 助手回复文本 (type='assistant' 时使用) */
  text?: string
  /** 工具名称 (type='tool' 时使用) */
  toolName?: string
  /** 工具执行结果 (type='tool' 时使用) */
  result?: string
  /** 时间戳 (ISO 8601) */
  timestamp: string
}

/**
 * 会话元数据
 */
export interface SessionMetadata {
  /** 会话大小（字节） */
  size: number
  /** 提示数量 */
  promptCount: number
  /** 响应数量 */
  responseCount: number
  /** 最后更新时间 (ISO 8601) */
  lastUpdated: string
}
