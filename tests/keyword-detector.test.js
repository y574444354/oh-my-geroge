/**
 * keyword-detector 纯函数单元测试
 *
 * 测试 detectKeywords() 函数在各种输入下的匹配行为。
 *
 * 运行方式：node --test tests/keyword-detector.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { detectKeywords } = require('../hooks/lib/keyword-detector.js');

// ============ 精确匹配测试 ============

test('detectKeywords — 精确匹配 "autopilot"', () => {
  // 输入包含完整关键词 "autopilot"，应命中优先级 10
  const result = detectKeywords('使用 autopilot 来审查');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'autopilot');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "team"', () => {
  // 输入包含完整关键词 "team"，应命中优先级 10
  const result = detectKeywords('/team 重构代码');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'team');
  assert.equal(result.skill, 'oh-my-costrict:costrict-team');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "tdd"', () => {
  // 输入包含完整关键词 "tdd"，应命中优先级 10
  const result = detectKeywords('用 tdd 开发新功能');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'tdd');
  assert.equal(result.skill, 'oh-my-costrict:tdd-guide');
  assert.equal(result.priority, 10);
});

// ============ 部分匹配测试 ============

test('detectKeywords — 部分匹配 "auto"', () => {
  // "auto" 为非精确匹配，命中优先级 5
  const result = detectKeywords('auto approve this');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'auto');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
  assert.equal(result.priority, 5);
});

test('detectKeywords — "auto" 部分匹配子串', () => {
  // "automation" 包含 "auto" 子串，应命中
  const result = detectKeywords('run automation tests');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'auto');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
});

// ============ 不区分大小写测试 ============

test('detectKeywords — 大写关键词', () => {
  // 匹配不区分大小写
  const result = detectKeywords('AUTOPILOT 模式');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'autopilot');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
});

test('detectKeywords — 混合大小写关键词', () => {
  // 匹配不区分大小写
  const result = detectKeywords('使用 AutoPilot 功能');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'autopilot');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
});

test('detectKeywords — 大写 "TEAM"', () => {
  // 匹配不区分大小写
  const result = detectKeywords('需要 TEAM 协作');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'team');
  assert.equal(result.skill, 'oh-my-costrict:costrict-team');
});

test('detectKeywords — 小写 "TDD"', () => {
  // 匹配不区分大小写（TDD 作为精确匹配词边界）
  const result = detectKeywords('实施 tdd 工作流');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'tdd');
  assert.equal(result.skill, 'oh-my-costrict:tdd-guide');
});

// ============ 优先级测试 ============

test('detectKeywords — "autopilot" 优先级高于 "auto"', () => {
  // "autopilot" (priority 10) 应优先于 "auto" (priority 5)
  const result = detectKeywords('使用 autopilot');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'autopilot', '"autopilot" 优先级更高应胜出');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 同优先级取先匹配的', () => {
  // "autopilot" 和 "team" 都为 priority 10，"autopilot" 排前面
  const result = detectKeywords('autopilot 和 team 同时使用');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'autopilot', '同优先级时应取先匹配的 "autopilot"');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
});

// ============ 无匹配测试 ============

test('detectKeywords — 无关键词的普通 prompt', () => {
  // 不包含任何预设关键词
  const result = detectKeywords('帮我写一个函数');

  assert.equal(result, null, '应返回 null');
});

test('detectKeywords — 仅包含空白字符', () => {
  // 空白字符串应返回 null
  const result = detectKeywords('   ');

  assert.equal(result, null, '空白字符串应返回 null');
});

test('detectKeywords — 空字符串', () => {
  // 空字符串应返回 null
  const result = detectKeywords('');

  assert.equal(result, null, '空字符串应返回 null');
});

test('detectKeywords — 非字符串类型输入', () => {
  // 非字符串输入应返回 null

  // null 输入
  assert.equal(detectKeywords(null), null, 'null 应返回 null');

  // undefined 输入
  assert.equal(detectKeywords(undefined), null, 'undefined 应返回 null');

  // 数字输入
  assert.equal(detectKeywords(123), null, '数字应返回 null');

  // 对象输入
  assert.equal(detectKeywords({}), null, '对象应返回 null');
});

// ============ 边界条件测试 ============

test('detectKeywords — "tdd" 不会匹配 "tddrama"', () => {
  // tdd 为精确词边界匹配，不应匹配 "tddrama"
  const result = detectKeywords('watch a tddrama');

  assert.equal(result, null, '"tddrama" 不应匹配 "tdd"');
});

test('detectKeywords — "autopiloting" 仅触发部分匹配 "auto"', () => {
  // "autopiloting" 不在词边界规则内，不匹配 "autopilot" 精确匹配
  // 但它包含 "auto" 子串，触发 "auto" 的部分匹配（优先级 5）
  const result = detectKeywords('autopiloting the plane');

  assert.ok(result !== null, '"autopiloting" 应通过部分匹配 "auto" 命中');
  assert.equal(result.keyword, 'auto', '应匹配 "auto" 而非 "autopilot"');
  assert.equal(result.skill, 'oh-my-costrict:costrict-autopilot');
  assert.equal(result.priority, 5, '优先级应为 5（部分匹配）');
});

test('detectKeywords — 中文语境下的关键词检测', () => {
  // 中文文本中嵌入英文关键词
  const result = detectKeywords('我想使用 team 模式来处理这个任务');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'team');
  assert.equal(result.skill, 'oh-my-costrict:costrict-team');
});
