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
    case 'oh-my-costrict:omg:workflow':
      // 完整开发流水线路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:omg:workflow 技能。完整流水线：idea → PRD → 设计 → 设计审查 → TDD 编码 → 代码审查+DX审查 → 验证修复 → 完成。`;

    case 'oh-my-costrict:omg:tdd':
      // TDD 工作流路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:omg:tdd 技能。委托 tdd-guide 代理，严格遵循红-绿-重构循环：先写测试 → 确认失败 → 编写最简实现 → 确认通过 → 重构改进。目标覆盖率 >= 80%。`;

    case 'oh-my-costrict:omg:review':
      // 代码审查路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:omg:review 技能。委托 reviewer 代理进行代码审查（代码质量 + 设计 + 安全），输出按 CRITICAL/HIGH/MEDIUM/LOW 分级的问题列表。`;

    case 'oh-my-costrict:omg:verify':
      // 验证修复路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:omg:verify 技能。委托 verifier 代理运行测试和覆盖率检查，失败则委托 executor 修复并重跑，最多 3 轮循环。`;

    case 'oh-my-costrict:omg:grill-with-docs':
      // 领域模型驱动设计审查路由提示
      return `[关键词路由] 检测到关键词 "${match.keyword}"，建议使用 /oh-my-costrict:omg:grill-with-docs 技能。用项目 spec 和 CONTEXT.md 挑战设计方案，精确化术语，内联更新文档和 ADR。`;

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
