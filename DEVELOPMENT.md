# 开发指南

## 启动

```bash
npm install
npm run check
```

使用微信开发者工具导入仓库根目录。项目根目录由 `project.config.json` 指向 `src/`。

## 调用后端

页面不得直接调用 `wx.request`。在 `src/services/` 中定义接口：

```ts
import { get } from '../utils/request';

export function getExample() {
  return get<{ ok: true; value: string }>('/api/example');
}
```

页面通过 service 调用，并统一处理错误：

```js
const { getExample } = require('../../services/example');
const { getErrorMessage } = require('../../utils/request');

try {
  const response = await getExample();
  this.setData({ value: response.value });
} catch (error) {
  wx.showToast({ title: getErrorMessage(error), icon: 'none' });
}
```

不要在业务请求中传 `openid`、Token 或角色；请求层自动读取 `catplan_session` 并添加认证头。

## 页面开发约定

- WXML 不调用 `includes`、`substring`、`Math` 或页面方法；先在 JS 中生成展示字段。
- 页面事件参数先转换并校验数字 ID。
- 异步提交必须防重复，并在 `finally` 中恢复 loading 状态。
- 401 由请求层统一清理会话并跳转登录页。
- 视觉规范见 `FRONTEND_STYLE_GUIDE.md`。

## 提交前

```bash
npm run check
```

同时在开发者工具和真机上检查控制台、网络请求、空状态、加载态与错误态。
