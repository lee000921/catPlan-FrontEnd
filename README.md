# CatPlan 微信小程序

CatPlan 的微信小程序客户端，包含微信登录、任务创建/审批/完成、周期任务、任务单、签到和积分商城。

## 技术结构

- 页面逻辑目前使用 JavaScript，API 边界和会话层使用 TypeScript。
- 微信开发者工具负责 TypeScript 编译，配置见 `project.config.json`。
- 所有网络请求只能经 `src/utils/request.ts` 发出。
- 所有后端接口集中在 `src/services/`。
- 登录状态只保存在 `catplan_session`；旧缓存键会在首次读取后兼容迁移。
- 客户端不向业务接口发送 `openid` 或角色，身份与权限由服务端 Token 决定。

## 目录

```text
src/
  app.ts                    应用入口与后端域名
  app.json                  页面与 TabBar
  pages/                    页面
  services/                 按业务拆分的类型化 API
  utils/request.ts          请求、错误和 401 处理
  utils/session.ts          单一会话存储
  assets/                   本地图片资源
typings/                    微信 API 类型
deploy.js                   miniprogram-ci 上传/预览
```

## 开发

要求 Node.js 18+ 和微信开发者工具。

```bash
npm install
npm run check
```

然后用微信开发者工具导入仓库根目录。后端地址在 `src/app.ts` 的 `backendBase` 中配置；正式域名还需要加入微信公众平台的 request 合法域名。

新增接口时：

1. 在 `services/` 中定义请求与响应类型；
2. 页面调用 service，不直接调用 `wx.request`；
3. 不从页面传身份字段；
4. 用 `getErrorMessage` 统一展示错误；
5. 提交前运行 `npm run check`。

## 登录与角色

登录页只请求微信资料和登录 code。服务端返回当前账号的 `A`、`B` 或 `AB` 角色，客户端只据此控制界面展示，真正权限仍由服务端校验。

## 上传

将微信“代码上传密钥”保存为仓库根目录的 `private.key`。该文件已被 Git 忽略。

```bash
npm run deploy:preview
npm run deploy -- --version 1.2.3 --desc "发布说明"
```

上传前请确认：

- `project.config.json` 中 AppID 正确；
- `private.key` 已轮换且未提交到版本库；
- `npm run check` 通过；
- 后端已完成数据库备份和迁移；
- 真机验证登录、任务、签到和兑换主流程。
