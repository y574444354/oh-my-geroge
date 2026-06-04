/**
 * 关键词检测器 — 纯函数模块
 *
 * 从用户 prompt 中检测预设关键词，返回匹配结果。
 * 此模块为纯函数，不依赖任何外部状态或 I/O，便于单元测试。
 *
 * 关键词映射表（按检测顺序排列）：
 * ┌───────────────┬───────────────┬──────────┐
 * │ 关键词          │ 技能           │ 优先级    │
 * ├───────────────┼───────────────┼──────────┤
 * │ autopilot      │ costrict-autopilot │ 10       │
 * │ auto（非精确匹配）│ costrict-autopilot │ 5        │
 * │ team           │ costrict-team      │ 10       │
 * │ tdd            │ tdd-guide     │ 10       │
 * └───────────────┴───────────────┴──────────┘
 *
 * 匹配规则：
 * - 匹配不区分大小写
 * - 优先级相同时取先匹配到的关键词
 * - "auto" 是部分匹配（包含即命中），其余为词边界匹配
 */

// 关键词规则配置表
// 每个规则包含：keyword（检测词）、skill（路由目标技能）、priority（优先级，数字越大越优先）、exact（是否精确词边界匹配）
const KEYWORD_RULES = [
  { keyword: 'autopilot', skill: 'oh-my-costrict:costrict-autopilot', priority: 10, exact: true },
  { keyword: 'auto', skill: 'oh-my-costrict:costrict-autopilot', priority: 5, exact: false },
  { keyword: 'team', skill: 'oh-my-costrict:costrict-team', priority: 10, exact: true },
  { keyword: 'tdd', skill: 'oh-my-costrict:tdd-guide', priority: 10, exact: true },
];

/**
 * 检测 prompt 中的预设关键词
 *
 * @param {string} prompt - 用户输入的文本
 * @returns {{ keyword: string, skill: string, priority: number } | null}
 *   匹配成功返回 { keyword, skill, priority }，否则返回 null
 */
function detectKeywords(prompt) {
  // 输入验证：非字符串或空字符串直接返回 null
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return null;
  }

  // 转为小写以支持不区分大小写匹配
  const lowerPrompt = prompt.toLowerCase();

  // 当前最佳匹配（按优先级比较）
  let bestMatch = null;

  // 遍历所有规则，寻找最佳匹配
  for (const rule of KEYWORD_RULES) {
    const keywordLower = rule.keyword.toLowerCase();
    let matched = false;

    if (rule.exact) {
      // 精确匹配：使用词边界正则（\b 为词边界）
      const exactPattern = new RegExp(`\\b${escapeRegExp(keywordLower)}\\b`);
      matched = exactPattern.test(lowerPrompt);
    } else {
      // 部分匹配：直接检查是否包含
      matched = lowerPrompt.includes(keywordLower);
    }

    // 命中且优先级更高的匹配（或首次命中）
    if (matched && (!bestMatch || rule.priority > bestMatch.priority)) {
      bestMatch = {
        keyword: rule.keyword,
        skill: rule.skill,
        priority: rule.priority,
      };
    }
  }

  return bestMatch;
}

/**
 * 转义正则表达式特殊字符
 *
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的安全字符串
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 导出公共 API
module.exports = { detectKeywords, KEYWORD_RULES };
