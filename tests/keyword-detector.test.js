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

test('detectKeywords — 精确匹配 "workflow"', () => {
  // 输入包含完整关键词 "workflow"，应命中优先级 10
  const result = detectKeywords('运行 workflow 流水线');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'workflow');
  assert.equal(result.skill, 'oh-my-costrict:omg:workflow');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "构建"', () => {
  // 输入包含中文关键词 "构建"，应命中优先级 10
  const result = detectKeywords('构建一个新项目');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, '构建');
  assert.equal(result.skill, 'oh-my-costrict:omg:workflow');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "tdd"', () => {
  // 输入包含完整关键词 "tdd"，应命中优先级 10
  const result = detectKeywords('用 tdd 开发新功能');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'tdd');
  assert.equal(result.skill, 'oh-my-costrict:omg:tdd');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "review"', () => {
  // 输入包含完整关键词 "review"，应命中优先级 10
  const result = detectKeywords('进行代码 review');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'review');
  assert.equal(result.skill, 'oh-my-costrict:omg:review');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "审查"', () => {
  // 输入包含中文关键词 "审查"，应命中优先级 10
  const result = detectKeywords('需要审查这段代码');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, '审查');
  assert.equal(result.skill, 'oh-my-costrict:omg:review');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "verify"', () => {
  // 输入包含完整关键词 "verify"，应命中优先级 10
  const result = detectKeywords('验证并 verify 结果');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'verify');
  assert.equal(result.skill, 'oh-my-costrict:omg:verify');
  assert.equal(result.priority, 10);
});

test('detectKeywords — 精确匹配 "验证"', () => {
  // 输入包含中文关键词 "验证"，应命中优先级 10
  const result = detectKeywords('运行验证流程');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, '验证');
  assert.equal(result.skill, 'oh-my-costrict:omg:verify');
  assert.equal(result.priority, 10);
});

// ============ 部分匹配测试 ============

test('detectKeywords — 部分匹配 "grill"', () => {
  // "grill" 为非精确匹配（exact: false），子串即命中
  const result = detectKeywords('let me grill this design');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'grill');
  assert.equal(result.skill, 'oh-my-costrict:omg:grill-with-docs');
  assert.equal(result.priority, 10);
});

test('detectKeywords — "grill" 子串匹配 "grilling"', () => {
  // "grilling" 包含 "grill" 子串，应命中
  const result = detectKeywords('keep grilling my plan');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'grill');
  assert.equal(result.skill, 'oh-my-costrict:omg:grill-with-docs');
});

// ============ 不区分大小写测试 ============

test('detectKeywords — 大写 "WORKFLOW"', () => {
  // 匹配不区分大小写
  const result = detectKeywords('启动 WORKFLOW 模式');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'workflow');
  assert.equal(result.skill, 'oh-my-costrict:omg:workflow');
});

test('detectKeywords — 大写 "TDD"', () => {
  // 匹配不区分大小写
  const result = detectKeywords('使用 TDD 工作流');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'tdd');
  assert.equal(result.skill, 'oh-my-costrict:omg:tdd');
});

test('detectKeywords — 大写 "REVIEW"', () => {
  // 匹配不区分大小写
  const result = detectKeywords('进行代码 REVIEW');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'review');
  assert.equal(result.skill, 'oh-my-costrict:omg:review');
});

test('detectKeywords — 大写 "VERIFY"', () => {
  // 匹配不区分大小写
  const result = detectKeywords('VERIFY 所有测试');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'verify');
  assert.equal(result.skill, 'oh-my-costrict:omg:verify');
});

test('detectKeywords — 大写 "GRILL"', () => {
  // 匹配不区分大小写（grill 为部分匹配）
  const result = detectKeywords('GRILL my design');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'grill');
  assert.equal(result.skill, 'oh-my-costrict:omg:grill-with-docs');
});

// ============ 优先级测试 ============

test('detectKeywords — 同优先级取先匹配的（workflow 在 构建 之前）', () => {
  // "workflow" 和 "构建" 同为 priority 10，"workflow" 在规则表排前面
  const result = detectKeywords('workflow 构建');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'workflow', '同优先级时应取先匹配的 "workflow"');
  assert.equal(result.skill, 'oh-my-costrict:omg:workflow');
});

test('detectKeywords — 同优先级取先匹配的（review 在 审查 之前）', () => {
  // "review" 和 "审查" 同为 priority 10，"review" 在规则表排前面
  const result = detectKeywords('review 审查');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'review', '同优先级时应取先匹配的 "review"');
  assert.equal(result.skill, 'oh-my-costrict:omg:review');
});

test('detectKeywords — grill 匹配优先于同优先级规则', () => {
  // "grill" 和 "review" 同为 priority 10，"grill" 在规则表排前面
  const result = detectKeywords('grill the review');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'grill', '"grill" 应优先于 "review"');
  assert.equal(result.skill, 'oh-my-costrict:omg:grill-with-docs');
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

test('detectKeywords — "review" 不会匹配 "reviewing"', () => {
  // review 为精确词边界匹配，不应匹配 "reviewing"
  const result = detectKeywords('reviewing the code');

  assert.equal(result, null, '"reviewing" 不应匹配 "review"');
});

test('detectKeywords — "workflow" 不会匹配 "workflows"', () => {
  // workflow 为精确词边界匹配，不应匹配 "workflows"
  const result = detectKeywords('multiple workflows');

  assert.equal(result, null, '"workflows" 不应匹配 "workflow"');
});

test('detectKeywords — 中文语境下的关键词检测', () => {
  // 中文文本中嵌入英文关键词
  const result = detectKeywords('我想使用 workflow 模式来处理这个任务');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, 'workflow');
  assert.equal(result.skill, 'oh-my-costrict:omg:workflow');
});

test('detectKeywords — 中文关键词"审查"在复杂句子中', () => {
  // 中文文本中关键词检测
  const result = detectKeywords('请帮我审查一下这段代码的质量和安全性');

  assert.ok(result !== null, '应返回匹配结果');
  assert.equal(result.keyword, '审查');
  assert.equal(result.skill, 'oh-my-costrict:omg:review');
});

test('detectKeywords — "auto" 不再匹配任何规则', () => {
  // 旧的 "auto" 规则已移除，不应再匹配
  const result = detectKeywords('auto approve this');

  assert.equal(result, null, '"auto" 不再有匹配规则');
});

test('detectKeywords — "team" 不再匹配任何规则', () => {
  // 旧的 "team" 规则已移除，不应再匹配（除非作为review/grill的子串）
  // "team" 本身不含其他关键词
  const result = detectKeywords('/team 重构代码');

  assert.equal(result, null, '"team" 不再有匹配规则');
});
