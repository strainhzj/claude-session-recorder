/**
 * 配置类型定义
 */

/**
 * 记录器配置
 */
export interface RecorderConfig {
  /** 是否自动开始记录 */
  autoStart: boolean
  /** 存储格式 */
  format: 'json'
  /** 是否包含工具结果 */
  includeToolResults: boolean
  /** 是否包含时间戳 */
  includeTimestamps: boolean
  /** 单个会话最大大小 */
  maxSessionSize: string
  /** 会话保留天数 */
  retentionDays: number
  /** 会话存储目录路径 */
  sessionsDir: string
  /** 当前会话文件路径 */
  currentSessionFile?: string
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: RecorderConfig = {
  autoStart: true,
  format: 'json',
  includeToolResults: true,
  includeTimestamps: true,
  maxSessionSize: '100MB',
  retentionDays: 90,
  sessionsDir: './sessions'
} as const
