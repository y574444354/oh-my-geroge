/**
 * UserPromptSubmit Hook 脚本 — 关键词检测与技能路由
 *
 * 在用户每次提交 prompt 时触发，检测 prompt 中的预设关键词，
 * 若命中则注入技能路由提示到 system prompt 中。
 *
 * 输入 (stdin JSON)：
 *   { hook_event_name: "UserPromptSubmit", session_id: string, cwd: string, prompt: string }
 *
 * 输出 (stdout JSON)：
 *   { continue: true, systemMessage: "<路由提示或空字符串>" }
 *
 * 使用方式：由 CSC hook 引擎以 command 类型调用：
 *   node "${CLAUDE_PLUGIN_ROOT}/hooks/keyword-detector.mjs"
 *
 * 设计理念：实际的匹配逻辑抽离到 lib/keyword-detector.js 纯函数中，
 * 本脚本只负责 IO 胶水（读 stdin → 调纯函数 → 写 stdout）。
 */

import { detectKeywords } from './lib/keyword-detector.js';

/**
 * 读取 stdin 的 JSON 输入
 *
 * @returns {Promise<object>} 解析后的输入对象
 */
async function readStdin() {
  // 收集 stdin 的所有数据块
  return new Promise((resolveStdin) => {
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
    process.stdin.on('error', () => {
      // stdin 读取失败时返回空对象，保持非侵入式
      resolveStdin({});
    });
    process.stdin.resume();
  });
}

/**
 * 构造技能路由系统提示
 *
 * @param {{ keyword: string, skill: string, priority: number }} match - 关键词匹配结果
 * @returns {string} 路由系统提示文本
 */
function buildRoutingMessage(match) {
  // 根据不同的技能返回对应的路由提示
  switch (match.skill) {
    case 'oh-my-costrict:costrict-autopilot':
      // 自动审查流水线路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:costrict-autopilot 技能。请委托 planner 生成 PRD，然后依次委托 architect 进行设计审查、reviewer 进行工程审查和 DX 审查，最后汇总报告。`;

    case 'oh-my-costrict:costrict-team':
      // 多智能体团队编排路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:costrict-team 技能。请委托 planner 拆分任务，并行启动多个 executor 代理执行，然后委托 reviewer 审查，最多 3 轮修复循环，最后委托 verifier 验证。`;

    case 'oh-my-costrict:tdd-guide':
      // TDD 工作流路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 TDD 工作流。严格遵循红-绿-重构循环：先写测试 → 确认失败 → 编写最简实现 → 确认通过 → 重构改进。目标覆盖率 >= 80%。`;

    default:
      // 未识别的技能路由
      return '';
  }
}

/**
 * 主函数：读取输入 → 关键词检测 → 构造路由提示 → 输出响应
 */
async function main() {
  // 读取 stdin 输入（hook 事件信息，包含用户 prompt）
  const input = await readStdin();

  // 提取用户 prompt（可能为空）
  const prompt = input.prompt || '';

  // 调用纯函数进行关键词检测
  const match = detectKeywords(prompt);

  // 构造路由提示（未命中则为空字符串）
  const systemMessage = match ? buildRoutingMessage(match) : '';

  // 构造 hook 响应 JSON（非侵入式：始终 continue: true）
  const response = {
    continue: true,
    systemMessage: systemMessage,
    stopReason: null,
  };

  // 输出到 stdout（CSC hook 引擎读取）
  process.stdout.write(JSON.stringify(response));
}

// 执行主函数
main().catch(() => {
  // 任何未预期的错误都不阻塞 CSC
  const fallback = {
    continue: true,
    systemMessage: '',
    stopReason: null,
  };
  process.stdout.write(JSON.stringify(fallback));
});
