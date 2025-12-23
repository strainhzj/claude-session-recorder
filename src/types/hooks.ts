/**
 * Hook 类型定义
 */

/**
 * Hook 输入数据
 * Claude Code 通过 stdin 传递给 Hook 的 JSON 数据
 */
export interface HookInput {
  /** 用户提示内容 (UserPromptSubmit Hook) */
  user_prompt?: string
  /** 工具名称 (PostToolUse Hook) */
  tool_name?: string
  /** 工具执行结果 (PostToolUse Hook) */
  tool_result?: string
  /** 其他可能的字段 */
  [key: string]: unknown
}

/**
 * Hook 输出数据
 * Hook 通过 stdout 返回给 Claude Code 的 JSON 数据
 */
export interface HookOutput {
  /** 操作是否成功 */
  success: boolean
  /** 错误信息（失败时） */
  error?: string
  /** 附加数据 */
  data?: unknown
}

/**
 * Hook 类型枚举
 */
export enum HookType {
  /** 用户提交提示时触发 */
  UserPromptSubmit = 'UserPromptSubmit',
  /** 工具执行后触发 */
  PostToolUse = 'PostToolUse',
  /** 会话结束时触发 */
  SessionEnd = 'SessionEnd'
}
