#!/usr/bin/env node

/**
 * git-shit-done CLI
 * 用于将 agent 系统安装到你的项目中的 CLI 工具
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const crypto = require('crypto');

// 颜色代码
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// 从 package.json 获取版本号
const pkg = require('../package.json');

// 解析命令行参数
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasOpencode = args.includes('--opencode');
const hasClaude = args.includes('--claude');
const hasGemini = args.includes('--gemini');
const hasBoth = args.includes('--both'); // 旧版标志，保持兼容
const hasAll = args.includes('--all');
const hasUninstall = args.includes('--uninstall') || args.includes('-u');

// 运行时选择 - 可通过标志或交互式提示设置
let selectedRuntimes = [];
if (hasAll) {
  selectedRuntimes = ['claude', 'opencode', 'gemini'];
} else if (hasBoth) {
  selectedRuntimes = ['claude', 'opencode'];
} else {
  if (hasOpencode) selectedRuntimes.push('opencode');
  if (hasClaude) selectedRuntimes.push('claude');
  if (hasGemini) selectedRuntimes.push('gemini');
}

// 获取运行时的目录名称辅助函数（用于本地/项目安装）
function getDirName(runtime) {
  if (runtime === 'opencode') return '.opencode';
  if (runtime === 'gemini') return '.gemini';
  return '.claude';
}

/**
 * 获取 OpenCode 的全局配置目录
 * OpenCode 遵循 XDG Base Directory 规范，使用 ~/.config/opencode/
 * 优先级：OPENCODE_CONFIG_DIR > dirname(OPENCODE_CONFIG) > XDG_CONFIG_HOME/opencode > ~/.config/opencode
 */
function getOpencodeGlobalDir() {
  // 1. 显式的 OPENCODE_CONFIG_DIR 环境变量
  if (process.env.OPENCODE_CONFIG_DIR) {
    return expandTilde(process.env.OPENCODE_CONFIG_DIR);
  }
  
  // 2. OPENCODE_CONFIG 环境变量（使用其目录）
  if (process.env.OPENCODE_CONFIG) {
    return path.dirname(expandTilde(process.env.OPENCODE_CONFIG));
  }
  
  // 3. XDG_CONFIG_HOME/opencode
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(expandTilde(process.env.XDG_CONFIG_HOME), 'opencode');
  }
  
  // 4. 默认：~/.config/opencode（XDG 默认值）
  return path.join(os.homedir(), '.config', 'opencode');
}

/**
 * 获取运行时的全局配置目录
 * @param {string} runtime - 'claude'、'opencode' 或 'gemini'
 * @param {string|null} explicitDir - 来自 --config-dir 标志的显式目录
 */
function getGlobalDir(runtime, explicitDir = null) {
  if (runtime === 'opencode') {
    // 对于 OpenCode，--config-dir 覆盖环境变量
    if (explicitDir) {
      return expandTilde(explicitDir);
    }
    return getOpencodeGlobalDir();
  }
  
  if (runtime === 'gemini') {
    // Gemini：--config-dir > GEMINI_CONFIG_DIR > ~/.gemini
    if (explicitDir) {
      return expandTilde(explicitDir);
    }
    if (process.env.GEMINI_CONFIG_DIR) {
      return expandTilde(process.env.GEMINI_CONFIG_DIR);
    }
    return path.join(os.homedir(), '.gemini');
  }
  
  // Claude Code：--config-dir > CLAUDE_CONFIG_DIR > ~/.claude
  if (explicitDir) {
    return expandTilde(explicitDir);
  }
  if (process.env.CLAUDE_CONFIG_DIR) {
    return expandTilde(process.env.CLAUDE_CONFIG_DIR);
  }
  return path.join(os.homedir(), '.claude');
}

const banner = '\n' +
  cyan + '   ██████╗ ███████╗██████╗\n' +
  '  ██╔════╝ ██╔════╝██╔══██╗\n' +
  '  ██║  ███╗███████╗██║  ██║\n' +
  '  ██║   ██║╚════██║██║  ██║\n' +
  '  ╚██████╔╝███████║██████╔╝\n' +
  '   ╚═════╝ ╚══════╝╚═════╝' + reset + '\n' +
  '\n' +
  '  Get Shit Done ' + dim + 'v' + pkg.version + reset + '\n' +
  '  一个由 TÂCHES 为 Claude Code、OpenCode 和 Gemini 提供的\n' +
  '  元提示、上下文工程和规范驱动的开发系统。\n';

// 解析 --config-dir 参数
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    // 如果提供了 --config-dir 但没有值或下一个参数是另一个标志，则报错
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir 需要一个路径参数${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  // 同时处理 --config-dir=value 格式
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) {
    const value = configDirArg.split('=')[1];
    if (!value) {
      console.error(`  ${yellow}--config-dir 需要一个非空路径${reset}`);
      process.exit(1);
    }
    return value;
  }
  return null;
}
const explicitConfigDir = parseConfigDirArg();
const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');

console.log(banner);

// 如果请求帮助则显示
if (hasHelp) {
  console.log(`  ${yellow}用法：${reset} npx get-shit-done-cc [选项]\n\n  ${yellow}选项：${reset}\n    ${cyan}-g, --global${reset}              全局安装（到配置目录）\n    ${cyan}-l, --local${reset}               本地安装（到当前目录）\n    ${cyan}--claude${reset}                  仅为 Claude Code 安装\n    ${cyan}--opencode${reset}                仅为 OpenCode 安装\n    ${cyan}--gemini${reset}                  仅为 Gemini 安装\n    ${cyan}--all${reset}                     为所有运行时安装\n    ${cyan}-u, --uninstall${reset}           卸载 GSD（删除所有 GSD 文件）\n    ${cyan}-c, --config-dir <path>${reset}   指定自定义配置目录\n    ${cyan}-h, --help${reset}                显示此帮助信息\n    ${cyan}--force-statusline${reset}        替换现有的状态栏配置\n\n  ${yellow}示例：${reset}\n    ${dim}# 交互式安装（提示选择运行时和位置）${reset}\n    npx get-shit-done-cc\n\n    ${dim}# 为 Claude Code 全局安装${reset}\n    npx get-shit-done-cc --claude --global\n\n    ${dim}# 为 Gemini 全局安装${reset}\n    npx get-shit-done-cc --gemini --global\n\n    ${dim}# 为所有运行时全局安装${reset}\n    npx get-shit-done-cc --all --global\n\n    ${dim}# 安装到自定义配置目录${reset}\n    npx get-shit-done-cc --claude --global --config-dir ~/.claude-bc\n\n    ${dim}# 仅安装到当前项目${reset}\n    npx get-shit-done-cc --claude --local\n\n    ${dim}# 从 Claude Code 全局卸载 GSD${reset}\n    npx get-shit-done-cc --claude --global --uninstall\n\n  ${yellow}说明：${reset}\n    --config-dir 选项在您有多个配置时很有用。\n    它的优先级高于 CLAUDE_CONFIG_DIR / GEMINI_CONFIG_DIR 环境变量。\n`);
  process.exit(0);
}

/**
 * 将 ~ 展开为家目录（shell 不会在传递给 node 的环境变量中展开 ~）
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * 使用正斜杠构建 hook 命令路径以实现跨平台兼容性。
 * 在 Windows 上，cmd.exe/PowerShell 不会展开 $HOME，所以我们使用实际路径。
 */
function buildHookCommand(configDir, hookName) {
  // 使用正斜杠以在所有平台上实现 Node.js 兼容性
  const hooksPath = configDir.replace(/\\/g, '/') + '/hooks/' + hookName;
  return `node "${hooksPath}"`;
}

/**
 * 读取并解析 settings.json，如果不存在则返回空对象
 */
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * 以正确格式写入 settings.json
 */
function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

// 署名设置缓存（在安装期间为每个运行时填充一次）
const attributionCache = new Map();

/**
 * 获取运行时的提交署名设置
 * @param {string} runtime - 'claude'、'opencode' 或 'gemini'
 * @returns {null|undefined|string} null = 删除，undefined = 保持默认，string = 自定义
 */
function getCommitAttribution(runtime) {
  // 如果有缓存值则返回
  if (attributionCache.has(runtime)) {
    return attributionCache.get(runtime);
  }

  let result;

  if (runtime === 'opencode') {
    const config = readSettings(path.join(getGlobalDir('opencode', null), 'opencode.json'));
    result = config.disable_ai_attribution === true ? null : undefined;
  } else if (runtime === 'gemini') {
    // Gemini：检查 gemini settings.json 中的署名配置
    const settings = readSettings(path.join(getGlobalDir('gemini', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  } else {
    // Claude Code
    const settings = readSettings(path.join(getGlobalDir('claude', explicitConfigDir), 'settings.json'));
    if (!settings.attribution || settings.attribution.commit === undefined) {
      result = undefined;
    } else if (settings.attribution.commit === '') {
      result = null;
    } else {
      result = settings.attribution.commit;
    }
  }

  // 缓存并返回
  attributionCache.set(runtime, result);
  return result;
}

/**
 * 根据署名设置处理 Co-Authored-By 行
 * @param {string} content - 要处理的文件内容
 * @param {null|undefined|string} attribution - null=删除，undefined=保持，string=替换
 * @returns {string} 处理后的内容
 */
function processAttribution(content, attribution) {
  if (attribution === null) {
    // 删除 Co-Authored-By 行及其前面的空行
    return content.replace(/(\r?\n){2}Co-Authored-By:.*$/gim, '');
  }
  if (attribution === undefined) {
    return content;
  }
  // 替换为自定义署名（转义 $ 以防止反向引用注入）
  const safeAttribution = attribution.replace(/\$/g, '$$$$');
  return content.replace(/Co-Authored-By:.*$/gim, `Co-Authored-By: ${safeAttribution}`);
}

/**
 * 将 Claude Code frontmatter 转换为 opencode 格式
 * - 将 'allowed-tools:' 数组转换为 'permission:' 对象
 * @param {string} content - 带有 YAML frontmatter 的 Markdown 文件内容
 * @returns {string} - 转换了 frontmatter 的内容
 */
// 颜色名称到十六进制的映射，用于 opencode 兼容性
const colorNameToHex = {
  cyan: '#00FFFF',
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  magenta: '#FF00FF',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
};

// 从 Claude Code 到 OpenCode 的工具名称映射
// OpenCode 使用小写工具名称；重命名工具有特殊映射
const claudeToOpencodeTools = {
  AskUserQuestion: 'question',
  SlashCommand: 'skill',
  TodoWrite: 'todowrite',
  WebFetch: 'webfetch',
  WebSearch: 'websearch',  // 插件/MCP - 保持兼容性
};

// 从 Claude Code 到 Gemini CLI 的工具名称映射
// Gemini CLI 使用 snake_case 内置工具名称
const claudeToGeminiTools = {
  Read: 'read_file',
  Write: 'write_file',
  Edit: 'replace',
  Bash: 'run_shell_command',
  Glob: 'glob',
  Grep: 'search_file_content',
  WebSearch: 'google_web_search',
  WebFetch: 'web_fetch',
  TodoWrite: 'write_todos',
  AskUserQuestion: 'ask_user',
};

/**
 * 将 Claude Code 工具名称转换为 OpenCode 格式
 * - 应用特殊映射（AskUserQuestion -> question 等）
 * - 转换为小写（MCP 工具除外，它们保持其格式）
 */
function convertToolName(claudeTool) {
  // 首先检查特殊映射
  if (claudeToOpencodeTools[claudeTool]) {
    return claudeToOpencodeTools[claudeTool];
  }
  // MCP 工具（mcp__*）保持其格式
  if (claudeTool.startsWith('mcp__')) {
    return claudeTool;
  }
  // 默认：转换为小写
  return claudeTool.toLowerCase();
}

/**
 * 将 Claude Code 工具名称转换为 Gemini CLI 格式
 * - 应用 Claude→Gemini 映射（Read→read_file、Bash→run_shell_command 等）
 * - 过滤掉 MCP 工具（mcp__*）- 它们在 Gemini 中在运行时自动发现
 * - 过滤掉 Task - agents 在 Gemini 中作为工具自动注册
 * @returns {string|null} Gemini 工具名称，如果工具应被排除则返回 null
 */
function convertGeminiToolName(claudeTool) {
  // MCP 工具：排除 - 在运行时从 mcpServers 配置自动发现
  if (claudeTool.startsWith('mcp__')) {
    return null;
  }
  // Task：排除 - agents 自动注册为可调用工具
  if (claudeTool === 'Task') {
    return null;
  }
  // 检查显式映射
  if (claudeToGeminiTools[claudeTool]) {
    return claudeToGeminiTools[claudeTool];
  }
  // 默认：小写
  return claudeTool.toLowerCase();
}

/**
 * 为 Gemini CLI 输出去除 HTML <sub> 标签
 * 终端不支持下标 - Gemini 将这些呈现为原始 HTML。
 * 将 <sub>text</sub> 转换为斜体 *(text)* 以实现可读的终端输出。
 */
function stripSubTags(content) {
  return content.replace(/<sub>(.*?)<\/sub>/g, '*($1)*');
}

/**
 * 将 Claude Code agent frontmatter 转换为 Gemini CLI 格式
 * Gemini agents 使用 .md 文件和 YAML frontmatter，与 Claude 相同，
 * 但字段名称和格式不同：
 * - tools：必须是 YAML 数组（不是逗号分隔的字符串）
 * - 工具名称：必须使用 Gemini 内置名称（read_file，而不是 Read）
 * - color：必须删除（会导致验证错误）
 * - mcp__* 工具：必须排除（在运行时自动发现）
 */
function convertClaudeToGeminiAgent(content) {
  if (!content.startsWith('---')) return content;

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return content;

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3);

  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const tools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 将 allowed-tools YAML 数组转换为 tools 列表
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    // 处理内联 tools: 字段（逗号分隔的字符串）
    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        const parsed = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        for (const t of parsed) {
          const mapped = convertGeminiToolName(t);
          if (mapped) tools.push(mapped);
        }
      } else {
        // tools: 没有值意味着 YAML 数组跟随
        inAllowedTools = true;
      }
      continue;
    }

    // 去除 color 字段（Gemini CLI 不支持，会导致验证错误）
    if (trimmed.startsWith('color:')) continue;

    // 收集 allowed-tools/tools 数组项
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        const mapped = convertGeminiToolName(trimmed.substring(2).trim());
        if (mapped) tools.push(mapped);
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        inAllowedTools = false;
      }
    }

    if (!inAllowedTools) {
      newLines.push(line);
    }
  }

  // 将 tools 添加为 YAML 数组（Gemini 需要数组格式）
  if (tools.length > 0) {
    newLines.push('tools:');
    for (const tool of tools) {
      newLines.push(`  - ${tool}`);
    }
  }

  const newFrontmatter = newLines.join('\n').trim();
  return `---\n${newFrontmatter}\n---${stripSubTags(body)}`;
}

function convertClaudeToOpencodeFrontmatter(content) {
  // 替换内容中的工具名称引用（适用于所有文件）
  let convertedContent = content;
  convertedContent = convertedContent.replace(/\bAskUserQuestion\b/g, 'question');
  convertedContent = convertedContent.replace(/\bSlashCommand\b/g, 'skill');
  convertedContent = convertedContent.replace(/\bTodoWrite\b/g, 'todowrite');
  // 将 /gsd:command 替换为 /gsd-command，用于 opencode（扁平命令结构）
  convertedContent = convertedContent.replace(/\/gsd:/g, '/gsd-');
  // 将 ~/.claude 替换为 ~/.config/opencode（OpenCode 的正确配置位置）
  convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.config/opencode');

  // 检查内容是否有 frontmatter
  if (!convertedContent.startsWith('---')) {
    return convertedContent;
  }

  // 查找 frontmatter 的结尾
  const endIndex = convertedContent.indexOf('---', 3);
  if (endIndex === -1) {
    return convertedContent;
  }

  const frontmatter = convertedContent.substring(3, endIndex).trim();
  const body = convertedContent.substring(endIndex + 3);

  // 逐行解析 frontmatter（简单的 YAML 解析）
  const lines = frontmatter.split('\n');
  const newLines = [];
  let inAllowedTools = false;
  const allowedTools = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // 检测 allowed-tools 数组的开始
    if (trimmed.startsWith('allowed-tools:')) {
      inAllowedTools = true;
      continue;
    }

    // 检测内联 tools: 字段（逗号分隔的字符串）
    if (trimmed.startsWith('tools:')) {
      const toolsValue = trimmed.substring(6).trim();
      if (toolsValue) {
        // 解析逗号分隔的工具
        const tools = toolsValue.split(',').map(t => t.trim()).filter(t => t);
        allowedTools.push(...tools);
      }
      continue;
    }

    // 删除 name: 字段 - opencode 使用文件名作为命令名称
    if (trimmed.startsWith('name:')) {
      continue;
    }

    // 为 opencode 将颜色名称转换为十六进制
    if (trimmed.startsWith('color:')) {
      const colorValue = trimmed.substring(6).trim().toLowerCase();
      const hexColor = colorNameToHex[colorValue];
      if (hexColor) {
        newLines.push(`color: "${hexColor}"`);
      } else if (colorValue.startsWith('#')) {
        // 验证十六进制颜色格式（#RGB 或 #RRGGBB）
        if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/i.test(colorValue)) {
          // 已经是十六进制且有效，保持原样
          newLines.push(line);
        }
        // 跳过无效的十六进制颜色
      }
      // 跳过未知的颜色名称
      continue;
    }

    // 收集 allowed-tools 项
    if (inAllowedTools) {
      if (trimmed.startsWith('- ')) {
        allowedTools.push(trimmed.substring(2).trim());
        continue;
      } else if (trimmed && !trimmed.startsWith('-')) {
        // 数组结束，新字段开始
        inAllowedTools = false;
      }
    }

    // 保留其他字段（包括 name:，opencode 会忽略它）
    if (!inAllowedTools) {
      newLines.push(line);
    }
  }

  // 如果我们有 allowed-tools 或 tools，则添加 tools 对象
  if (allowedTools.length > 0) {
    newLines.push('tools:');
    for (const tool of allowedTools) {
      newLines.push(`  ${convertToolName(tool)}: true`);
    }
  }

  // 重建 frontmatter（body 已经转换了工具名称）
  const newFrontmatter = newLines.join('\n').trim();
  return `---\n${newFrontmatter}\n---${body}`;
}

/**
 * 将 Claude Code markdown 命令转换为 Gemini TOML 格式
 * @param {string} content - 带有 YAML frontmatter 的 Markdown 文件内容
 * @returns {string} - TOML 内容
 */
function convertClaudeToGeminiToml(content) {
  // 检查内容是否有 frontmatter
  if (!content.startsWith('---')) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();
  
  // 从 frontmatter 提取描述
  let description = '';
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim();
      break;
    }
  }

  // 构造 TOML
  let toml = '';
  if (description) {
    toml += `description = ${JSON.stringify(description)}\n`;
  }
  
  toml += `prompt = ${JSON.stringify(body)}\n`;
  
  return toml;
}

/**
 * 将命令复制到 OpenCode 的扁平结构
 * OpenCode 期望：command/gsd-help.md（作为 /gsd-help 调用）
 * 源结构：commands/gsd/help.md
 * 
 * @param {string} srcDir - 源目录（例如：commands/gsd/）
 * @param {string} destDir - 目标目录（例如：command/）
 * @param {string} prefix - 文件名前缀（例如：'gsd'）
 * @param {string} pathPrefix - 文件引用的路径前缀
 * @param {string} runtime - 目标运行时（'claude' 或 'opencode'）
 */
function copyFlattenedCommands(srcDir, destDir, prefix, pathPrefix, runtime) {
  if (!fs.existsSync(srcDir)) {
    return;
  }
  
  // 在复制新文件之前删除旧的 gsd-*.md 文件
  if (fs.existsSync(destDir)) {
    for (const file of fs.readdirSync(destDir)) {
      if (file.startsWith(`${prefix}-`) && file.endsWith('.md')) {
        fs.unlinkSync(path.join(destDir, file));
      }
    }
  } else {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    
    if (entry.isDirectory()) {
      // 递归到子目录，添加到前缀
      // 例如：commands/gsd/debug/start.md -> command/gsd-debug-start.md
      copyFlattenedCommands(srcPath, destDir, `${prefix}-${entry.name}`, pathPrefix, runtime);
    } else if (entry.name.endsWith('.md')) {
      // 扁平化：help.md -> gsd-help.md
      const baseName = entry.name.replace('.md', '');
      const destName = `${prefix}-${baseName}.md`;
      const destPath = path.join(destDir, destName);

      let content = fs.readFileSync(srcPath, 'utf8');
      const claudeDirRegex = /~\/\.claude\//g;
      const opencodeDirRegex = /~\/\.opencode\//g;
      content = content.replace(claudeDirRegex, pathPrefix);
      content = content.replace(opencodeDirRegex, pathPrefix);
      content = processAttribution(content, getCommitAttribution(runtime));
      content = convertClaudeToOpencodeFrontmatter(content);

      fs.writeFileSync(destPath, content);
    }
  }
}

/**
 * 递归复制目录，替换 .md 文件中的路径
 * 首先删除现有的 destDir 以防止来自以前版本的孤立文件
 * @param {string} srcDir - 源目录
 * @param {string} destDir - 目标目录
 * @param {string} pathPrefix - 文件引用的路径前缀
 * @param {string} runtime - 目标运行时（'claude'、'opencode'、'gemini'）
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix, runtime) {
  const isOpencode = runtime === 'opencode';
  const dirName = getDirName(runtime);

  // 清洁安装：删除现有目标以防止孤立文件
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix, runtime);
    } else if (entry.name.endsWith('.md')) {
      // 始终替换 ~/.claude/，因为它是 repo 中的真实来源
      let content = fs.readFileSync(srcPath, 'utf8');
      const claudeDirRegex = /~\/\.claude\//g;
      content = content.replace(claudeDirRegex, pathPrefix);
      content = processAttribution(content, getCommitAttribution(runtime));

      // 为 opencode 兼容性转换 frontmatter
      if (isOpencode) {
        content = convertClaudeToOpencodeFrontmatter(content);
        fs.writeFileSync(destPath, content);
      } else if (runtime === 'gemini') {
        // 为 Gemini 转换为 TOML（去除 <sub> 标签 - 终端无法呈现下标）
        content = stripSubTags(content);
        const tomlContent = convertClaudeToGeminiToml(content);
        // 将扩展名替换为 .toml
        const tomlPath = destPath.replace(/\.md$/, '.toml');
        fs.writeFileSync(tomlPath, tomlContent);
      } else {
        fs.writeFileSync(destPath, content);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * 清理来自以前 GSD 版本的孤立文件
 */
function cleanupOrphanedFiles(configDir) {
  const orphanedFiles = [
    'hooks/gsd-notify.sh',  // 在 v1.6.x 中删除
    'hooks/statusline.js',  // 在 v1.9.0 中重命名为 gsd-statusline.js
  ];

  for (const relPath of orphanedFiles) {
    const fullPath = path.join(configDir, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`  ${green}✓${reset} 删除了孤立的 ${relPath}`);
    }
  }
}

/**
 * 从 settings.json 清理孤立的 hook 注册
 */
function cleanupOrphanedHooks(settings) {
  const orphanedHookPatterns = [
    'gsd-notify.sh',  // 在 v1.6.x 中删除
    'hooks/statusline.js',  // 在 v1.9.0 中重命名为 gsd-statusline.js
    'gsd-intel-index.js',  // 在 v1.9.2 中删除
    'gsd-intel-session.js',  // 在 v1.9.2 中删除
    'gsd-intel-prune.js',  // 在 v1.9.2 中删除
  ];

  let cleanedHooks = false;

  // 检查所有 hook 事件类型（Stop、SessionStart 等）
  if (settings.hooks) {
    for (const eventType of Object.keys(settings.hooks)) {
      const hookEntries = settings.hooks[eventType];
      if (Array.isArray(hookEntries)) {
        // 过滤掉包含孤立 hooks 的条目
        const filtered = hookEntries.filter(entry => {
          if (entry.hooks && Array.isArray(entry.hooks)) {
            // 检查此条目中的任何 hook 是否匹配孤立模式
            const hasOrphaned = entry.hooks.some(h =>
              h.command && orphanedHookPatterns.some(pattern => h.command.includes(pattern))
            );
            if (hasOrphaned) {
              cleanedHooks = true;
              return false;  // 删除此条目
            }
          }
          return true;  // 保留此条目
        });
        settings.hooks[eventType] = filtered;
      }
    }
  }

  if (cleanedHooks) {
    console.log(`  ${green}✓${reset} 删除了孤立的 hook 注册`);
  }

  // 修复 #330：如果 statusLine 指向旧的 statusline.js 路径，则更新它
  if (settings.statusLine && settings.statusLine.command &&
      settings.statusLine.command.includes('statusline.js') &&
      !settings.statusLine.command.includes('gsd-statusline.js')) {
    // 将旧路径替换为新路径
    settings.statusLine.command = settings.statusLine.command.replace(
      /statusline\.js/,
      'gsd-statusline.js'
    );
    console.log(`  ${green}✓${reset} 更新了状态栏路径（statusline.js → gsd-statusline.js）`);
  }

  return settings;
}

/**
 * 从指定目录为特定运行时卸载 GSD
 * 仅删除 GSD 特定的文件/目录，保留用户内容
 * @param {boolean} isGlobal - 是从全局还是本地卸载
 * @param {string} runtime - 目标运行时（'claude'、'opencode'、'gemini'）
 */
function uninstall(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const dirName = getDirName(runtime);

  // 根据运行时和安装类型获取目标目录
  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  let runtimeLabel = 'Claude Code';
  if (runtime === 'opencode') runtimeLabel = 'OpenCode';
  if (runtime === 'gemini') runtimeLabel = 'Gemini';

  console.log(`  正在从 ${cyan}${runtimeLabel}${reset} 在 ${cyan}${locationLabel}${reset} 卸载 GSD\n`);

  // 检查目标目录是否存在
  if (!fs.existsSync(targetDir)) {
    console.log(`  ${yellow}⚠${reset} 目录不存在：${locationLabel}`);
    console.log(`  没有要卸载的内容。\n`);
    return;
  }

  let removedCount = 0;

  // 1. 删除 GSD 命令目录
  if (isOpencode) {
    // OpenCode：删除 command/gsd-*.md 文件
    const commandDir = path.join(targetDir, 'command');
    if (fs.existsSync(commandDir)) {
      const files = fs.readdirSync(commandDir);
      for (const file of files) {
        if (file.startsWith('gsd-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(commandDir, file));
          removedCount++;
        }
      }
      console.log(`  ${green}✓${reset} 从 command/ 删除了 GSD 命令`);
    }
  } else {
    // Claude Code & Gemini：删除 commands/gsd/ 目录
    const gsdCommandsDir = path.join(targetDir, 'commands', 'gsd');
    if (fs.existsSync(gsdCommandsDir)) {
      fs.rmSync(gsdCommandsDir, { recursive: true });
      removedCount++;
      console.log(`  ${green}✓${reset} 删除了 commands/gsd/`);
    }
  }

  // 2. 删除 get-shit-done 目录
  const gsdDir = path.join(targetDir, 'get-shit-done');
  if (fs.existsSync(gsdDir)) {
    fs.rmSync(gsdDir, { recursive: true });
    removedCount++;
    console.log(`  ${green}✓${reset} 删除了 get-shit-done/`);
  }

  // 3. 删除 GSD agents（仅 gsd-*.md 文件）
  const agentsDir = path.join(targetDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const files = fs.readdirSync(agentsDir);
    let agentCount = 0;
    for (const file of files) {
      if (file.startsWith('gsd-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(agentsDir, file));
        agentCount++;
      }
    }
    if (agentCount > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} 删除了 ${agentCount} 个 GSD agents`);
    }
  }

  // 4. 删除 GSD hooks
  const hooksDir = path.join(targetDir, 'hooks');
  if (fs.existsSync(hooksDir)) {
    const gsdHooks = ['gsd-statusline.js', 'gsd-check-update.js', 'gsd-check-update.sh'];
    let hookCount = 0;
    for (const hook of gsdHooks) {
      const hookPath = path.join(hooksDir, hook);
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
        hookCount++;
      }
    }
    if (hookCount > 0) {
      removedCount++;
      console.log(`  ${green}✓${reset} 删除了 ${hookCount} 个 GSD hooks`);
    }
  }

  // 5. 清理 settings.json（删除 GSD hooks 和 statusline）
  const settingsPath = path.join(targetDir, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    let settings = readSettings(settingsPath);
    let settingsModified = false;

    // 删除 GSD 状态栏（如果它引用我们的 hook）
    if (settings.statusLine && settings.statusLine.command &&
        settings.statusLine.command.includes('gsd-statusline')) {
      delete settings.statusLine;
      settingsModified = true;
      console.log(`  ${green}✓${reset} 从设置中删除了 GSD 状态栏`);
    }

    // 从 SessionStart 删除 GSD hooks
    if (settings.hooks && settings.hooks.SessionStart) {
      const before = settings.hooks.SessionStart.length;
      settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry => {
        if (entry.hooks && Array.isArray(entry.hooks)) {
          // 过滤掉 GSD hooks
          const hasGsdHook = entry.hooks.some(h =>
            h.command && (h.command.includes('gsd-check-update') || h.command.includes('gsd-statusline'))
          );
          return !hasGsdHook;
        }
        return true;
      });
      if (settings.hooks.SessionStart.length < before) {
        settingsModified = true;
        console.log(`  ${green}✓${reset} 从设置中删除了 GSD hooks`);
      }
      // 清理空数组
      if (settings.hooks.SessionStart.length === 0) {
        delete settings.hooks.SessionStart;
      }
      // 清理空的 hooks 对象
      if (Object.keys(settings.hooks).length === 0) {
        delete settings.hooks;
      }
    }

    if (settingsModified) {
      writeSettings(settingsPath, settings);
      removedCount++;
    }
  }

  // 6. 对于 OpenCode，从 opencode.json 清理权限
  if (isOpencode) {
    const opencodeConfigDir = getOpencodeGlobalDir();
    const configPath = path.join(opencodeConfigDir, 'opencode.json');
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let modified = false;

        // 删除 GSD 权限条目
        if (config.permission) {
          for (const permType of ['read', 'external_directory']) {
            if (config.permission[permType]) {
              const keys = Object.keys(config.permission[permType]);
              for (const key of keys) {
                if (key.includes('get-shit-done')) {
                  delete config.permission[permType][key];
                  modified = true;
                }
              }
              // 清理空对象
              if (Object.keys(config.permission[permType]).length === 0) {
                delete config.permission[permType];
              }
            }
          }
          if (Object.keys(config.permission).length === 0) {
            delete config.permission;
          }
        }

        if (modified) {
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
          removedCount++;
          console.log(`  ${green}✓${reset} 从 opencode.json 删除了 GSD 权限`);
        }
      } catch (e) {
        // 忽略 JSON 解析错误
      }
    }
  }

  if (removedCount === 0) {
    console.log(`  ${yellow}⚠${reset} 没有找到要删除的 GSD 文件。`);
  }

  console.log(`
  ${green}完成！${reset} GSD 已从 ${runtimeLabel} 卸载。
  您的其他文件和设置已保留。
`);
}

/**
 * 通过剥离注释和尾随逗号来解析 JSONC（带注释的 JSON）。
 * OpenCode 通过 jsonc-parser 支持 JSONC 格式，因此用户可能有注释。
 * 这是一个轻量级内联解析器，以避免添加依赖项。
 */
function parseJsonc(content) {
  // 如果存在 BOM，则剥离它
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // 在保留字符串的同时删除单行和块注释
  let result = '';
  let inString = false;
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    const next = content[i + 1];

    if (inString) {
      result += char;
      // 处理转义序列
      if (char === '\\' && i + 1 < content.length) {
        result += next;
        i += 2;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      i++;
    } else {
      if (char === '"') {
        inString = true;
        result += char;
        i++;
      } else if (char === '/' && next === '/') {
        // 跳过单行注释直到行尾
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
      } else if (char === '/' && next === '*') {
        // 跳过块注释
        i += 2;
        while (i < content.length - 1 && !(content[i] === '*' && content[i + 1] === '/')) {
          i++;
        }
        i += 2; // 跳过结束的 */
      } else {
        result += char;
        i++;
      }
    }
  }

  // 删除 } 或 ] 之前的尾随逗号
  result = result.replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(result);
}

/**
 * 配置 OpenCode 权限以允许读取 GSD 参考文档
 * 这可以防止 GSD 访问 get-shit-done 目录时出现权限提示
 */
function configureOpencodePermissions() {
  // OpenCode 配置文件位于 ~/.config/opencode/opencode.json
  const opencodeConfigDir = getOpencodeGlobalDir();
  const configPath = path.join(opencodeConfigDir, 'opencode.json');

  // 确保配置目录存在
  fs.mkdirSync(opencodeConfigDir, { recursive: true });

  // 读取现有配置或创建空对象
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      config = parseJsonc(content);
    } catch (e) {
      // 无法解析 - 不要覆盖用户的配置
      console.log(`  ${yellow}⚠${reset} 无法解析 opencode.json - 跳过权限配置`);
      console.log(`    ${dim}原因：${e.message}${reset}`);
      console.log(`    ${dim}您的配置未被修改。如果需要，请手动修复语法。${reset}`);
      return;
    }
  }

  // 确保权限结构存在
  if (!config.permission) {
    config.permission = {};
  }

  // 使用实际配置目录构建 GSD 路径
  // 如果是默认位置，则使用 ~ 简写，否则使用完整路径
  const defaultConfigDir = path.join(os.homedir(), '.config', 'opencode');
  const gsdPath = opencodeConfigDir === defaultConfigDir
    ? '~/.config/opencode/get-shit-done/*'
    : `${opencodeConfigDir.replace(/\\/g, '/')}/get-shit-done/*`;
  
  let modified = false;

  // 配置读取权限
  if (!config.permission.read || typeof config.permission.read !== 'object') {
    config.permission.read = {};
  }
  if (config.permission.read[gsdPath] !== 'allow') {
    config.permission.read[gsdPath] = 'allow';
    modified = true;
  }

  // 配置 external_directory 权限（项目外部路径的安全保护）
  if (!config.permission.external_directory || typeof config.permission.external_directory !== 'object') {
    config.permission.external_directory = {};
  }
  if (config.permission.external_directory[gsdPath] !== 'allow') {
    config.permission.external_directory[gsdPath] = 'allow';
    modified = true;
  }

  if (!modified) {
    return; // 已经配置
  }

  // 写回配置
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`  ${green}✓${reset} 已为 GSD 文档配置读取权限`);
}

/**
 * 验证目录存在并包含文件
 */
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ${yellow}✗${reset} 安装 ${description} 失败：未创建目录`);
    return false;
  }
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      console.error(`  ${yellow}✗${reset} 安装 ${description} 失败：目录为空`);
      return false;
    }
  } catch (e) {
    console.error(`  ${yellow}✗${reset} 安装 ${description} 失败：${e.message}`);
    return false;
  }
  return true;
}

/**
 * 验证文件存在
 */
function verifyFileInstalled(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ${yellow}✗${reset} 安装 ${description} 失败：未创建文件`);
    return false;
  }
  return true;
}

/**
 * 安装到指定目录的特定运行时
 * @param {boolean} isGlobal - 是全局安装还是本地安装
 * @param {string} runtime - 目标运行时（'claude'、'opencode'、'gemini'）
 */

// ──────────────────────────────────────────────────────
// 本地补丁持久化
// ──────────────────────────────────────────────────────

const PATCHES_DIR_NAME = 'gsd-local-patches';
const MANIFEST_NAME = 'gsd-file-manifest.json';

/**
 * 计算文件内容的 SHA256 哈希值
 */
function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * 递归收集目录中的所有文件及其哈希值
 */
function generateManifest(dir, baseDir) {
  if (!baseDir) baseDir = dir;
  const manifest = {};
  if (!fs.existsSync(dir)) return manifest;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      Object.assign(manifest, generateManifest(fullPath, baseDir));
    } else {
      manifest[relPath] = fileHash(fullPath);
    }
  }
  return manifest;
}

/**
 * 在安装后写入文件清单，以便将来检测修改
 */
function writeManifest(configDir) {
  const gsdDir = path.join(configDir, 'get-shit-done');
  const commandsDir = path.join(configDir, 'commands', 'gsd');
  const agentsDir = path.join(configDir, 'agents');
  const manifest = { version: pkg.version, timestamp: new Date().toISOString(), files: {} };

  const gsdHashes = generateManifest(gsdDir);
  for (const [rel, hash] of Object.entries(gsdHashes)) {
    manifest.files['get-shit-done/' + rel] = hash;
  }
  if (fs.existsSync(commandsDir)) {
    const cmdHashes = generateManifest(commandsDir);
    for (const [rel, hash] of Object.entries(cmdHashes)) {
      manifest.files['commands/gsd/' + rel] = hash;
    }
  }
  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir)) {
      if (file.startsWith('gsd-') && file.endsWith('.md')) {
        manifest.files['agents/' + file] = fileHash(path.join(agentsDir, file));
      }
    }
  }

  fs.writeFileSync(path.join(configDir, MANIFEST_NAME), JSON.stringify(manifest, null, 2));
  return manifest;
}

/**
 * 通过与安装清单比较来检测用户修改的 GSD 文件。
 * 将修改的文件备份到 gsd-local-patches/ 以便在更新后重新应用。
 */
function saveLocalPatches(configDir) {
  const manifestPath = path.join(configDir, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) return [];

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { return []; }

  const patchesDir = path.join(configDir, PATCHES_DIR_NAME);
  const modified = [];

  for (const [relPath, originalHash] of Object.entries(manifest.files || {})) {
    const fullPath = path.join(configDir, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const currentHash = fileHash(fullPath);
    if (currentHash !== originalHash) {
      const backupPath = path.join(patchesDir, relPath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(fullPath, backupPath);
      modified.push(relPath);
    }
  }

  if (modified.length > 0) {
    const meta = {
      backed_up_at: new Date().toISOString(),
      from_version: manifest.version,
      files: modified
    };
    fs.writeFileSync(path.join(patchesDir, 'backup-meta.json'), JSON.stringify(meta, null, 2));
    console.log('  ' + yellow + 'i' + reset + '  找到 ' + modified.length + ' 个本地修改的 GSD 文件 - 已备份到 ' + PATCHES_DIR_NAME + '/');
    for (const f of modified) {
      console.log('     ' + dim + f + reset);
    }
  }
  return modified;
}

/**
 * 安装后，报告备份的补丁供用户重新应用。
 */
function reportLocalPatches(configDir) {
  const patchesDir = path.join(configDir, PATCHES_DIR_NAME);
  const metaPath = path.join(patchesDir, 'backup-meta.json');
  if (!fs.existsSync(metaPath)) return [];

  let meta;
  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { return []; }

  if (meta.files && meta.files.length > 0) {
    console.log('');
    console.log('  ' + yellow + '检测到本地补丁' + reset + '（来自 v' + meta.from_version + '）：');
    for (const f of meta.files) {
      console.log('     ' + cyan + f + reset);
    }
    console.log('');
    console.log('  您的修改已保存在 ' + cyan + PATCHES_DIR_NAME + '/' + reset);
    console.log('  运行 ' + cyan + '/gsd:reapply-patches' + reset + ' 将它们合并到新版本中。');
    console.log('  或手动比较和合并文件。');
    console.log('');
  }
  return meta.files || [];
}

function install(isGlobal, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';
  const isGemini = runtime === 'gemini';
  const dirName = getDirName(runtime);
  const src = path.join(__dirname, '..');

  // 根据运行时和安装类型获取目标目录
  const targetDir = isGlobal
    ? getGlobalDir(runtime, explicitConfigDir)
    : path.join(process.cwd(), dirName);

  const locationLabel = isGlobal
    ? targetDir.replace(os.homedir(), '~')
    : targetDir.replace(process.cwd(), '.');

  // markdown 内容中文件引用的路径前缀
  // 对于全局安装：使用完整路径
  // 对于本地安装：使用相对路径
  const pathPrefix = isGlobal
    ? `${targetDir.replace(/\\/g, '/')}/`
    : `./${dirName}/`;

  let runtimeLabel = 'Claude Code';
  if (isOpencode) runtimeLabel = 'OpenCode';
  if (isGemini) runtimeLabel = 'Gemini';

  console.log(`  正在为 ${cyan}${runtimeLabel}${reset} 安装到 ${cyan}${locationLabel}${reset}\n`);

  // 跟踪安装失败
  const failures = [];

  // 在删除任何本地修改的 GSD 文件之前保存它们
  saveLocalPatches(targetDir);

  // 清理来自以前版本的孤立文件
  cleanupOrphanedFiles(targetDir);

  // OpenCode 使用 'command/'（单数）和扁平结构
  // Claude Code & Gemini 使用 'commands/'（复数）和嵌套结构
  if (isOpencode) {
    // OpenCode：command/ 目录中的扁平结构
    const commandDir = path.join(targetDir, 'command');
    fs.mkdirSync(commandDir, { recursive: true });
    
    // 将 commands/gsd/*.md 复制为 command/gsd-*.md（扁平化结构）
    const gsdSrc = path.join(src, 'commands', 'gsd');
    copyFlattenedCommands(gsdSrc, commandDir, 'gsd', pathPrefix, runtime);
    if (verifyInstalled(commandDir, 'command/gsd-*')) {
      const count = fs.readdirSync(commandDir).filter(f => f.startsWith('gsd-')).length;
      console.log(`  ${green}✓${reset} 已将 ${count} 个命令安装到 command/`);
    } else {
      failures.push('command/gsd-*');
    }
  } else {
    // Claude Code & Gemini：commands/ 目录中的嵌套结构
    const commandsDir = path.join(targetDir, 'commands');
    fs.mkdirSync(commandsDir, { recursive: true });
    
    const gsdSrc = path.join(src, 'commands', 'gsd');
    const gsdDest = path.join(commandsDir, 'gsd');
    copyWithPathReplacement(gsdSrc, gsdDest, pathPrefix, runtime);
    if (verifyInstalled(gsdDest, 'commands/gsd')) {
      console.log(`  ${green}✓${reset} 已安装 commands/gsd`);
    } else {
      failures.push('commands/gsd');
    }
  }

  // 使用路径替换复制 get-shit-done skill
  const skillSrc = path.join(src, 'get-shit-done');
  const skillDest = path.join(targetDir, 'get-shit-done');
  copyWithPathReplacement(skillSrc, skillDest, pathPrefix, runtime);
  if (verifyInstalled(skillDest, 'get-shit-done')) {
    console.log(`  ${green}✓${reset} 已安装 get-shit-done`);
  } else {
    failures.push('get-shit-done');
  }

  // 将 agents 复制到 agents 目录
  const agentsSrc = path.join(src, 'agents');
  if (fs.existsSync(agentsSrc)) {
    const agentsDest = path.join(targetDir, 'agents');
    fs.mkdirSync(agentsDest, { recursive: true });

    // 在复制新 agents 之前删除旧的 GSD agents（gsd-*.md）
    if (fs.existsSync(agentsDest)) {
      for (const file of fs.readdirSync(agentsDest)) {
        if (file.startsWith('gsd-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(agentsDest, file));
        }
      }
    }

    // 复制新 agents
    const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
    for (const entry of agentEntries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
        // 始终替换 ~/.claude/，因为它是 repo 中的真实来源
        const dirRegex = /~\/\.claude\//g;
        content = content.replace(dirRegex, pathPrefix);
        content = processAttribution(content, getCommitAttribution(runtime));
        // 为运行时兼容性转换 frontmatter
        if (isOpencode) {
          content = convertClaudeToOpencodeFrontmatter(content);
        } else if (isGemini) {
          content = convertClaudeToGeminiAgent(content);
        }
        fs.writeFileSync(path.join(agentsDest, entry.name), content);
      }
    }
    if (verifyInstalled(agentsDest, 'agents')) {
      console.log(`  ${green}✓${reset} 已安装 agents`);
    } else {
      failures.push('agents');
    }
  }

  // 复制 CHANGELOG.md
  const changelogSrc = path.join(src, 'CHANGELOG.md');
  const changelogDest = path.join(targetDir, 'get-shit-done', 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    fs.copyFileSync(changelogSrc, changelogDest);
    if (verifyFileInstalled(changelogDest, 'CHANGELOG.md')) {
      console.log(`  ${green}✓${reset} 已安装 CHANGELOG.md`);
    } else {
      failures.push('CHANGELOG.md');
    }
  }

  // 写入 VERSION 文件
  const versionDest = path.join(targetDir, 'get-shit-done', 'VERSION');
  fs.writeFileSync(versionDest, pkg.version);
  if (verifyFileInstalled(versionDest, 'VERSION')) {
    console.log(`  ${green}✓${reset} 已写入 VERSION (${pkg.version})`);
  } else {
    failures.push('VERSION');
  }

  // 从 dist/ 复制 hooks（与依赖项捆绑）
  const hooksSrc = path.join(src, 'hooks', 'dist');
  if (fs.existsSync(hooksSrc)) {
    const hooksDest = path.join(targetDir, 'hooks');
    fs.mkdirSync(hooksDest, { recursive: true });
    const hookEntries = fs.readdirSync(hooksSrc);
    for (const entry of hookEntries) {
      const srcFile = path.join(hooksSrc, entry);
      if (fs.statSync(srcFile).isFile()) {
        const destFile = path.join(hooksDest, entry);
        fs.copyFileSync(srcFile, destFile);
      }
    }
    if (verifyInstalled(hooksDest, 'hooks')) {
      console.log(`  ${green}✓${reset} 已安装 hooks（捆绑）`);
    } else {
      failures.push('hooks');
    }
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}安装不完整！${reset} 失败：${failures.join(', ')}`);
    process.exit(1);
  }

  // 在 settings.json 中配置状态栏和 hooks
  // Gemini 目前与 Claude Code 共享相同的 hook 系统
  const settingsPath = path.join(targetDir, 'settings.json');
  const settings = cleanupOrphanedHooks(readSettings(settingsPath));
  const statuslineCommand = isGlobal
    ? buildHookCommand(targetDir, 'gsd-statusline.js')
    : 'node ' + dirName + '/hooks/gsd-statusline.js';
  const updateCheckCommand = isGlobal
    ? buildHookCommand(targetDir, 'gsd-check-update.js')
    : 'node ' + dirName + '/hooks/gsd-check-update.js';

  // 为 Gemini CLI 启用实验性 agents（自定义子 agents 所需）
  if (isGemini) {
    if (!settings.experimental) {
      settings.experimental = {};
    }
    if (!settings.experimental.enableAgents) {
      settings.experimental.enableAgents = true;
      console.log(`  ${green}✓${reset} 已启用实验性 agents`);
    }
  }

  // 为更新检查配置 SessionStart hook（跳过 opencode）
  if (!isOpencode) {
    if (!settings.hooks) {
      settings.hooks = {};
    }
    if (!settings.hooks.SessionStart) {
      settings.hooks.SessionStart = [];
    }

    const hasGsdUpdateHook = settings.hooks.SessionStart.some(entry =>
      entry.hooks && entry.hooks.some(h => h.command && h.command.includes('gsd-check-update'))
    );

    if (!hasGsdUpdateHook) {
      settings.hooks.SessionStart.push({
        hooks: [
          {
            type: 'command',
            command: updateCheckCommand
          }
        ]
      });
      console.log(`  ${green}✓${reset} 已配置更新检查 hook`);
    }
  }

  // 写入文件清单以供将来修改检测
  writeManifest(targetDir);
  console.log(`  ${green}✓${reset} 已写入文件清单（${MANIFEST_NAME}）`);

  // 报告任何备份的本地补丁
  reportLocalPatches(targetDir);

  return { settingsPath, settings, statuslineCommand, runtime };
}

/**
 * 应用状态栏配置，然后打印完成消息
 */
function finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline, runtime = 'claude') {
  const isOpencode = runtime === 'opencode';

  if (shouldInstallStatusline && !isOpencode) {
    settings.statusLine = {
      type: 'command',
      command: statuslineCommand
    };
    console.log(`  ${green}✓${reset} 已配置状态栏`);
  }

  // 始终写入设置
  writeSettings(settingsPath, settings);

  // 配置 OpenCode 权限
  if (isOpencode) {
    configureOpencodePermissions();
  }

  let program = 'Claude Code';
  if (runtime === 'opencode') program = 'OpenCode';
  if (runtime === 'gemini') program = 'Gemini';

  const command = isOpencode ? '/gsd-help' : '/gsd:help';
  console.log(`
  ${green}完成！${reset} 启动 ${program} 并运行 ${cyan}${command}${reset}。

  ${cyan}加入社区：${reset} https://discord.gg/5JJgD5svVS
`);
}

/**
 * 处理状态栏配置，带有可选提示
 */
function handleStatusline(settings, isInteractive, callback) {
  const hasExisting = settings.statusLine != null;

  if (!hasExisting) {
    callback(true);
    return;
  }

  if (forceStatusline) {
    callback(true);
    return;
  }

  if (!isInteractive) {
    console.log(`  ${yellow}⚠${reset} 跳过状态栏（已配置）`);
    console.log(`    使用 ${cyan}--force-statusline${reset} 替换\n`);
    callback(false);
    return;
  }

  const existingCmd = settings.statusLine.command || settings.statusLine.url || '(自定义)';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
  ${yellow}⚠${reset} 检测到现有状态栏\n
  您当前的状态栏：
    ${dim}命令：${existingCmd}${reset}

  GSD 包括一个状态栏，显示：
    • 模型名称
    • 当前任务（来自待办事项列表）
    • 上下文窗口使用情况（颜色编码）

  ${cyan}1${reset}) 保留现有
  ${cyan}2${reset}) 替换为 GSD 状态栏
`);

  rl.question(`  选择 ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    callback(choice === '2');
  });
}

/**
 * 提示选择运行时
 */
function promptRuntime(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}安装已取消${reset}\n`);
      process.exit(0);
    }
  });

  console.log(`  ${yellow}您想为哪些运行时安装？${reset}\n\n  ${cyan}1${reset}) Claude Code ${dim}(~/.claude)${reset}
  ${cyan}2${reset}) OpenCode    ${dim}(~/.config/opencode)${reset} - 开源，免费模型
  ${cyan}3${reset}) Gemini      ${dim}(~/.gemini)${reset}
  ${cyan}4${reset}) 全部
`);

  rl.question(`  选择 ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    if (choice === '4') {
      callback(['claude', 'opencode', 'gemini']);
    } else if (choice === '3') {
      callback(['gemini']);
    } else if (choice === '2') {
      callback(['opencode']);
    } else {
      callback(['claude']);
    }
  });
}

/**
 * 提示安装位置
 */
function promptLocation(runtimes) {
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}检测到非交互式终端，默认为全局安装${reset}\n`);
    installAllRuntimes(runtimes, true, false);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let answered = false;

  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}安装已取消${reset}\n`);
      process.exit(0);
    }
  });

  const pathExamples = runtimes.map(r => {
    const globalPath = getGlobalDir(r, explicitConfigDir);
    return globalPath.replace(os.homedir(), '~');
  }).join(', ');

  const localExamples = runtimes.map(r => `./${getDirName(r)}`).join(', ');

  console.log(`  ${yellow}您想在哪里安装？${reset}\n\n  ${cyan}1${reset}) 全局 ${dim}(${pathExamples})${reset} - 在所有项目中可用
  ${cyan}2${reset}) 本地  ${dim}(${localExamples})${reset} - 仅此项目
`);

  rl.question(`  选择 ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    const isGlobal = choice !== '2';
    installAllRuntimes(runtimes, isGlobal, true);
  });
}

/**
 * 为所有选定的运行时安装 GSD
 */
function installAllRuntimes(runtimes, isGlobal, isInteractive) {
  const results = [];

  for (const runtime of runtimes) {
    const result = install(isGlobal, runtime);
    results.push(result);
  }

  // 为 Claude & Gemini 处理状态栏（OpenCode 使用主题）
  const claudeResult = results.find(r => r.runtime === 'claude');
  const geminiResult = results.find(r => r.runtime === 'gemini');

  // 逻辑：如果两者都存在，在交互模式下询问一次？还是为每个询问？
  // 更简单：询问一次并适用于两者（如果适用）。
  
  if (claudeResult || geminiResult) {
    // 使用任何存在的设置来检查现有状态栏
    const primaryResult = claudeResult || geminiResult;
    
    handleStatusline(primaryResult.settings, isInteractive, (shouldInstallStatusline) => {
      if (claudeResult) {
        finishInstall(claudeResult.settingsPath, claudeResult.settings, claudeResult.statuslineCommand, shouldInstallStatusline, 'claude');
      }
      if (geminiResult) {
         finishInstall(geminiResult.settingsPath, geminiResult.settings, geminiResult.statuslineCommand, shouldInstallStatusline, 'gemini');
      }
      
      const opencodeResult = results.find(r => r.runtime === 'opencode');
      if (opencodeResult) {
        finishInstall(opencodeResult.settingsPath, opencodeResult.settings, opencodeResult.statuslineCommand, false, 'opencode');
      }
    });
  } else {
    // 仅 OpenCode
    const opencodeResult = results[0];
    finishInstall(opencodeResult.settingsPath, opencodeResult.settings, opencodeResult.statuslineCommand, false, 'opencode');
  }
}

// 主逻辑
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}不能同时指定 --global 和 --local${reset}`);
  process.exit(1);
} else if (explicitConfigDir && hasLocal) {
  console.error(`  ${yellow}不能将 --config-dir 与 --local 一起使用${reset}`);
  process.exit(1);
} else if (hasUninstall) {
  if (!hasGlobal && !hasLocal) {
    console.error(`  ${yellow}--uninstall 需要 --global 或 --local${reset}`);
    process.exit(1);
  }
  const runtimes = selectedRuntimes.length > 0 ? selectedRuntimes : ['claude'];
  for (const runtime of runtimes) {
    uninstall(hasGlobal, runtime);
  }
} else if (selectedRuntimes.length > 0) {
  if (!hasGlobal && !hasLocal) {
    promptLocation(selectedRuntimes);
  } else {
    installAllRuntimes(selectedRuntimes, hasGlobal, false);
  }
} else if (hasGlobal || hasLocal) {
  // 如果未指定运行时但指定了位置，则默认为 Claude
  installAllRuntimes(['claude'], hasGlobal, false);
} else {
  // 交互式
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}检测到非交互式终端，默认为 Claude Code 全局安装${reset}\n`);
    installAllRuntimes(['claude'], true, false);
  } else {
    promptRuntime((runtimes) => {
      promptLocation(runtimes);
    });
  }
}
