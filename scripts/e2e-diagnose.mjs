// 端到端模拟 CSC 插件加载流程
// 1. 验证 known_marketplaces.json → KnownMarketplacesFileSchema
// 2. 验证 marketplace.json → PluginMarketplaceSchema
// 3. 模拟 loadPluginsFromMarketplaces 流程
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

const KNOWN_MP_PATH = 'C:/Users/SXF-Admin/.claude/plugins/known_marketplaces.json';
const INSTALLED_PLUGINS_PATH = 'C:/Users/SXF-Admin/.claude/plugins/installed_plugins.json';
const CACHE_DIR = 'C:/Users/SXF-Admin/.claude/plugins/cache/local/oh-my-costrict/0.1.0';
const MP_PATH = path.join(CACHE_DIR, '.claude-plugin', 'marketplace.json');
const PLUGIN_PATH = path.join(CACHE_DIR, '.claude-plugin', 'plugin.json');

console.log('=== 步骤 1: 读取 known_marketplaces.json ===');
const km = JSON.parse(fs.readFileSync(KNOWN_MP_PATH, 'utf-8'));
console.log('local entry exists:', !!km.local);
console.log('local.source:', JSON.stringify(km.local?.source));
console.log('local.installLocation:', km.local?.installLocation);
console.log('local.lastUpdated:', km.local?.lastUpdated);

// 检查 MarketplaceSourceSchema 的关键约束
const localSource = km.local?.source;
console.log('\n=== 步骤 2: MarketplaceSourceSchema 检查 ===');
console.log('source.source type:', localSource?.source);
console.log('source.source === "directory":', localSource?.source === 'directory');
console.log('source.path is string:', typeof localSource?.path === 'string');
console.log('source.path exists:', fs.existsSync(localSource?.path));

console.log('\n=== 步骤 3: 读取 marketplace.json (PluginMarketplaceSchema) ===');
const mp = JSON.parse(fs.readFileSync(MP_PATH, 'utf-8'));
console.log('marketplace name:', mp.name);
console.log('marketplace owner:', JSON.stringify(mp.owner));
console.log('plugins count:', mp.plugins?.length);
console.log('plugin[0].name:', mp.plugins?.[0]?.name);
console.log('plugin[0].source:', mp.plugins?.[0]?.source);
console.log('plugin[0].source type:', typeof mp.plugins?.[0]?.source);
console.log('plugin[0].source starts with ./:', mp.plugins?.[0]?.source?.startsWith('./'));

console.log('\n=== 步骤 4: 插件 .claude-plugin 目录检查 ===');
console.log('.claude-plugin/ exists:', fs.existsSync(path.join(CACHE_DIR, '.claude-plugin')));
console.log('plugin.json exists:', fs.existsSync(PLUGIN_PATH));
const pluginJson = JSON.parse(fs.readFileSync(PLUGIN_PATH, 'utf-8'));
console.log('plugin name:', pluginJson.name);
console.log('plugin version:', pluginJson.version);
console.log('plugin skills:', pluginJson.skills);
console.log('plugin hooks keys:', Object.keys(pluginJson.hooks || {}));

console.log('\n=== 步骤 5: Skills 目录检查 ===');
const skillsDir = path.join(CACHE_DIR, 'skills');
if (fs.existsSync(skillsDir)) {
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const s of skills) {
    if (s.isDirectory()) {
      const skillMd = path.join(skillsDir, s.name, 'SKILL.md');
      const agentMd = path.join(skillsDir, s.name);
      console.log(`  ${s.name}/`);
      console.log(`    SKILL.md exists: ${fs.existsSync(skillMd)}`);
    }
  }
}

console.log('\n=== 步骤 6: Agents 目录检查 ===');
const agentsDir = path.join(CACHE_DIR, 'agents');
if (fs.existsSync(agentsDir)) {
  const agents = fs.readdirSync(agentsDir);
  console.log(`  ${agents.length} agent files:`, agents.join(', '));
} else {
  console.log('  agents/ 目录不存在!');
}

console.log('\n=== 步骤 7: Hooks 目录检查 ===');
const hooksDir = path.join(CACHE_DIR, 'hooks');
if (fs.existsSync(hooksDir)) {
  const hooks = fs.readdirSync(hooksDir);
  console.log(`  hooks:`, hooks.join(', '));
  // 检查 hook 脚本可执行性
  for (const h of hooks) {
    const hookPath = path.join(hooksDir, h);
    const stat = fs.statSync(hookPath);
    console.log(`  ${h}: ${stat.size} bytes`);
  }
} else {
  console.log('  hooks/ 目录不存在!');
}

console.log('\n=== 步骤 8: installed_plugins.json 检查 ===');
const ip = JSON.parse(fs.readFileSync(INSTALLED_PLUGINS_PATH, 'utf-8'));
const entry = ip.plugins?.['oh-my-costrict@local'];
console.log('oh-my-costrict@local entry:', !!entry);
if (entry) {
  console.log('  installPath:', entry[0]?.installPath);
  console.log('  version:', entry[0]?.version);
  console.log('  scope:', entry[0]?.scope);
  console.log('  installPath exists:', fs.existsSync(entry[0]?.installPath));
}

console.log('\n=== 步骤 9: 模拟 getPluginByIdCacheOnly 查找 ===');
// 模拟: 从 marketplace.plugins 搜索插件
const found = mp.plugins?.find(p => p.name === 'oh-my-costrict');
console.log('在 marketplace.json 中找到 oh-my-costrict:', !!found);
if (found) {
  // 模拟: loadPluginFromMarketplaceEntryCacheOnly
  const pluginPath_resolved = path.join(CACHE_DIR, found.source);
  console.log('解析后的 pluginPath:', pluginPath_resolved);
  console.log('pluginPath 的 .claude-plugin/plugin.json 存在:', fs.existsSync(path.join(pluginPath_resolved, '.claude-plugin', 'plugin.json')));
}

console.log('\n=== 最终结论 ===');
const allOk =
  fs.existsSync(MP_PATH) &&
  fs.existsSync(PLUGIN_PATH) &&
  mp.plugins?.find(p => p.name === 'oh-my-costrict') &&
  fs.existsSync(path.join(CACHE_DIR, '.claude-plugin')) &&
  km.local?.source?.source === 'directory';

console.log(allOk ? '✅ 所有检查通过 - 插件应该可以加载' : '❌ 存在问题 - 检查上述输出');
