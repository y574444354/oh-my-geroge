const fs = require('fs');
const path = require('path');

// 手动验证 marketplace.json
const mpPath = 'C:/Users/SXF-Admin/.claude/plugins/cache/local/oh-my-costrict/0.1.0/.claude-plugin/marketplace.json';
const mp = JSON.parse(fs.readFileSync(mpPath, 'utf-8'));

console.log('=== marketplace.json ===');
console.log('name:', mp.name);
console.log('owner:', JSON.stringify(mp.owner));
console.log('plugins count:', mp.plugins?.length);
console.log('plugin[0].name:', mp.plugins?.[0]?.name);
console.log('plugin[0].source:', JSON.stringify(mp.plugins?.[0]?.source));
console.log('plugin[0].source type:', typeof mp.plugins?.[0]?.source);

// 检查所需字段
const checks = [
  ['name is non-empty string', typeof mp.name === 'string' && mp.name.length > 0],
  ['name has no spaces', !mp.name.includes(' ')],
  ['owner exists', mp.owner !== undefined && mp.owner !== null],
  ['owner.name is non-empty', typeof mp.owner?.name === 'string' && mp.owner.name.length > 0],
  ['plugins is array', Array.isArray(mp.plugins)],
  ['plugins[0].name exists', typeof mp.plugins?.[0]?.name === 'string'],
  ['plugins[0].source exists', mp.plugins?.[0]?.source !== undefined],
  ['plugins[0].source is string starting with ./', typeof mp.plugins?.[0]?.source === 'string' && mp.plugins[0].source.startsWith('./')],
];

let allPass = true;
for (const [name, result] of checks) {
  console.log(result ? '  PASS' : '  FAIL', '-', name);
  if (!result) allPass = false;
}

// 检查 known_marketplaces.json
const kmPath = 'C:/Users/SXF-Admin/.claude/plugins/known_marketplaces.json';
const km = JSON.parse(fs.readFileSync(kmPath, 'utf-8'));

console.log('\n=== known_marketplaces.json ===');
console.log('local entry exists:', !!km.local);
console.log('local.source:', JSON.stringify(km.local?.source));
console.log('local.installLocation:', km.local?.installLocation);

// 验证 installLocation 指向的 .claude-plugin/marketplace.json
const nestedPath = path.join(km.local?.installLocation || '', '.claude-plugin', 'marketplace.json');
console.log('\n=== installLocation check ===');
console.log('installLocation exists:', fs.existsSync(km.local?.installLocation));
console.log('.claude-plugin/marketplace.json exists:', fs.existsSync(nestedPath));

// 验证 installLocation 目录下的文件
if (km.local?.installLocation && fs.existsSync(km.local.installLocation)) {
  console.log('\ninstallLocation contents:');
  fs.readdirSync(km.local.installLocation).forEach(f => console.log('  ', f));
  const cpPath = path.join(km.local.installLocation, '.claude-plugin');
  if (fs.existsSync(cpPath)) {
    console.log('\n.claude-plugin contents:');
    fs.readdirSync(cpPath).forEach(f => console.log('  ', f));
  }
}

// 验证 installed_plugins.json
const ipPath = 'C:/Users/SXF-Admin/.claude/plugins/installed_plugins.json';
const ip = JSON.parse(fs.readFileSync(ipPath, 'utf-8'));
console.log('\n=== installed_plugins.json ===');
const costrictEntry = ip.plugins?.['oh-my-costrict@local'];
console.log('oh-my-costrict@local entry:', !!costrictEntry);
if (costrictEntry?.[0]) {
  console.log('  installPath:', costrictEntry[0].installPath);
  console.log('  version:', costrictEntry[0].version);
  console.log('  scope:', costrictEntry[0].scope);
}

// 尝试用 CSC 的 schema 验证
console.log('\n=== CSC Schema Validation ===');
try {
  // 动态导入 CSC 的 schemas 模块
  const schemasPath = 'C:/nvm4w/nodejs/node_modules/@costrict/csc/dist/utils/plugins/schemas.js';
  console.log('Trying schemas at:', schemasPath);
  console.log('File exists:', fs.existsSync(schemasPath));
} catch(e) {
  console.log('Schema import error:', e.message);
}

console.log('\n=== All manual checks done ===');
console.log(allPass ? 'ALL MANUAL CHECKS PASSED' : 'SOME MANUAL CHECKS FAILED');
