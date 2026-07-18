#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ci = require('miniprogram-ci');

const PROJECT_PATH = __dirname;
const PRIVATE_KEY_PATH = path.join(PROJECT_PATH, 'private.key');
const VERSION_FILE = path.join(PROJECT_PATH, 'deploy-version.json');
const { appid: APPID } = require('./project.config.json');

function generateVersion() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '.',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function gitInfo() {
  try {
    return {
      commitHash: execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
        cwd: PROJECT_PATH,
        encoding: 'utf8',
      }).trim(),
      commitMessage: execFileSync('git', ['log', '-1', '--format=%s'], {
        cwd: PROJECT_PATH,
        encoding: 'utf8',
      }).trim(),
    };
  } catch (_error) {
    return { commitHash: 'unknown', commitMessage: 'Git information unavailable' };
  }
}

function recordDeployment(entry) {
  let history = [];
  if (fs.existsSync(VERSION_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    } catch (_error) {
      history = [];
    }
  }
  history.unshift(entry);
  fs.writeFileSync(VERSION_FILE, `${JSON.stringify(history.slice(0, 50), null, 2)}\n`);
}

function parseArgs(args) {
  const options = {
    version: generateVersion(),
    description: 'CatPlan 自动上传',
    preview: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--preview' || argument === '-p') options.preview = true;
    else if (argument === '--version' || argument === '-v') {
      options.version = args[index + 1];
      index += 1;
    } else if (argument === '--desc' || argument === '-d') {
      options.description = args[index + 1];
      index += 1;
    } else if (argument === '--help' || argument === '-h') {
      options.help = true;
    } else {
      throw new Error(`不支持的参数：${argument}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`微信小程序上传

用法：
  node deploy.js [--version 1.0.0] [--desc "说明"]
  node deploy.js --preview

要求：
  project.config.json 中配置正确的 appid
  项目根目录存在 private.key（该文件已被 .gitignore 忽略）`);
}

async function deploy(options) {
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    throw new Error(`缺少上传密钥：${PRIVATE_KEY_PATH}`);
  }

  const project = new ci.Project({
    appid: APPID,
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: PRIVATE_KEY_PATH,
    ignores: ['node_modules/**/*', '.git/**/*'],
  });

  const common = {
    project,
    desc: options.description,
    setting: { useProjectConfig: true },
    onProgressUpdate: console.log,
  };
  const result = options.preview
    ? await ci.preview({ ...common, qrcodeFormat: 'terminal' })
    : await ci.upload({ ...common, version: options.version });

  recordDeployment({
    version: options.version,
    mode: options.preview ? 'preview' : 'upload',
    timestamp: new Date().toISOString(),
    git: gitInfo(),
    success: true,
  });
  return result;
}

if (require.main === module) {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exit(0);
    }
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exit(1);
  }

  deploy(options)
    .then(() => console.log(options.preview ? '预览生成成功' : '代码上传成功'))
    .catch(error => {
      console.error(`上传失败：${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = { deploy, generateVersion, parseArgs };
