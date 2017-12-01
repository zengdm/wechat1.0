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
  city: {cityId:1101, cityName:'北京市'},




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

  // getUserInfo: function (cb) {
  //   console.log('app.js getUsreInfo')
  //   var that = this
  //   if (this.globalData.userInfo) {
  //     typeof cb == "function" && cb(this.globalData.userInfo)
  //   } else {
  //     //调用登录接口
  //     wx.login({
  //       success: function (res) {
  //         console.log(res.code);
  //         wx.getUserInfo({
  //           success: function (user) {
  //             console.log('app user info');
  //             console.log(user);
  //             that.globalData.userInfo = user.userInfo

  //             // 设置登录缓存
  //             if (!that.wxapi.getUserInfo()) {
  //               that.wxapi.authorize(res.code, user);
  //             } else {
  //               console.log('from cache user:');
  //               console.log(that.wxapi.getUserInfo());
  //             }

  //             typeof cb == "function" && cb(that.globalData.userInfo)
  //           },fail:function(failRes){
  //             // 拒绝授权，再次唤醒
  //             console.log('唤醒授权');
  //             console.log(failRes)
  //           }
  //         })
  //       },
  //       fail: function() {
  //         console.log('login fail');
  //       }
  //     })
  //   }
  // },

   ifBind:function(that){

    wx.request({
      url: 'http://item.diandong.com/passport/clientapi/wxxcxLog',
      method: "POST",
      data: {
        code: that.data.code,
        type: 'xcx',
        encryptedData: that.data.encryptedData,
        iv: that.data.iv,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (resp) {
        // console.log(res)
      },
      success: function (resp) {
        console.log(resp);
        // 设置缓存
        wx.setStorage({
          key: 'key',
          data: {
            openid: resp.data.data.data.openid,
            session_key: resp.data.data.data.session_key,
            unionId: resp.data.data.data.unionId,
            has_mobile: resp.data.data.has_mobile,
            token: resp.data.data.token
          }
        })

        // wx.clearStorage()
      }
    })

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
    city:{}
  }
});