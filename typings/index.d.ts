/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    backendBase: string,
    userInfo?: WechatMiniprogram.UserInfo,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}
