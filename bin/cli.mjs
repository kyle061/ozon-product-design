#!/usr/bin/env node
import { cp, lstat, mkdir, mkdtemp, readFile, rename, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillName = 'ozon-product-design';
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resources = ['SKILL.md', 'agents', 'references'];

const help = `Ozon 商品视觉设计 skill

用法：
  ozon-product-design install [--codex-home <目录>] [--force] [--dry-run]
  ozon-product-design path [--codex-home <目录>]
  ozon-product-design --version
  ozon-product-design --help

默认安装到 $CODEX_HOME/skills/ozon-product-design；未设置时使用 ~/.codex。
--force     更新已有技能，先将原目录完整移入 Codex 的 skill-backups 目录。
--dry-run   只显示将要安装的位置，不写入文件。

npm 安装只提供此命令；执行 install 才会写入 Codex 的 skills 目录。
`;

async function statOrNull(path) {
  try { return await lstat(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

function parse(args) {
  const command = args.shift() ?? '--help';
  if (!['install', 'path', '--help', '-h', '--version', '-v'].includes(command)) {
    throw new Error(`未知命令：${command}。运行 --help 查看用法。`);
  }
  let codexHome = process.env.CODEX_HOME || join(homedir(), '.codex');
  let force = false;
  let dryRun = false;
  while (args.length) {
    const option = args.shift();
    if (option === '--codex-home' && ['install', 'path'].includes(command)) {
      const value = args.shift();
      if (!value || value.startsWith('--')) throw new Error('--codex-home 需要目录参数。');
      codexHome = value;
    } else if (option === '--force' && command === 'install') force = true;
    else if (option === '--dry-run' && command === 'install') dryRun = true;
    else throw new Error(`未知或不适用的参数：${option}`);
  }
  return { command, codexHome: resolve(codexHome), force, dryRun };
}

async function install({ codexHome, force, dryRun }) {
  const parent = join(codexHome, 'skills');
  const target = join(parent, skillName);
  const existing = await statOrNull(target);
  if (existing?.isSymbolicLink()) throw new Error(`安装目标是符号链接，未修改：${target}`);
  if (existing && !existing.isDirectory()) throw new Error(`安装目标不是目录：${target}`);
  if (existing && !force) throw new Error(`技能已存在，未修改：${target}\n更新请使用 install --force；原目录会先备份。`);
  for (const resource of resources) {
    if (!(await statOrNull(join(packageRoot, resource)))) throw new Error(`安装包缺少文件：${resource}`);
  }
  if (dryRun) {
    console.log(`将安装到：${target}${existing ? '\n现有技能将保留为备份。' : ''}`);
    return;
  }

  await mkdir(parent, { recursive: true });
  // Lock only this installer; prevent two invocations from replacing each other.
  const lock = join(parent, `.${skillName}.install-lock`);
  try { await mkdir(lock); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error(`发现安装锁：${lock}\n请等待当前安装结束；若上次被中断，确认没有安装进程后移除此空锁目录再重试。`);
    throw error;
  }
  let staging;
  let backupContainer;
  let backup;
  try {
    const current = await statOrNull(target);
    if (current?.isSymbolicLink() || (current && !current.isDirectory())) throw new Error('目标类型已变化，安装取消。');
    if (current && !force) throw new Error('目标已存在，安装取消。使用 --force 可备份后更新。');
    staging = await mkdtemp(join(parent, `.${skillName}.staging-`));
    for (const resource of resources) {
      await cp(join(packageRoot, resource), join(staging, resource), { recursive: true, errorOnExist: true, force: false });
    }
    if (current) {
      const backupParent = join(codexHome, 'skill-backups');
      await mkdir(backupParent, { recursive: true });
      backupContainer = await mkdtemp(join(backupParent, `${skillName}-`));
      backup = join(backupContainer, skillName);
      try { await rename(target, backup); }
      catch (error) { backup = undefined; throw error; }
    }
    try { await rename(staging, target); staging = undefined; }
    catch (error) {
      if (backup && !(await statOrNull(target))) {
        await rename(backup, target);
        backup = undefined;
      }
      throw error;
    }
    console.log(`已安装：${target}`);
    if (backup) console.log(`原技能备份：${backup}`);
    console.log('在 Codex 新任务中使用 $ozon-product-design。若未显示，请重新打开 Codex 后重试。');
  } finally {
    if (staging) await rm(staging, { recursive: true, force: true });
    if (backupContainer && !backup) await rm(backupContainer, { recursive: true, force: true });
    await rm(lock, { recursive: true, force: true });
  }
}

try {
  const options = parse(process.argv.slice(2));
  if (['--help', '-h'].includes(options.command)) console.log(help);
  else if (['--version', '-v'].includes(options.command)) {
    console.log(JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8')).version);
  } else if (options.command === 'path') console.log(join(options.codexHome, 'skills', skillName));
  else await install(options);
} catch (error) {
  console.error(`安装工具：${error.message}`);
  process.exitCode = 1;
}
