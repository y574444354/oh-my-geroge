// 使用 CSC 运行时 schema 验证 marketplace.json
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mpPath = 'C:/Users/SXF-Admin/.claude/plugins/cache/local/oh-my-costrict/0.1.0/.claude-plugin/marketplace.json';
const fs = require('fs');

// 方法 1: 尝试从 @costrict/csc 导入 schemas
async function tryImportCsc() {
  try {
    console.log('尝试方法 1: 从 @costrict/csc 导入...');
    const csc = await import('@costrict/csc');
    console.log('CSC exports:', Object.keys(csc));
  } catch (e) {
    console.log('方法 1 失败:', e.message);
  }
}

// 方法 2: 尝试 require csc dist services
function tryRequireServices() {
  try {
    console.log('\n尝试方法 2: require CSC dist...');
    const schemas = require('C:/nvm4w/nodejs/node_modules/@costrict/csc/dist/cli.js');
    console.log('Loaded CSC dist, keys:', Object.keys(schemas).slice(0, 20));
  } catch (e) {
    console.log('方法 2 失败:', e.message);
  }
}

// 方法 3: 读取 bundled CLI 源码，搜索 PluginMarketplaceSchema
function searchBundledSchema() {
  console.log('\n尝试方法 3: 搜索 bundled 文件中的 schema...');
  const cliPath = 'C:/nvm4w/nodejs/node_modules/@costrict/csc/dist/cli.js';
  const content = fs.readFileSync(cliPath, 'utf-8');

  // 搜索 PluginMarketplaceSchema
  const match = content.match(/PluginMarketplaceSchema\s*=\s*lazySchema[^}]*\}\s*\)\s*\)/);
  if (match) {
    console.log('找到 PluginMarketplaceSchema 定义 (部分):', match[0].substring(0, 200));
  } else {
    console.log('未找到完整定义，搜索片段...');
    const idx = content.indexOf('PluginMarketplaceSchema');
    if (idx >= 0) {
      console.log('上下文:', content.substring(idx, idx + 500));
    }
  }

  // 搜索 MarketplaceNameSchema
  const mnIdx = content.indexOf('MarketplaceNameSchema');
  if (mnIdx >= 0) {
    console.log('\nMarketplaceNameSchema 上下文:', content.substring(mnIdx, mnIdx + 600));
  }

  // 搜索 PluginMarketplaceEntrySchema
  const peIdx = content.indexOf('PluginMarketplaceEntrySchema');
  if (peIdx >= 0) {
    console.log('\nPluginMarketplaceEntrySchema 上下文:', content.substring(peIdx, peIdx + 800));
  }
}

// 方法 4: 直接测试 JSON 解析和基本格式
function manualCheck() {
  console.log('\n=== 手动验证 marketplace.json ===');
  const mp = JSON.parse(fs.readFileSync(mpPath, 'utf-8'));

  console.log('顶层 keys:', Object.keys(mp));
  console.log('name type:', typeof mp.name, 'value:', mp.name);
  console.log('owner type:', typeof mp.owner, 'keys:', Object.keys(mp.owner));
  console.log('plugins is array:', Array.isArray(mp.plugins));
  console.log('plugins[0]:', JSON.stringify(mp.plugins[0], null, 2));

  // 检查相对路径
  const source = mp.plugins[0].source;
  console.log('\nsource 检查:');
  console.log('  类型:', typeof source);
  console.log('  值:', JSON.stringify(source));
  console.log('  是否以 ./ 开头:', typeof source === 'string' && source.startsWith('./'));
}

async function main() {
  manualCheck();
  await tryImportCsc();
  tryRequireServices();
  searchBundledSchema();
}

main().catch(console.error);
