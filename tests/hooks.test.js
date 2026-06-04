/**
 * Hook 脚本集成测试
 *
 * 以子进程方式启动 hook 脚本，通过 stdin 发送 JSON 输入，
 * 验证 stdout 的 JSON 输出是否符合预期。
 *
 * 运行方式：node --test tests/hooks.test.js
 */

const { test } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

// 插件根目录
const pluginRoot = path.resolve(__dirname, '..');

/**
 * 启动子进程并发送 stdin JSON，返回 stdout JSON
 *
 * @param {string} scriptName - 脚本文件名（相对于 hooks/ 目录）
 * @param {object} stdinData - 要发送到 stdin 的 JSON 对象
 * @param {object} env - 额外的环境变量
 * @returns {Promise<object>} 解析后的 stdout JSON
 */
function runHookScript(scriptName, stdinData, env = {}) {
  // 构建脚本的绝对路径
  const scriptPath = path.join(pluginRoot, 'hooks', scriptName);

  // 返回 Promise 以支持异步等待
  return new Promise((resolve, reject) => {
    // 启动子进程，设置工作目录为插件根目录
    const child = spawn('node', [scriptPath], {
      cwd: pluginRoot,
      env: { ...process.env, ...env },
      // stdin 使用管道方式
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    // 收集 stdout 输出
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    // 收集 stderr 输出（用于调试）
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    // 进程错误处理
    child.on('error', (err) => {
      reject(new Error(`进程启动失败: ${err.message}`));
    });

    // 进程关闭后解析结果
    child.on('close', (code) => {
      try {
        // 尝试将 stdout 解析为 JSON
        const output = JSON.parse(stdout.trim());
        resolve(output);
      } catch (err) {
        // JSON 解析失败，返回原始输出和错误信息
        reject(new Error(
          `stdout JSON 解析失败 (exit code: ${code}): ${err.message}\n` +
          `stdout: ${stdout}\nstderr: ${stderr}`
        ));
      }
    });

    // 向子进程的 stdin 写入 JSON 输入
    child.stdin.write(JSON.stringify(stdinData));
    // 关闭 stdin 以通知子进程输入结束
    child.stdin.end();
  });
}

// ============ session-start.mjs 集成测试 ============

test('集成测试 — session-start hook 返回 continue: true', async () => {
  // 发送 SessionStart 事件的输入
  const stdinData = {
    hook_event_name: 'SessionStart',
    session_id: 'test-session-001',
    cwd: pluginRoot,
  };

  // 执行 hook 脚本，设置 CLAUDE_PLUGIN_ROOT 环境变量
  const result = await runHookScript('session-start.mjs', stdinData, {
    CLAUDE_PLUGIN_ROOT: pluginRoot,
  });

  // 验证输出必须包含 continue: true（非阻塞）
  assert.strictEqual(result.continue, true, 'session-start hook 必须返回 continue: true');

  // 验证 stopReason 为 null
  assert.strictEqual(result.stopReason, null);
});

test('集成测试 — session-start 注入了 claude.md 内容', async () => {
  // 发送 SessionStart 事件的输入
  const stdinData = {
    hook_event_name: 'SessionStart',
    session_id: 'test-session-002',
    cwd: pluginRoot,
  };

  // 执行 hook 脚本
  const result = await runHookScript('session-start.mjs', stdinData, {
    CLAUDE_PLUGIN_ROOT: pluginRoot,
  });

  // 验证 systemMessage 包含 claude.md 的关键内容
  assert.ok(typeof result.systemMessage === 'string', 'systemMessage 必须是字符串');
  assert.ok(result.systemMessage.length > 0, 'systemMessage 不能为空');

  // 验证包含编排大脑的关键章节标题
  const content = result.systemMessage;
  assert.ok(content.includes('多智能体编排'), '应包含多智能体编排说明');
  assert.ok(content.includes('planner'), '应包含 planner 代理信息');
  assert.ok(content.includes('executor'), '应包含 executor 代理信息');
  assert.ok(content.includes('reviewer'), '应包含 reviewer 代理信息');
});

// ============ keyword-detector.mjs 集成测试 ============

test('集成测试 — keyword-detector 检测到 "autopilot" 关键词', async () => {
  // 发送包含 "autopilot" 关键词的 prompt
  const stdinData = {
    hook_event_name: 'UserPromptSubmit',
    session_id: 'test-session-003',
    cwd: pluginRoot,
    prompt: '使用 autopilot 自动审查代码',
  };

  // 执行 hook 脚本
  const result = await runHookScript('keyword-detector.mjs', stdinData);

  // 验证输出
  assert.strictEqual(result.continue, true, 'keyword-detector hook 必须返回 continue: true');
  assert.ok(typeof result.systemMessage === 'string', 'systemMessage 必须是字符串');

  // 验证路由消息包含技能提示
  const msg = result.systemMessage;
  assert.ok(msg.includes('/oh-my-costrict:costrict-autopilot'), '路由消息应提及 /oh-my-costrict:costrict-autopilot 技能');
  assert.ok(msg.includes('planner'), '路由消息应提及 planner 代理');
  assert.ok(msg.includes('autopilot'), '路由消息应包含关键词');
});

test('集成测试 — keyword-detector 检测到 "team" 关键词', async () => {
  // 发送包含 "team" 关键词的 prompt
  const stdinData = {
    hook_event_name: 'UserPromptSubmit',
    session_id: 'test-session-004',
    cwd: pluginRoot,
    prompt: '/team 重构整个模块',
  };

  // 执行 hook 脚本
  const result = await runHookScript('keyword-detector.mjs', stdinData);

  // 验证路由消息包含 team 相关提示
  const msg = result.systemMessage;
  assert.ok(msg.includes('/oh-my-costrict:costrict-team'), '路由消息应提及 /oh-my-costrict:costrict-team 技能');
  assert.ok(msg.includes('executor'), '路由消息应提及 executor 代理');
});

test('集成测试 — keyword-detector 无匹配关键词时返回空 systemMessage', async () => {
  // 发送不包含任何关键词的普通 prompt
  const stdinData = {
    hook_event_name: 'UserPromptSubmit',
    session_id: 'test-session-005',
    cwd: pluginRoot,
    prompt: '帮我写一个 hello world',
  };

  // 执行 hook 脚本
  const result = await runHookScript('keyword-detector.mjs', stdinData);

  // 验证输出
  assert.strictEqual(result.continue, true, '无匹配时仍返回 continue: true');
  assert.strictEqual(result.systemMessage, '', '无匹配时 systemMessage 应为空字符串');
});

test('集成测试 — keyword-detector 处理空 prompt', async () => {
  // 发送空的 prompt
  const stdinData = {
    hook_event_name: 'UserPromptSubmit',
    session_id: 'test-session-006',
    cwd: pluginRoot,
    prompt: '',
  };

  // 执行 hook 脚本
  const result = await runHookScript('keyword-detector.mjs', stdinData);

  // 验证非侵入式行为
  assert.strictEqual(result.continue, true, '空 prompt 时仍返回 continue: true');
  assert.strictEqual(result.systemMessage, '', '空 prompt 时 systemMessage 应为空字符串');
});

test('集成测试 — session-start 在 CLAUDE_PLUGIN_ROOT 未设置时降级', async () => {
  // 不设置 CLAUDE_PLUGIN_ROOT 环境变量
  const stdinData = {
    hook_event_name: 'SessionStart',
    session_id: 'test-session-007',
    cwd: pluginRoot,
  };

  // 执行 hook 脚本，不传额外的环境变量
  const result = await runHookScript('session-start.mjs', stdinData);

  // 验证非侵入式降级：即使环境变量未设置，也不阻塞
  assert.strictEqual(result.continue, true, '未设置环境变量时不应阻塞');
  // systemMessage 可能为空（降级到 cwd 也可能找到文件），但不应报错
  assert.ok(typeof result.systemMessage === 'string', 'systemMessage 必须是字符串类型');
});
