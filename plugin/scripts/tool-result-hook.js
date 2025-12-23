#!/usr/bin/env node
/**
 * PostToolUse Hook
 * 捕获工具执行结果
 */
import { readFileSync } from 'fs';
import { handleToolResult } from '../core/Recorder';
import { getConfigPath } from '../utils/path';
import { createLogger } from '../utils/logger';
const logger = createLogger('ToolResultHook');
async function main() {
    try {
        // 从 stdin 读取 JSON 输入
        const input = readFileSync(0, 'utf-8');
        const data = JSON.parse(input);
        logger.debug(`Received tool result: ${data.tool_name}`);
        // 获取配置路径
        const configPath = getConfigPath();
        // 执行处理
        await handleToolResult(data, configPath);
        logger.info(`Tool result for '${data.tool_name}' recorded successfully`);
        process.exit(0);
    }
    catch (error) {
        logger.error('Failed to record tool result', error);
        console.error(JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }));
        process.exit(1);
    }
}
main();
//# sourceMappingURL=tool-result-hook.js.map