# catPlan 前后端分离架构文档

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户端                                    │
│                    (微信小程序客户端)                              │
│                      TypeScript                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTPS API 调用
                       │ (请求/响应)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   阿里云 ECS 服务器                              │
│                    (后端 API 服务)                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express/Node.js  │  Controllers  │  Services           │   │
│  │  路由处理          │  业务逻辑      │  数据验证            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            数据库 (MySQL/PostgreSQL)                      │   │
│  │            或缓存 (Redis)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 项目结构规划

### 前端项目 (当前项目 - catPlan)
```
catPlan/
├── miniprogram/              # 小程序源代码
│   ├── app.json
│   ├── app.ts
│   ├── pages/
│   │   ├── index/
│   │   └── logs/
│   ├── utils/
│   │   ├── util.ts          # 工具函数
│   │   ├── request.ts       # API 请求封装 (NEW)
│   │   └── config.ts        # 配置文件 (NEW)
│   └── services/            # API 服务层 (NEW)
│       ├── user.ts
│       ├── product.ts
│       └── order.ts
├── typings/                 # TypeScript 类型定义
├── package.json
├── project.config.json
└── README.md
```

### 后端项目 (需要新建 - catPlan-Server)
```
catPlan-Server/
├── src/
│   ├── app.ts              # Express 应用入口
│   ├── config/
│   │   ├── database.ts     # 数据库配置
│   │   ├── env.ts          # 环境变量配置
│   │   └── constants.ts    # 常量定义
│   ├── controllers/        # 控制器层
│   │   ├── userController.ts
│   │   ├── productController.ts
│   │   └── orderController.ts
│   ├── services/           # 业务逻辑层
│   │   ├── userService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   ├── models/             # 数据模型
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── order.ts
│   ├── middleware/         # 中间件
│   │   ├── auth.ts         # 认证中间件
│   │   ├── errorHandler.ts # 错误处理
│   │   └── logger.ts       # 日志中间件
│   ├── routes/             # 路由
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── product.ts
│   │   └── order.ts
│   ├── utils/              # 工具函数
│   │   ├── validators.ts   # 数据验证
│   │   ├── jwt.ts          # JWT 工具
│   │   └── response.ts     # 统一响应格式
│   └── types/              # TypeScript 类型定义
│       ├── user.ts
│       └── api.ts
├── .env.example            # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 API 调用流程

### 1. 前端发起请求
```typescript
// miniprogram/services/user.ts
import { request } from '../utils/request';

export const loginUser = (code: string) => {
  return request({
    url: '/api/user/login',
    method: 'POST',
    data: { code }
  });
};
```

### 2. 后端处理请求
```typescript
// catPlan-Server/src/routes/user.ts
router.post('/login', async (req, res) => {
  const { code } = req.body;
  const result = await userService.login(code);
  res.json({ code: 0, message: '成功', data: result });
});
```

## 🌐 API 接口设计

### 统一响应格式
```json
{
  "code": 0,              // 业务状态码 (0 成功, 其他 失败)
  "message": "成功",      // 提示信息
  "data": {},             // 返回数据
  "timestamp": 1630000000 // 时间戳
}
```

### 错误响应格式
```json
{
  "code": 1,
  "message": "用户不存在",
  "error": "USER_NOT_FOUND",
  "timestamp": 1630000000
}
```

## 🔐 安全性考虑

### 1. HTTPS 通信
- 所有 API 请求必须使用 HTTPS
- 小程序默认支持 HTTPS

### 2. 身份认证
- 使用 JWT token 进行用户身份验证
- 小程序登录流程:
  1. 小程序调用 `wx.login()` 获取临时 code
  2. 前端将 code 发送到后端
  3. 后端用 code 换取 openid 和 session_key (需要调用微信接口)
  4. 后端生成 JWT token 返回给前端
  5. 前端后续请求在 Header 中携带 token

### 3. 数据验证
- 后端对所有输入数据进行严格验证
- 实施速率限制 (Rate Limiting)
- 防止 SQL 注入和 XSS 攻击

### 4. CORS 配置
```typescript
// 允许小程序跨域请求
app.use(cors({
  origin: process.env.MINI_PROGRAM_DOMAIN,
  credentials: true
}));
```

## 🚀 部署架构 (阿里云 ECS)

### 推荐配置
- **ECS 实例**: 2核 4GB (入门足够，可按需扩展)
- **操作系统**: CentOS 8 / Ubuntu 20.04
- **Node.js**: LTS 版本 (18.x 或 20.x)
- **数据库**: MySQL 5.7+ 或 PostgreSQL 12+
- **缓存**: Redis 6.0+

### 部署流程
```bash
# 1. 服务器环境准备
ssh root@your-ecs-ip

# 2. 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装 PM2 进程管理器
npm install -g pm2

# 4. 克隆项目
git clone https://github.com/lee000921/catPlan-Server.git
cd catPlan-Server

# 5. 安装依赖
npm install

# 6. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息

# 7. 启动应用
pm2 start src/app.ts --name catPlan-api

# 8. 配置 Nginx 反向代理
# ... (详见下方 Nginx 配置)
```

### Nginx 反向代理配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 重定向 HTTP 到 HTTPS
    error_page 497 https://$server_name$request_uri;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 监控与日志

### PM2 监控
```bash
# 查看进程状态
pm2 list

# 查看实时日志
pm2 logs catPlan-api

# 保存进程列表
pm2 save

# 启用开机自启
pm2 startup
```

### 日志管理
- 使用 Winston 或 Bunyan 进行日志管理
- 日志文件位置: `/var/log/catPlan/`
- 日志轮转: 按日期和大小轮转

## 🔗 前端请求配置示例

### miniprogram/utils/config.ts
```typescript
// 根据环境配置不同的 API 服务器
const config = {
  development: {
    apiBase: 'http://localhost:3000'
  },
  production: {
    apiBase: 'https://your-domain.com'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## 📝 开发工作流

### 1. 本地开发
```bash
# 后端启动
cd catPlan-Server
npm run dev  # 使用 nodemon 进行热重载

# 前端通过微信开发者工具启动
# 修改 config.ts 中的 apiBase 为 localhost
```

### 2. 测试环境
```bash
# 部署测试版本到阿里云测试机
# 前端指向测试服务器地址
```

### 3. 生产环境
```bash
# 部署到阿里云生产 ECS
# 使用真实域名和 SSL 证书
# 启用 PM2 守护进程
```

## 🔄 持续集成 (CI/CD)

### 推荐使用 GitHub Actions
- 自动化测试
- 自动化部署
- 版本控制

## 📚 关键技术点

| 层级 | 技术 | 作用 |
|-----|------|------|
| 前端 | TypeScript + 微信小程序 API | 提供用户界面 |
| 前端通信 | HTTPS + fetch/xhr | 与后端通信 |
| 后端框架 | Express.js | 路由和中间件 |
| 数据库 | MySQL/PostgreSQL | 数据存储 |
| 缓存 | Redis | 加速读取 |
| 服务器 | 阿里云 ECS | 托管后端 |
| 域名 | 域名 + SSL | HTTPS 通信 |
| 进程管理 | PM2 | 守护进程 |
| 反向代理 | Nginx | 负载均衡与代理 |

## 🎯 下一步行动

1. ✅ 阅读本文档
2. ⬜ 创建后端项目结构
3. ⬜ 完成后端 API 开发
4. ⬜ 更新前端请求封装
5. ⬜ 本地测试前后端通信
6. ⬜ 申请阿里云 ECS 并配置环境
7. ⬜ 部署后端到生产环境
8. ⬜ 配置小程序服务器域名白名单
9. ⬜ 测试与上线

---

**更新日期**: 2025年10月30日
