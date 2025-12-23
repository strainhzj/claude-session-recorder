/**
 * 日志系统
 * 提供简单的日志记录功能
 */

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * 日志颜色（终端支持时）
 */
const colors = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m',  // Red
  reset: '\x1b[0m'
}

/**
 * 日志类
 */
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  /**
   * 格式化日志消息
   */
  private format(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString()
    const color = process.stdout.isTTY ? colors[level] : ''
    const reset = process.stdout.isTTY ? colors.reset : ''
    return `${color}[${timestamp}] [${level}] [${this.context}]${reset} ${message}`
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, message: string): void {
    console.log(this.format(level, message))
  }

  debug(message: string): void {
    this.log(LogLevel.DEBUG, message)
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message)
  }

  warn(message: string): void {
    this.log(LogLevel.WARN, message)
  }

  error(message: string, error?: unknown): void {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(LogLevel.ERROR, `${message}: ${errorMessage}`)
    } else {
      this.log(LogLevel.ERROR, message)
    }
  }
}

/**
 * 创建日志实例
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}
