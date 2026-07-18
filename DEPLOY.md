# 部署指南

## 前置条件

1. `project.config.json` 中配置正确的 AppID。
2. `miniprogram/app.ts` 中配置生产后端 HTTPS 域名。
3. 在微信公众平台将该域名加入 request 合法域名。
4. 从微信公众平台下载新的代码上传密钥，保存为项目根目录 `private.key`。
5. 确认 `private.key` 未被 Git 跟踪。

## 检查与预览

```bash
npm install
npm run check
npm run deploy:preview
```

## 上传

```bash
npm run deploy -- --version 1.2.3 --desc "发布说明"
```

上传只会生成开发版本，仍需在微信公众平台完成体验、审核和发布流程。`deploy-version.json` 保存最近 50 次本地上传记录。

`miniprogram-ci` 仅用于本地/CI 上传，不会进入小程序运行包。其当前官方依赖树仍会触发 npm 开发依赖审计且没有自动修复版本，因此应只在隔离的发布环境运行、限制上传密钥权限，并且不要在包含不可信代码的分支上执行上传脚本。对零告警有硬性要求时，改用微信开发者工具手动上传。

## 发布检查

- 真机验证微信登录和登录过期跳转；
- 分别使用 A、B、AB 账号验证界面与服务端权限；
- 验证任务审批/完成、签到重复提交、商城库存与任务单；
- 后端数据库已备份并成功执行迁移；
- 微信 AppSecret、JWT Secret、数据库密码和上传密钥均已轮换；
- 日志中没有配置错误、迁移错误或周期调度失败。
