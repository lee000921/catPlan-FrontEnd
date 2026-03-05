# 微信小程序自动化部署指南

## 📋 目录

- [简介](#简介)
- [环境要求](#环境要求)
- [安装步骤](#安装步骤)
- [配置私钥](#配置私钥)
- [使用方法](#使用方法)
- [常见问题](#常见问题)
- [版本管理](#版本管理)

---

## 简介

本项目使用微信官方提供的 `miniprogram-ci` 工具实现自动化部署，支持：

- ✅ 一键上传代码到微信小程序后台
- ✅ 自动生成版本号
- ✅ 记录部署历史
- ✅ 支持预览模式
- ✅ Git 提交信息关联

---

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0
- 已注册的微信小程序账号
- 项目管理员权限

---

## 安装步骤

### 1. 安装依赖

在项目根目录执行：

```bash
cd /home/admin/catPlan-Frontend
npm install --save-dev miniprogram-ci
```

### 2. 验证安装

```bash
node -e "console.log(require('miniprogram-ci').VERSION)"
```

---

## 配置私钥

### ⚠️ 重要说明

首次使用前，**必须**配置代码上传私钥文件。

### 获取私钥步骤

1. **登录微信公众平台**
   - 访问：https://mp.weixin.qq.com
   - 使用管理员微信扫码登录

2. **进入版本管理**
   - 左侧菜单：「版本管理」
   - 顶部标签：「版本管理」

3. **下载代码上传密钥**
   - 点击「下载代码上传密钥」
   - 使用管理员微信扫码确认
   - 下载 `.key` 文件

4. **配置私钥文件**
   - 将下载的 `.key` 文件重命名为 `private.key`
   - 放置到项目根目录：`/home/admin/catPlan-Frontend/private.key`

5. **设置文件权限（推荐）**
   ```bash
   chmod 600 /home/admin/catPlan-Frontend/private.key
   ```

### 私钥文件结构

```
/home/admin/catPlan-Frontend/
├── deploy.js              # 部署脚本
├── private.key            # 代码上传私钥 (需要配置)
├── project.config.json    # 项目配置
└── miniprogram/           # 小程序源码目录
```

---

## 使用方法

### 基本用法

#### 一键部署（推荐）

使用自动生成的版本号：

```bash
cd /home/admin/catPlan-Frontend
node deploy.js
```

#### 指定版本号

```bash
node deploy.js -v 1.0.0 -d "新版本发布"
```

#### 预览模式

生成预览版，需要管理员扫码确认：

```bash
node deploy.js --preview
```

### 命令行参数

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--version` | `-v` | 指定版本号 | 自动生成 (YYYYMMDD.HHMMSS) |
| `--desc` | `-d` | 上传说明 | "自动部署" |
| `--preview` | `-p` | 预览模式 | false |
| `--help` | `-h` | 显示帮助 | - |

### 使用示例

```bash
# 示例 1: 快速部署
node deploy.js

# 示例 2: 指定版本号和说明
node deploy.js -v 2.1.0 -d "修复已知问题，优化用户体验"

# 示例 3: 生成预览版
node deploy.js -p

# 示例 4: 查看帮助
node deploy.js -h
```

### 集成到 npm scripts

在 `package.json` 中添加：

```json
{
  "scripts": {
    "deploy": "node deploy.js",
    "deploy:preview": "node deploy.js --preview",
    "deploy:patch": "node deploy.js -d '热修复'"
  }
}
```

然后使用：

```bash
npm run deploy
npm run deploy:preview
```

---

## 版本管理

### 版本历史

每次部署后，版本信息会自动保存到 `deploy-version.json` 文件。

查看最近部署记录：

```bash
cat deploy-version.json | head -50
```

### 版本号规则

默认版本号格式：`YYYYMMDD.HHMMSS`

示例：`20260304.143022` 表示 2026 年 3 月 4 日 14:30:22

### 版本历史文件结构

```json
[
  {
    "version": "20260304.143022",
    "timestamp": "2026-03-04T14:30:22.000Z",
    "gitInfo": {
      "commitHash": "a1b2c3d",
      "commitMsg": "修复登录问题"
    },
    "uploadResult": {
      "success": true,
      "message": "上传成功"
    }
  }
]
```

---

## 常见问题

### Q1: 提示"私钥文件缺失"

**解决方案：**
1. 确认 `private.key` 文件存在于项目根目录
2. 检查文件权限：`ls -la private.key`
3. 确保私钥是从微信公众平台下载的最新版

### Q2: 提示"AppID 无效"

**解决方案：**
1. 检查 `project.config.json` 中的 `appid` 字段
2. 确认私钥文件与当前小程序匹配
3. 登录微信公众平台验证 AppID

### Q3: 首次上传需要扫码

**说明：** 这是微信的安全机制，首次使用或更换私钥时需要管理员扫码确认。

**解决方案：**
1. 运行部署命令
2. 使用小程序管理员微信扫码
3. 后续上传无需再次扫码（私钥有效期内）

### Q4: 上传失败，提示"代码包过大"

**解决方案：**
1. 检查小程序代码包大小（限制：主包 2MB，总包 20MB）
2. 使用分包加载
3. 压缩图片和资源文件
4. 移除未使用的依赖

### Q5: Git 信息获取失败

**说明：** 如果项目不是 Git 仓库，会显示 "No git repo"，不影响部署。

**解决方案：**
```bash
git init
git add .
git commit -m "Initial commit"
```

---

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: Deploy WeChat MiniProgram

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy
        run: node deploy.js -d "GitHub Actions 自动部署"
        env:
          PRIVATE_KEY: ${{ secrets.WECHAT_PRIVATE_KEY }}
```

### Jenkins 示例

```groovy
pipeline {
    agent any
    
    stages {
        stage('Deploy') {
            steps {
                sh 'cd /home/admin/catPlan-Frontend'
                sh 'node deploy.js -d "Jenkins 自动部署"'
            }
        }
    }
}
```

---

## 技术支持

- 微信开放文档：https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html
- miniprogram-ci GitHub: https://github.com/wechat-miniprogram/miniprogram-ci

---

**最后更新**: 2026-03-04  
**维护者**: 自动化部署系统
