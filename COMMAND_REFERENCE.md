# 💻 开发命令速查表

快速参考所有常用的开发和部署命令。

## 📁 前端项目命令

### 项目位置
```bash
c:\Lee\code\catPlan
```

### 依赖管理
```bash
# 安装依赖
npm install

# 更新依赖
npm update

# 清空 node_modules 并重新安装
rm -r node_modules package-lock.json
npm install

# 检查过期的包
npm outdated
```

### 编译和构建
```bash
# 编译 TypeScript（仅在必要时）
npx tsc

# 检查 TypeScript 错误
npx tsc --noEmit

# 查看编译后的 JavaScript
npx tsc && dir dist/
```

### 开发调试
```bash
# 在微信开发者工具中：
# 1. 打开工具
# 2. 导入项目：c:\Lee\code\catPlan
# 3. 使用 AppID: wx557d4f3490a318fe
# 4. 点击"编译"查看效果
# 5. 打开调试工具 (按 F12)
```

### 源代码管理
```bash
# 查看项目文件结构
dir /s miniprogram

# 查看项目统计
# 前端代码行数
find miniprogram -name "*.ts" -o -name "*.json" | xargs wc -l
```

## 🔌 后端项目命令

### 项目初始化
```bash
# 创建后端项目目录
cd c:\Lee\code
mkdir catPlan-Server
cd catPlan-Server

# 初始化 npm 项目
npm init -y

# 创建项目结构
mkdir -p src/{config,controllers,services,models,middleware,routes,utils,types}
mkdir -p dist
```

### 后端依赖安装
```bash
# 安装生产依赖
npm install express cors dotenv mysql2 sequelize bcryptjs jsonwebtoken joi redis winston compression helmet

# 安装开发依赖
npm install -D typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest ts-jest

# 一行命令安装全部
npm install express cors dotenv mysql2 sequelize bcryptjs jsonwebtoken joi redis winston compression helmet -S && npm install typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest ts-jest -D
```

### 开发运行
```bash
# 启动开发服务器（带热重载）
npm run dev

# 仅编译
npm run build

# 运行编译后的代码
npm start

# 运行测试
npm test

# 代码检查
npm run lint
```

### 进程管理 (PM2)
```bash
# 全局安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/app.js --name catPlan-api

# 查看进程列表
pm2 list

# 查看实时日志
pm2 logs catPlan-api

# 查看进程详情
pm2 info catPlan-api

# 重启进程
pm2 restart catPlan-api

# 停止进程
pm2 stop catPlan-api

# 删除进程
pm2 delete catPlan-api

# 保存进程列表
pm2 save

# 启用开机自启
pm2 startup
```

## 🌐 阿里云 ECS 部署命令

### 连接到 ECS
```bash
# SSH 连接到服务器
ssh root@your-ecs-ip

# 如果有密钥文件
ssh -i /path/to/key.pem root@your-ecs-ip
```

### 服务器环境设置
```bash
# 更新系统
sudo apt-get update
sudo apt-get upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2
npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 MySQL
sudo apt-get install -y mysql-server

# 安装 Redis
sudo apt-get install -y redis-server
```

### 部署应用
```bash
# 克隆代码
git clone https://github.com/lee000921/catPlan-Server.git
cd catPlan-Server

# 安装依赖
npm install

# 编译
npm run build

# 配置环境变量
cp .env.example .env
nano .env  # 编辑环境变量

# 启动应用
pm2 start dist/app.js --name catPlan-api

# 验证运行
curl http://localhost:3000/api/health
```

### Nginx 配置
```bash
# 编辑 Nginx 配置
sudo nano /etc/nginx/sites-available/catplan

# 启用站点
sudo ln -s /etc/nginx/sites-available/catplan /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看 Nginx 状态
sudo systemctl status nginx
```

### SSL 证书 (Let's Encrypt)
```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot certonly --standalone -d your-domain.com

# 自动续期配置
sudo certbot renew --dry-run
```

### 数据库操作
```bash
# 连接到 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE catplan;
CREATE USER 'catplan'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON catplan.* TO 'catplan'@'localhost';
FLUSH PRIVILEGES;

# 执行 SQL 文件
mysql -u catplan -p catplan < database.sql
```

### 日志查看
```bash
# PM2 日志
pm2 logs catPlan-api

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 系统日志
sudo journalctl -xe
```

### 监控和维护
```bash
# 查看进程状态
pm2 status

# 查看内存占用
pm2 monit

# 查看 CPU 和内存使用
top

# 查看磁盘使用
df -h

# 查看文件夹大小
du -sh *

# 检查端口占用
netstat -tulpn | grep 3000
lsof -i :3000
```

## 🔄 Git 版本控制

### 基础命令
```bash
# 查看状态
git status

# 添加文件
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到远程
git push origin main

# 拉取远程更新
git pull origin main
```

### 分支管理
```bash
# 创建新分支
git checkout -b feature/my-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/my-feature

# 删除分支
git branch -d feature/my-feature

# 查看所有分支
git branch -a
```

### 标签管理
```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0

# 查看所有标签
git tag -l
```

## 📊 测试命令

### 接口测试
```bash
# 测试健康检查接口
curl http://localhost:3000/api/health

# 测试登录接口
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"code":"test-code"}'

# 带 Authorization header
curl -X GET http://localhost:3000/api/user/info \
  -H "Authorization: Bearer your-token"
```

### 数据库测试
```bash
# 连接数据库
mysql -h localhost -u root -p catplan

# 显示所有表
SHOW TABLES;

# 查看表结构
DESCRIBE users;

# 查询数据
SELECT * FROM users;

# 统计记录
SELECT COUNT(*) FROM users;
```

### 缓存测试
```bash
# 连接 Redis
redis-cli

# 测试连接
ping

# 查看所有 key
KEYS *

# 获取 key 值
GET key-name

# 设置 key 值
SET key-name value

# 删除 key
DEL key-name

# 清空数据库
FLUSHDB
```

## 🐛 常用调试命令

### 前端调试
```bash
# 在微信开发者工具中：
# 1. 点击"编译"
# 2. 按 F12 打开调试工具
# 3. 查看 Console 标签页查看日志
# 4. 使用 wx.getStorageSync('token') 查看本地存储
```

### 后端调试
```bash
# 查看实时日志
pm2 logs -f

# 增加 Node.js 日志级别
DEBUG=* npm run dev

# 使用 node 调试器
node --inspect dist/app.js
# 然后访问 chrome://inspect
```

## 🔧 配置文件编辑

### 编辑环境变量
```bash
# Windows
notepad .env

# Linux/Mac
nano .env
# 或
vim .env
```

### 编辑 Nginx 配置
```bash
# Windows (WSL)
sudo nano /etc/nginx/sites-available/catplan

# Linux
sudo vim /etc/nginx/sites-available/catplan
```

## 📦 常用的 npm 全局包

```bash
# 安装全局包
npm install -g pm2 nodemon typescript ts-node

# 查看全局包
npm list -g

# 更新全局包
npm update -g

# 卸载全局包
npm uninstall -g package-name
```

## 🎯 快速命令组合

### 完整的开发流程
```bash
# 1. 启动后端
cd c:\Lee\code\catPlan-Server
npm run dev

# 2. 启动前端（新终端）
# 打开微信开发者工具，导入 c:\Lee\code\catPlan

# 3. 测试 API
curl http://localhost:3000/api/health

# 4. 查看日志
pm2 logs
```

### 完整的部署流程
```bash
# 1. 本地编译
npm run build

# 2. 上传到服务器
scp -r dist/ root@your-ecs-ip:/var/www/catplan/

# 3. 在服务器上启动
ssh root@your-ecs-ip "cd /var/www/catplan && pm2 start dist/app.js"

# 4. 验证运行
curl https://your-domain.com/api/health
```

---

## 💡 快速提示

- 🔄 **热重载**: 开发时使用 `npm run dev`，自动重启应用
- 📊 **监控**: 使用 `pm2 monit` 实时监控进程
- 📝 **日志**: 生产环境使用 `pm2 logs` 查看日志
- 🔐 **安全**: 生产环境记得修改 JWT_SECRET
- 🚀 **部署**: 使用 PM2 ensure 开机自启

---

**最后更新**: 2025年10月30日
