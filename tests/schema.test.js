/**
 * plugin.json Schema 验证测试
 *
 * 验证 plugin.json 文件包含 CSC 插件清单所需的所有必需字段。
 *
 * 运行方式：node --test tests/schema.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');

// 读取并解析 plugin.json 文件
function loadPluginJson() {
  // 插件根目录是测试目录的上级目录
  const pluginRoot = path.resolve(__dirname, '..');
  // 读取 plugin.json 文件
  const filePath = path.join(pluginRoot, 'plugin.json');
  const raw = readFileSync(filePath, 'utf-8');
  // 解析 JSON 并返回
  return JSON.parse(raw);
}

test('plugin.json — 顶层必需字段', () => {
  // 加载插件清单
  const plugin = loadPluginJson();

  // 验证 name 字段：必须是非空字符串
  assert.ok(typeof plugin.name === 'string' && plugin.name.length > 0, 'name 字段必须是非空字符串');

  // 验证 version 字段：必须是非空字符串
  assert.ok(typeof plugin.version === 'string' && plugin.version.length > 0, 'version 字段必须是非空字符串');

  // 验证 description 字段：必须是非空字符串
  assert.ok(typeof plugin.description === 'string' && plugin.description.length > 0, 'description 字段必须是非空字符串');

  // skills 和 agents 目录由 CSC 自动发现，plugin.json 中可不声明
  // 若声明则为额外路径，不做强制要求

  // 验证 hooks 字段：必须是非空对象
  assert.ok(typeof plugin.hooks === 'object' && plugin.hooks !== null, 'hooks 字段必须是对象');
  assert.ok(Object.keys(plugin.hooks).length > 0, 'hooks 对象不能为空');
});

test('plugin.json — hooks 必需事件', () => {
  // 加载插件清单
  const plugin = loadPluginJson();
  const hooks = plugin.hooks;

  // 验证 SessionStart 事件存在
  assert.ok(Array.isArray(hooks.SessionStart), 'hooks.SessionStart 必须是数组');
  assert.ok(hooks.SessionStart.length > 0, 'hooks.SessionStart 至少包含一个 hook 配置');

  // 验证 UserPromptSubmit 事件存在
  assert.ok(Array.isArray(hooks.UserPromptSubmit), 'hooks.UserPromptSubmit 必须是数组');
  assert.ok(hooks.UserPromptSubmit.length > 0, 'hooks.UserPromptSubmit 至少包含一个 hook 配置');
});

test('plugin.json — hook 配置结构', () => {
  // 加载插件清单
  const plugin = loadPluginJson();

  // 遍历所有 hook 事件，验证 hook 配置结构
  for (const [eventName, hookGroups] of Object.entries(plugin.hooks)) {
    // 每个事件的值必须是数组
    assert.ok(Array.isArray(hookGroups), `hooks.${eventName} 必须是数组`);

    for (const group of hookGroups) {
      // 每个 hook group 必须包含 hooks 数组
      assert.ok(Array.isArray(group.hooks), `hooks.${eventName}[].hooks 必须是数组`);

      for (const hook of group.hooks) {
        // 每个 hook 必须是 object
        assert.ok(typeof hook === 'object' && hook !== null, 'hook 条目必须是对象');

        // hook type 必须为 "command"
        assert.equal(hook.type, 'command', 'hook.type 必须为 "command"');

        // command 字段必须是非空字符串
        assert.ok(typeof hook.command === 'string' && hook.command.length > 0, 'hook.command 必须是非空字符串');

        // command 中应包含 ${CLAUDE_PLUGIN_ROOT} 占位符
        assert.ok(
          hook.command.includes('${CLAUDE_PLUGIN_ROOT}'),
          'hook.command 应包含 ${CLAUDE_PLUGIN_ROOT} 占位符'
        );

        // timeout 必须是正整数
        assert.ok(typeof hook.timeout === 'number' && hook.timeout > 0, 'hook.timeout 必须是正整数');
      }
    }
  }
});

test('plugin.json — 版本号格式', () => {
  // 加载插件清单
  const plugin = loadPluginJson();

  // 验证 version 符合 semver 格式 (x.y.z)
  const semverRegex = /^\d+\.\d+\.\d+$/;
  assert.ok(
    semverRegex.test(plugin.version),
    `version "${plugin.version}" 应符合 semver 格式 (x.y.z)`
  );
});
