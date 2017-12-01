import xapi from "../../utils/xapi"
var app = getApp();
Page({
  data: {
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 0,
    // currentTabtype: 0,
  },
  onLoad: function () {
    var that = this;
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
    var requestUrl = app.apiHost + "/app/xcx/paihang";
    var that = this;
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      console.log(res);

      var rdata = res.data.data;

      that.data.brandData = rdata;
      that.data.attention = rdata.hot;
      that.data.endurance = rdata.endurance;
      that.data.order = rdata.order;
      that.setData({//逻辑层到视图层
        attention: that.data.attention,
        endurance: that.data.endurance,
        order: that.data.order,
      });
    })
  },

  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  // bindChangetype: function (e) {
  //   var that = this;
  //   that.setData({ currentTabtype: e.detail.current });
  // },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  // swichNavtype: function (e) {
  //   var that = this;
  //   if (this.data.currentTabtype === e.target.dataset.current) {
  //     return false;
  //   }
  //   else {
  //     that.setData({
  //       currentTabtype: e.target.dataset.current
  //     })
  //   }
  // },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../details/details?pinyin=' + data.pinyin
    })
  }
});
