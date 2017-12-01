import { login } from '../../plugins/login';
import { favorite } from '../../plugins/favorite';
import { wxapi } from '../../plugins/wxapi';
//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
// import phone from '../phone/phone.js'
// import phone from '../util/phone'
// import  login  from '../../plugins/login';
// var login = require("../../plugins/login");
//  console.log(app)//可查看公共js（app.js）的方法
//  console.log(app.item)
Page({
  data: {
    feedid: 0,
    sourceid: 0,
    isPraise: 0,
    platid: 0,
    // 收藏的文章id数组
    favArtIds: [],
    // 文章是否收藏
    isFav: 0,
    // 点赞数
    agree: 0,
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    detailData: {},
    contentData: {},
    myData: {},
    listsData: [],
    isagree: false,
    sourceid: '',
    platid: '',
    isbottom: true,

    openid: '',
    session_key: '',

    lastTime: 0,
    lastReplyId: 0,

    authorid: '',
    author: '',
    avatar: '',

    repliesData: 0,
    commentShow: true,
    showCollet: false,
    isaddshop: false,

    verifyCodeTime: '验证',
    buttonDisable: '',
    hidden: true,
    phoneBorder: false,
    codeBorder: false,
    error: false,
    userInfo: {},
    //输入框点击获取焦点
    focus: false
  },

  onLoad: function (options) {
    //  页面初始化  options为页面跳转所带来的参数
    var that = this;
    console.log(options);
    that.data.feedid = options.feedid;
    that.wxapi = new wxapi(that);
    that.data.userInfo = that.wxapi.getUserInfo();
    console.log(that.data.userInfo)
    // 登录信息
    that.login = new login(that);
    // 文章收藏
    that.fav = new favorite(that);
    that.data.favArtIds = that.fav.getFav('article');
    that.data.favPraise = that.fav.getFav('praise');

    that.setData({
      myData: options
    });
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

    if (that.data.myData.platid) {
      //轮播图跳转资讯详情
      that.data.sourceid = that.data.myData.sourceid;
      that.data.platid = that.data.myData.platid;

      that.newbanner()

    } else {
      //渲染文章详情
      that.info()
    }

  },

  info: function () {
    //渲染文章详情
    var that = this;
    wx.request({
      url: app.apiHost + '/app/feed/finfo',
      method: "POST",
      data: {
        feedid: that.data.myData,
        // feedid: 80,
        openid: that.data.openid,
        session_key: that.data.session_key,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
        //  console.log(res.data)
      },
      success: function (res) {
        // console.log(res)
        var rdata = res.data;
        that.data.detailData = rdata.data;
        that.data.sourceid = rdata.data.sourceid;
        that.data.platid = rdata.data.platid;
        // that.data.repliesData = rdata.data.points.replies;

        that.data.authorid = rdata.data.authorid;
        that.data.author = rdata.data.author;
        that.data.avatar = rdata.data.avatar;
        that.data.sourceid = rdata.data.sourceid;
        that.data.platid = rdata.data.platid;
        // 统计记录点赞数
        that.data.agree = that.data.detailData.points.agree;
        // 是否已点赞
        that.data.isPraise = that.fav.isFav('praise', that.data.sourceid, that.data.platid);
        // 文章是否收藏
        that.data.isFav = that.fav.isFav('article', that.data.sourceid, that.data.platid);

        that.setData({//逻辑层到视图层
          detailData: that.data.detailData,
          repliesData: that.data.repliesData,
          // 是否收藏
          isfav: that.data.isFav,
          // 是否点赞
          ispraise: that.data.isPraise,
          // 点赞数
          agree: that.data.agree,
          author: that.data.author,
        });
        //  wx.setNavigationBarTitle({
        //      title:  that.data.detailData.name
        //  })
        setTimeout(function () {
          that.getcontent();
        }, 1000);
      }
    });
  },
  newbanner: function () {
    //渲染文章详情
    var that = this;
    wx.request({
      url: app.apiHost + '/app/xcx/focusarticle?platid=' + that.data.myData.platid + '&sourceid=' + that.data.myData.sourceid,
      method: "GET",
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
        //  console.log(res.data)
      },
      success: function (res) {
        console.log(res)
        var rdata = res.data;
        that.data.detailData = rdata.data;

        that.data.repliesData = rdata.data.points.replies;

        // that.data.authorid = rdata.data.authorid;
        that.data.author = rdata.data.author;
        that.data.avatar = rdata.data.avatar;
        // that.data.sourceid = rdata.data.sourceid;
        // that.data.platid = rdata.data.platid;
        // 统计记录点赞数
        that.data.agree = that.data.detailData.agree_num;
        // 是否已点赞
        that.data.isPraise = that.fav.isFav('praise', that.data.sourceid, that.data.platid);
        // 文章是否收藏
        that.data.isFav = that.fav.isFav('article', that.data.sourceid, that.data.platid);

        that.setData({//逻辑层到视图层
          detailData: that.data.detailData,
          // repliesData: that.data.repliesData,
          // 是否收藏
          isfav: that.data.isFav,
          // 是否点赞
          ispraise: that.data.isPraise,
          // 点赞数
          agree: that.data.agree
        });
        //  wx.setNavigationBarTitle({
        //      title:  that.data.detailData.name
        //  })
        that.getcontent();
      }
    });
  },

  onShareAppMessage: function (options) {
    var that = this;
    console.log(that.data.feedid)
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: that.data.detailData.title,
      path: '/pages/info_detail/info_detail?feedid=' + that.data.feedid,
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },
  //  点赞功能
  onPraise: function () {
    //点赞
    var that = this;
    console.log('click praise');
    var sourceid = that.data.sourceid;
    var platid = that.data.platid;
    if (that.data.isPraise) {
      // 已点赞
      console.log('already praised');
    } else {
      // 记录点赞
      that.data.isPraise = that.fav.addFav('praise', sourceid, platid);
      console.log('praise success:' + that.data.isPraise);
      that.data.agree++;
      // 同步服务器
      wx.request({
        url: app.apiHost + '/trace/tongji/agree',
        method: "POST",
        data: {
          sourceid: sourceid,
          platid: platid
        },
        header: {
          'content-type': 'application/json',
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          console.log(res)
          var rdata = res.data;
          // 同步点赞数
          that.data.agree = rdata.data;
          wx.showToast({
            title: '点赞成功',
          })
        }
      });
    }
    that.setData({
      ispraise: that.data.isPraise,
      agree: that.data.agree
    });

    // that.wxapi.addFavroite('article', that.data.sourceid, that.data.platid);

    console.log(that.data.isPraise);
  },
  getcontent: function () {
    //渲染回帖列表
    var that = this;

    wx.request({
      url: app.apiHost + '/comment/reply/rlist',
      method: "POST",
      data: {
        sourceid: that.data.sourceid,
        platid: that.data.platid,
        psize: 4,
        lastTime: that.data.lastTime,
        lastReplyId: that.data.lastReplyId,
      },
      header: {
        'content-type': 'application/json',
      },
      complete: function (res) {
      },
      success: function (res) {
        var rdata = res.data;
        var list = that.data.listsData;
        console.log(res.data)
        that.data.contentData = rdata.data;
        that.data.listsData = rdata.data.list;
        // console.log(rdata.data.list.length)
        for (var i = 0; i < rdata.data.list.length; i++) {
          list.push(rdata.data.list[i])
        }
        if (that.data.listsData.length == 4) {
          that.data.isbottom = true;
        } else {
          that.data.isbottom = false;
        }
        that.data.lastTime = rdata.data.pageArgs.lastTime;
        that.data.lastReplyId = rdata.data.pageArgs.lastReplyId;
        that.setData({//逻辑层到视图层
          contentData: that.data.contentData,
          listsData: list,
        });
      }

    })
  },
  // 上拉加载回调接口
  onReachBottom: function () {
    var that = this;
    // 我们用total和count来控制分页，total代表已请求数据的总数，count代表每次请求的个数。
    // 上拉时需把total在原来的基础上加上count，代表从count条后的数据开始请求。
    // that.data.listsData += that.data.listsData;
    // total += count;
    if (that.data.isbottom == true) {
      // console.log("上拉")
      that.getcontent();
    }


  },

  formSubmit: function (e) {
    //评论、回帖
    var that = this;
    // console.log('form发生了submit事件，携带数据为：', e.detail.value.input)
    if (!that.wxapi.validatedMobile()) {
      return false;
    }
    if (e.detail.value.input == '') {
      wx.showToast({
        title: '评论不能为空',
        image: '../images/warning.png'
      })
    } else {
      wx.request({
        url: app.apiHost + '/comment/reply/add',
        method: "POST",
        data: {
          sourceid: that.data.sourceid,
          platid: that.data.platid,
          content: e.detail.value.input,
          fromplatid: 7,
          authorid:that.data.userInfo.id,
          author: that.data.userInfo.nickName,
          avatar: that.data.userInfo.avatarUrl,
          repid: 0,
        },
        header: {
          'content-type': 'application/json',
        },
        complete: function (res) {
          // console.log(res.data)
        },
        success: function (res) {
          var da = that.data.repliesData
          var aa = 1
          console.log(da)
          that.setData({//逻辑层到视图层
            repliesData: da + aa,
            name: '',
            showCollet: false,
            commentShow: true
          });
          that.getcontent();
          wx.showToast({
            title: '评论成功',
          })
        }
      })
    }
  },
  textBind: function (e) {
    // var has_mobile;
    var that = this;

    // 手机号校验
    if (!that.wxapi.validatedMobile()) {
      return false;
    }

    that.setData({
      showCollet: true,
      commentShow: false,
      focus: true
    })
  },
  infoMain: function () {
    var that = this;
    that.setData({
      showCollet: false,
      commentShow: true,
      focus: false
    })
  },
  //  文章收藏与取消

  favArticle: function () {
    var that = this;

    // 手机号校验
    if (!that.wxapi.validatedMobile()) {
      return false;
    }

    // 添加收藏
    if (that.data.isFav) {
      that.fav.remFav('article', that.data.sourceid, that.data.platid);
      that.data.isFav = 0;
    } else {
      that.fav.addFav('article', that.data.sourceid, that.data.platid);
      that.data.isFav = 1;
      wx.showToast({
        title: '收藏成功',
      })
    }
    that.setData({
      isfav: that.data.isFav
    });
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
    that.setData({
      hidden: true
    })
  },
});