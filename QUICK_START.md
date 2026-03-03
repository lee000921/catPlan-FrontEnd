# 快速开始指南 - 前后端分离开发

本文档指导你快速搭建前后端分离的开发环境。

## 📋 项目概览

- **前端**: 微信小程序 (TypeScript)
- **后端**: Node.js + Express API 服务
- **数据库**: MySQL
- **服务器**: 阿里云 ECS
- **部署方式**: Nginx 反向代理 + PM2 进程管理

## 🎯 第一步：配置开发环境

### 推荐配置
- **前端**: Windows + 微信开发者工具
- **后端**: WSL 2 + VS Code Remote (Linux 环境)
- **好处**: 开发环境与生产环境完全一致

> 详见 [BACKEND_ENVIRONMENT.md](./BACKEND_ENVIRONMENT.md) - 完整的环境选择指南

### 1.1 后端环境配置（WSL 2）⭐ 推荐

参考 [BACKEND_ENVIRONMENT.md](./BACKEND_ENVIRONMENT.md) 中的 WSL 2 安装步骤。

### 1.2 前端环境设置

#### 安装依赖
```bash
cd c:\Lee\code\catPlan
npm install
```

#### 启动微信开发者工具
- 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 打开微信开发者工具
- 导入项目：选择 `c:\Lee\code\catPlan` 文件夹
- 使用小程序 AppID: `wx557d4f3490a318fe`

### 1.3 验证前端项目
- 确认能看到项目界面
- 检查是否有 TypeScript 编译错误
- 确认能看到 index 和 logs 两个页面

## 🚀 第二步：后端项目初始化

### 2.1 在 WSL 2 中创建后端项目

打开 WSL 2 终端（或 VS Code 连接到 WSL）：

```bash
# 创建项目目录
mkdir -p ~/projects/catPlan-Server
cd ~/projects/catPlan-Server

# 初始化 Git 仓库
git init

# 初始化 npm 项目
npm init -y
```

### 2.2 在 WSL 2 中安装后端依赖

```bash
# 生产依赖
npm install express cors dotenv mysql2 sequelize bcryptjs jsonwebtoken joi redis winston compression helmet

# 开发依赖
npm install -D typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest ts-jest
```

### 2.3 在 WSL 2 中创建项目结构

```bash
# 创建目录
mkdir -p src/{config,controllers,services,models,middleware,routes,utils,types}
mkdir dist

# 初始化 TypeScript
npx tsc --init

# 复制 tsconfig.json 配置
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### 2.4 配置 package.json 脚本

在 WSL 中编辑 package.json，添加脚本：

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest"
  }
}
```

### 2.5 创建环境变量文件

```bash
# 复制环境变量示例
cp /mnt/c/Lee/code/catPlan/.env.example .env

# 编辑环境变量（使用本地 Linux 配置）
nano .env
```

编辑内容示例：
```bash
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_DATABASE=catplan
JWT_SECRET=dev-secret-key
WECHAT_APP_ID=wx557d4f3490a318fe
WECHAT_APP_SECRET=your-secret-key
```

### 2.6 创建基础 Express 应用

在 WSL 中创建 src/app.ts：

```bash
cat > src/app.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    code: 0, 
    message: '服务正常', 
    timestamp: Date.now() 
  });
});

// 简单的登录接口示例
app.post('/api/user/login', (req, res) => {
  const { code } = req.body;
  
  res.json({
    code: 0,
    message: '登录成功',
    data: {
      token: 'mock-token-12345',
      userInfo: {
        id: '1',
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.jpg'
      }
    },
    timestamp: Date.now()
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ 服务运行在 http://localhost:${PORT}`);
  console.log(`📝 API 文档: http://localhost:${PORT}/api/health`);
});

export default app;
EOF
```

## 🔗 第三步：配置前后端通信

### 3.1 修改前端请求配置
编辑 `miniprogram/utils/request.ts` 中的 `getApiBaseUrl()` 函数：
```typescript
function getApiBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-domain.com';  // 生产环境
  }
  return 'http://localhost:3000';      // 本地开发
}
```

### 3.2 在微信开发者工具中配置

**本地开发方式**（推荐）：
1. 打开微信开发者工具
2. 右上角 → 详情 → 本地设置
3. ✅ 勾选 "不校验合法域名、web-view(业务域名)、TLS 版本以及 HTTPS 证书"

## 📊 第四步：本地测试

### 4.1 启动后端服务（在 WSL 2 中）
```bash
# 在 WSL 2 终端中
cd ~/projects/catPlan-Server
npm run dev
```

预期输出：
```
✅ 服务运行在 http://localhost:3000
📝 API 文档: http://localhost:3000/api/health
```

### 4.2 测试健康检查接口（从 Windows）
```bash
# 在 Windows PowerShell 中（或 WSL 中）
curl http://localhost:3000/api/health
```

预期响应：
```json
{
  "code": 0,
  "message": "服务正常",
  "timestamp": 1635000000000
}
```

### 4.3 在小程序中测试登录接口

修改 `miniprogram/pages/index/index.ts`，添加测试代码：
```typescript
import { loginUser } from '../../services/user';

Page({
  data: {},
  
  async testLogin() {
    try {
      const res = await wx.login();
      const { code } = res;
      
      // 调用后端登录接口
      const result = await loginUser(code);
      console.log('登录成功:', result);
      
      // 显示结果
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      });
    }
  }
});
```

## ⚙️ VS Code 集成 WSL 2

### 连接 VS Code 到 WSL

1. 打开 VS Code
2. 打开扩展商店 (Ctrl+Shift+X)
3. 搜索 "Remote - WSL"
4. 安装微软官方的扩展

5. 打开项目文件夹：
   - Ctrl+K Ctrl+O
   - 选择路径: `\\wsl$\Ubuntu-22.04\home\yourname\projects\catPlan-Server`
   - 或从 WSL 中运行: `code ~/projects/catPlan-Server`

6. VS Code 会自动连接到 WSL
7. 底部会显示 "WSL: Ubuntu-22.04"

## 🐛 常见问题排查

### 问题 1：WSL 2 未安装或版本不对
**症状**: 运行 `wsl --version` 无法识别

**解决方案**:
1. 确认 Windows 版本（需要 Windows 10 最新版或 Windows 11）
2. 按照 [BACKEND_ENVIRONMENT.md](./BACKEND_ENVIRONMENT.md) 重新安装 WSL 2
3. 使用 `wsl -l -v` 查看已安装的发行版

### 问题 2：VS Code 无法连接到 WSL
**症状**: "Remote - WSL" 扩展安装后仍无法连接

**解决方案**:
1. 确认已安装 WSL 2 和 Ubuntu 发行版
2. 重启 VS Code
3. 在 WSL 中运行: `code ~/projects/catPlan-Server`
4. 检查 VS Code 版本是否最新

### 问题 3：前端无法连接后端（localhost:3000）
**症状**: 网络错误或请求超时

**解决方案**:
1. 确保后端服务在 WSL 中正在运行 (`npm run dev`)
2. 在 Windows 中测试: `curl http://localhost:3000/api/health`
3. 检查防火墙是否阻止 3000 端口
4. 在微信开发者工具中勾选"不校验合法域名"

### 问题 4：WSL 中安装 Node.js 失败
**症状**: `npm: command not found`

**解决方案**:
```bash
# 重新安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```

### 问题 5：WSL 中访问 Windows 文件很慢
**症状**: 编译和启动速度很慢

**解决方案**:
❌ 不要把项目放在 `/mnt/c/` (Windows 文件系统)
✅ 应该放在 WSL 文件系统中: `/home/username/projects/`

### 问题 6：TypeScript 编译错误
**症状**: `tsc` 命令找不到

**解决方案**:
```bash
# WSL 中安装 TypeScript
npm install -D typescript ts-node

# 或全局安装
sudo npm install -g typescript ts-node

# 验证
tsc --version
```

### 问题 7：数据库连接失败
**症状**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**解决方案**:
```bash
# WSL 中启动 MySQL
sudo service mysql start

# 或使用 systemctl
sudo systemctl start mysql

# 验证
sudo mysql -u root
```

## 📈 下一步

- [ ] 完成用户认证模块开发
- [ ] 开发核心业务接口
- [ ] 编写单元测试和集成测试
- [ ] 部署到阿里云 ECS
- [ ] 配置生产环境
- [ ] 监控和日志设置

## 📞 更多帮助

- 详见 [ARCHITECTURE.md](./ARCHITECTURE.md) - 完整的架构文档
- 微信小程序文档: https://developers.weixin.qq.com/miniprogram/
- Express 文档: https://expressjs.com/
- TypeScript 文档: https://www.typescriptlang.org/

---

**更新日期**: 2025年10月30日

**提示**: 在开发过程中，如遇到问题，可以查看浏览器控制台和微信开发者工具的调试窗口。
