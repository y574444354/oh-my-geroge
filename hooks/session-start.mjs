/**
 * SessionStart Hook 脚本
 *
 * 在 CSC 会话启动时触发，读取 claude.md 编排大脑文件，
 * 将其内容作为 systemMessage 注入到 AI 的 system prompt 中。
 *
 * 输入 (stdin JSON)：
 *   { hook_event_name: "SessionStart", session_id: string, cwd: string }
 *
 * 输出 (stdout JSON)：
 *   { continue: true, systemMessage: "<claude.md 内容>" }
 *
 * 使用方式：由 CSC hook 引擎以 command 类型调用：
 *   node "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.mjs"
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * 读取 stdin 的 JSON 输入
 *
 * @returns {Promise<object>} 解析后的输入对象
 */
async function readStdin() {
  // 收集 stdin 的所有数据块
  return new Promise((resolveStdin, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      try {
        // 尝试将 stdin 内容解析为 JSON
        resolveStdin(JSON.parse(data.trim() || '{}'));
      } catch {
        // JSON 解析失败时返回空对象，不阻塞 CSC
        resolveStdin({});
      }
    });
    process.stdin.on('error', (err) => {
      // stdin 读取失败时返回空对象，保持非侵入式
      resolveStdin({});
    });
    process.stdin.resume();
  });
}

/**
 * 读取 claude.md 编排器文件
 *
 * @returns {Promise<string>} 文件内容，读取失败时返回空字符串
 */
async function readOrchestrationBrain() {
  try {
    // 使用 CLAUDE_PLUGIN_ROOT 环境变量定位插件根目录
    const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
    if (!pluginRoot) {
      // 环境变量未设置，降级为相对路径（当前工作目录）
      const claudeMdPath = resolve(process.cwd(), 'claude.md');
      return await readFile(claudeMdPath, 'utf-8');
    }
    // 拼接 claude.md 的完整路径
    const filePath = resolve(pluginRoot, 'claude.md');
    // 读取文件内容
    return await readFile(filePath, 'utf-8');
  } catch {
    // 文件读取失败不阻塞 CSC，返回空字符串
    return '';
  }
}

/**
 * 主函数：读取输入 -> 注入编排器 system prompt -> 输出响应
 */
async function main() {
  // 读取 stdin 输入（hook 事件信息）
  const input = await readStdin();

  // 读取 claude.md 编排大脑文件
  const orchestrationContent = await readOrchestrationBrain();

  // 构造 hook 响应 JSON
  const response = {
    continue: true,
    systemMessage: orchestrationContent,
    stopReason: null,
  };

  // 输出到 stdout（CSC hook 引擎读取）
  process.stdout.write(JSON.stringify(response));
}

// 执行主函数
main().catch(() => {
  // 任何未预期的错误都不阻塞 CSC，返回空 systemMessage
  const fallback = {
    continue: true,
    systemMessage: '',
    stopReason: null,
  };
  process.stdout.write(JSON.stringify(fallback));
});
