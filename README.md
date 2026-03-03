# catPlan 小程序项目

## 📋 项目介绍

`catPlan` 是一个 **前后端分离** 的微信小程序项目。
- **前端**: 微信小程序 (TypeScript)
- **后端**: Node.js/Express API 服务，部署在阿里云 ECS
- **特点**: 采用现代化的开发工具链和最佳实践

## 🏗️ 项目结构

```
catPlan/
├── miniprogram/              # 小程序源代码
│   ├── app.json             # 小程序配置文件
│   ├── app.ts               # 小程序入口文件
│   ├── app.wxss             # 小程序全局样式
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   │   ├── index.json
│   │   │   ├── index.ts
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   └── logs/            # 日志页面
│   │       ├── logs.json
│   │       ├── logs.ts
│   │       ├── logs.wxml
│   │       └── logs.wxss
│   ├── services/            # API 服务层 ⭐
│   │   └── user.ts          # 用户服务
│   └── utils/               # 工具函数
│       ├── util.ts
│       ├── request.ts       # HTTP 请求封装 ⭐
│       └── config.ts        # 配置文件
├── typings/                 # TypeScript 类型定义
├── package.json             # 项目依赖配置
├── project.config.json      # 微信开发者工具配置
├── tsconfig.json            # TypeScript 配置
├── ARCHITECTURE.md          # 前后端架构文档 ⭐⭐⭐
├── BACKEND_PACKAGE.json     # 后端项目参考配置
├── .env.example             # 环境变量示例
└── README.md               # 项目说明（本文件）
```

### 关键文件说明
- ⭐ **ARCHITECTURE.md**: 详细的前后端分离架构设计文档
- ⭐ **miniprogram/services/user.ts**: 前端 API 服务封装示例
- ⭐ **miniprogram/utils/request.ts**: HTTP 请求拦截和封装
- ⭐ **BACKEND_PACKAGE.json**: 后端项目依赖参考

## 🛠️ 技术栈

- **语言**: TypeScript
- **框架**: 微信小程序
- **编译工具**: 微信开发者工具 (支持 TypeScript 编译插件)
- **组件框架**: glass-easel
- **代码加载**: 懒加载必要组件
- **目标环境**: ES2020

## 📦 项目配置说明

### package.json
- 项目名称: `miniprogram-ts-quickstart`
- 版本: `1.0.0`
- 依赖:
  - `miniprogram-api-typings` (^2.8.3-1) - 微信小程序 API 类型定义

### project.config.json (微信开发者工具配置)
- **小程序根目录**: `miniprogram/`
- **编译类型**: 小程序 (miniprogram)
- **AppID**: `wx557d4f3490a318fe`
- **关键设置**:
  - TypeScript 编译支持已启用
  - WXML/WXSS 压缩已启用
  - Skyline 渲染已启用
  - 源码上传已启用

### tsconfig.json (TypeScript 配置)
- **严格模式**: 已启用所有严格检查选项
- **目标**: ES2020
- **模块**: CommonJS
- **类型根目录**: `./typings`
- **特殊配置**:
  - 实验性装饰器支持
  - 严格的空值检查
  - 未使用变量/参数的检测

## 🚀 快速开始

### 1. 环境要求
- 微信开发者工具
- Node.js (推荐 14.x 或更高版本)
- MySQL 5.7+ (后端数据库)
- Redis (可选，用于缓存)

### 2. 前端项目安装
```bash
# 安装依赖
npm install

# 微信开发者工具中打开本项目目录
# 工具会自动编译 TypeScript 文件
```

### 3. 后端项目启动 (新建项目)

详见 [ARCHITECTURE.md](./ARCHITECTURE.md) 中的后端部署章节

### 4. 配置服务器域名

在微信小程序开发者平台：
- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 开发 → 开发设置 → 服务器域名
- 配置请求合法域名（为你的后端服务器域名）

### 5. 项目页面
目前项目包含两个页面:
- **index**: 首页 (`pages/index/index`)
- **logs**: 日志页面 (`pages/logs/logs`)

## 📝 主要功能

### 前端功能
- 微信授权登录
- 本地数据存储
- HTTP 请求统一封装
- API 服务层封装

### 后端功能（待开发）
- 用户认证和授权
- 微信登录接口对接
- JWT token 管理
- API 接口开发
- 数据库操作
- 错误处理和日志记录

### app.ts (应用入口)
主要功能包括:
- 本地存储能力演示 (logs 存储)
- 用户登录流程 (微信授权登录)
- 获取用户授权码 (code)

### 导航栏配置
- 导航栏文字颜色: 黑色
- 导航栏标题: "Weixin"
- 导航栏背景色: 白色 (#ffffff)

## 🔧 开发建议

### 前端开发
1. **HTTP 请求**: 查看 `miniprogram/utils/request.ts` 了解请求封装
2. **API 调用**: 参考 `miniprogram/services/user.ts` 的模式
3. **Token 管理**: 自动在请求头中添加 Authorization
4. **错误处理**: 统一的错误拦截和处理机制

### 后端开发
1. **项目初始化**: 参考 `BACKEND_PACKAGE.json` 创建后端项目
2. **环境配置**: 复制 `.env.example` 创建 `.env` 文件
3. **架构设计**: 详见 `ARCHITECTURE.md` 文档
4. **安全性**: 实施 JWT 认证、数据验证、CORS 配置等

### 类型安全
项目启用了严格的 TypeScript 检查，确保代码质量

### 前后端通信流程
1. 前端在 `miniprogram/utils/request.ts` 中发起 HTTP 请求
2. 请求自动添加 token 和其他公共 header
3. 后端接收请求并验证 token
4. 后端返回统一格式的响应
5. 前端自动处理响应和错误

## 📚 相关文档

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 详细的系统架构和部署指南
- **[项目配置说明](#项目配置说明)** - 各配置文件的详细说明
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Express.js 文档](https://expressjs.com/)

## 🎯 开发路线图

- [ ] 后端项目初始化
- [ ] 数据库表结构设计
- [ ] 用户认证模块开发
- [ ] 基础 API 接口开发
- [ ] 前端页面开发
- [ ] 前后端通信测试
- [ ] 本地调试验证
- [ ] 阿里云 ECS 部署
- [ ] 生产环境配置
- [ ] 上线发布

## 📄 许可证

暂未指定 (需在 package.json 中配置)

## 👤 作者

Repository Owner: lee000921

## 📞 支持

如有问题，请查阅:
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- 项目配置文件中的相关说明

---

**更新日期**: 2025年10月30日
