# 🚀 部署快速指南

## 3 步完成首次部署

### 步骤 1: 获取私钥

1. 登录 https://mp.weixin.qq.com
2. 进入「版本管理」
3. 下载「代码上传密钥」
4. 重命名为 `private.key`
5. 放到项目根目录

### 步骤 2: 验证配置

```bash
cd /home/admin/catPlan-Frontend
ls -la private.key  # 确认文件存在
```

### 步骤 3: 执行部署

```bash
# 快速部署
npm run deploy

# 或
node deploy.js
```

---

## 常用命令

```bash
# 查看帮助
node deploy.js -h

# 指定版本号
node deploy.js -v 1.0.0 -d "新版本"

# 预览模式
node deploy.js -p

# 查看部署历史
cat deploy-version.json
```

---

## 文件清单

- ✅ `deploy.js` - 部署脚本
- ✅ `DEPLOYMENT.md` - 完整文档
- ✅ `private.key` - 私钥文件（需要配置）
- 📋 `deploy-version.json` - 版本历史（首次部署后生成）

---

**详细说明请阅读**: `DEPLOYMENT.md`
