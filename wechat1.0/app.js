//app.js
import { wxapi } from "plugins/wxapi";
App({

  // API请求host
  apiHost: 'http://item.diandong.com',
  // 接口调试模式，true:无缓存   false:有缓存
  apiDebug: false,
  // 缓存失效时间，单位秒
  expireTime: 3600,
  // 默认城市
  city: { cityId: 1101, cityName: '北京市' },
  // 点击量传值
  points: { feedid: 0, sourceid: 0, platid: 0, pv: 0, replies: 0, praise: 0, fav:0},
  onLaunch: function (e, that) {
    var that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);

    // 授权登录
    that.wxapi = new wxapi(that);
    that.wxapi.wxlogin();
  },
  
  /**
   * 全局变量，可使用getApp().globalData调用
   */
  globalData: {
    // 是否手机号认证
    has_mobile: false,
    // 用户登录信息
    userInfo: null,
    // 所在城市
    city: {}
  }
});