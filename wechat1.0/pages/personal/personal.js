var app = getApp();
import { login } from '../../plugins/login';
import { wxapi } from '../../plugins/wxapi';


Page({
  data: {
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,

    verifyCodeTime: '验证',
    buttonDisable: '',
    hidden: true,
    phoneBorder: false,
    codeBorder: false,
    error: false,
    accredit: '',
    // 当前登录信息
    userInfo:{}
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.login = new login(that);
    that.wxapi = new wxapi(that);
    
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },

  onReady: function () {
    var that = this;
    // 获取登录信息
    var userInfo = that.wxapi.getUserInfo();
    // 重新授权
    if (!userInfo) {
      // that.wxapi.reLogin('setPageVars');
    } else {
      that.setPageVars(userInfo);
    }

    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          that.data.accredit = res.authSetting['scope.userInfo'];

          // 获取登录授权
          that.wxapi.wxlogin();

          console.log(that.data.accredit);
          that.setData({
            accredit: that.data.accredit
          })

        } else {
          that.data.accredit = res.authSetting['scope.userInfo'];
          console.log(that.data.accredit);
          that.setData({
            accredit: that.data.accredit
          })
        }

      }
    })

  },

  /**
   * 点击用户头像再次授权
   * 
   */
  redelegation: function (e) {
    var that = this;
    that.wxapi.reLogin('setPageVars');
  },

  // setTimeout(test, 1000);
  onShow:function(){
    var that = this;
    setTimeout(function () {

      console.log('onshow-------------------------------------------' + that.data.accredit);
      that.setData({
        accredit: that.data.accredit
      })

    }, 50);
    

  },

  // 统一设置模板变量
  setPageVars: function(res) {
    var that = this;
    console.log('setPageVar function data:');
    if (res) {
      // 设置全局变量用户信息
      that.data.userInfo = res;

      that.setData({
        userInfo: res,
        has_mobile: res.has_mobile
      });
    }
    
  },


  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: '电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！',
      path: '/pages/personal/personal',
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },


  ifBind: function (that) {
    var that = this;
    // that.wxapi.wxlogin();
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
        console.log(resp.data.data.has_mobile);

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
 

  myCollect: function (e) {
    var that = this;
    // 用户授权信息判断
    if (!that.data.userInfo.openid) {
      that.wxapi.reLogin('setPageVars');
      return false;
    }


    // 手机号校验
    if (!that.wxapi.validatedMobile()) {
      return false;
    }

    // if (!that.data.userInfo.has_mobile) {
    //   that.wxapi.wxlogin();
    //   wx.openSetting({
    //     success: (res) => {
    //       if (res.authSetting['scope.userInfo']) {
    //         that.data.accredit = res.authSetting['scope.userInfo'];

    //         // 获取登录授权
    //         that.wxapi.wxlogin();

    //         console.log(that.data.accredit);
    //         that.setData({
    //           accredit: that.data.accredit
    //         })

    //       } else {
    //         that.data.accredit = res.authSetting['scope.userInfo'];
    //         console.log(that.data.accredit);
    //         that.setData({
    //           accredit: that.data.accredit
    //         })
    //       }
    //     }
    //   })



    // }else{

    //   console.log('regisert ---');
    //   console.log(that.wxapi.getUserInfo());
    //   // 手机号校验
    //   console.log("手机号校验")
    //   that.data.validated = that.wxapi.validatedMobile();
    //   if (!that.data.validated) {
    //     console.log(that.data.validated)
    //     return that.data.validated;
    //   }

      //跳转到新页面，可返回
      wx.navigateTo({
        url: '../collect/collect'
      })

    // }
    
  },

  getCode: function () {
    var that = this;
    that.login.sendCode();
  },

  mobileInputEvent: function (e) {
    var that = this;
    // that.login.mobileInputEvent();
    // console.log(e.detail.value);
    that.data.mobile = e.detail.value;
    that.setData({
      mobile: e.detail.value,
      error: false

    })

  },

  codeInputEvent: function (e) {
    var that = this;
    that.data.verifyCode = e.detail.value;
    // console.log(e.detail.value);
    that.setData({
      verifyCode: e.detail.value
    })
  },

  phoneSubmit: function () {
    var that = this;
    that.login.phoneSubmit();
  },

  inPhone: function () {
    var that = this;
    that.login.inPhone();
  },

  outPhone: function () {
    var that = this;
    that.login.outPhone();
  },

  inCode: function () {
    var that = this;
    that.login.inCode();
  },

  outCode: function () {
    var that = this;
    that.login.outCode();
  },

  close: function () {
    var that = this;
    that.login.close();
  },


  carContrast: function (e) {
    var that = this;

    // 用户授权信息判断
    // if (!that.data.userInfo.openid) {
    //   that.wxapi.reLogin('setPageVars');
    //   return false;
    // }

    // 手机号校验
    // if (!that.wxapi.validatedMobile()) {
    //   return false;
    // }

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../contrast/contrast'
    })
  },

  wxGroup: function (e) {

    var that = this;

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../weChat_group/weChat_group'
    })
  },


  wxService: function (e) {

    var that = this;

    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../service/service'
    })
  },


});
