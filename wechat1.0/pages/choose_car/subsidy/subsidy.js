import xapi from "../../../utils/xapi"
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
    order_type: 5,
    city_id: '',
    pageSize: 10,
    pageOffset: 0,
    //纯
    purePageOffset: 0,
    pureListData: [],
    pureHasMoreData: true,
    //混
    mixPageOffset: 0,
    mixListData: [],
    mixHasMoreData: true, 
    loading: false,
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
    var that = this;
    that.data.city_id = app.city.cityId;
    that.getEndurance(that);
  },


  scroll: function (e) {
    var that = this;
    console.log('scroll:-------' + e.detail.scrollTop);
    var scrollTop = e.detail.scrollTop;
    var newsOne = that.data.winHeight * 1.5;
    var newsTwo = that.data.winHeight * 2.5;
    console.log('winWidthwinWidthwinWidthwinWidthwinWidth----------' + that.data.winWidth);
    var newsWidth = that.data.winWidth * 0.19;


    if (newsOne <= scrollTop && scrollTop <= newsTwo) {
      // console.log('---------------------------------------------showshowshow----------------------------');

      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      that.animation = animation;
      // 332
      animation.translateX(newsWidth).step();
      that.setData({
        animationData: animation.export()
      })
      that.setData({
        showShare: true
      })

    } else {

      var animation = wx.createAnimation({
        duration: 300,
        timingFunction: "linear",
        delay: 0
      });
      that.animation = animation;
      // 332
      animation.translateX(0).step();
      that.setData({
        animationData: animation.export()
      })
      that.setData({
        showShare: false
      })
    }


  },




  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: '新能源车补贴排行-电动邦',
      path: '/pages/choose_car/subsidy/subsidy',
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },

  getEndurance: function (that) {
    wx.showLoading({
      title: '加载中',
    })

    if (!that.data.loading) {

      that.data.loading = true;

    if (that.data.order_type == 5) {
      that.data.pageOffset = that.data.purePageOffset;
    } else {
      that.data.pageOffset = that.data.mixPageOffset;
    }

    console.log(that.data.mixHasMoreData);
    var requestUrl = app.apiHost + "/app/xcx/order-car?city_id=" + that.data.city_id + "&pageOffset=" + that.data.pageOffset + "&pageSize=" + that.data.pageSize + "&order_type=" + that.data.order_type;
    console.log(requestUrl)
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      // var rList = [];

      if (that.data.order_type == 5) {
        var rList = that.data.pureListData;
      } else {
        var rList = that.data.mixListData;
      }

      var rdata = res.data.data;

      for (var i = 0; i < rdata.length; i++) {
        rList.push(rdata[i]);
      }

      console.log(rList);

      if (that.data.order_type == 5) {
        if (rdata.length < that.data.pageSize) {
          that.data.pureHasMoreData = false
        } else {
          that.data.pureHasMoreData = true;
          that.data.purePageOffset = that.data.purePageOffset + that.data.pageSize;
        }
        that.setData({//逻辑层到视图层
          pureListData: rList
        });
      } else {
        if (rdata.length < that.data.pageSize) {
          that.data.mixHasMoreData = false
        } else {
          that.data.mixHasMoreData = true;
          that.data.mixPageOffset = that.data.mixPageOffset + that.data.pageSize;
        }
        that.setData({//逻辑层到视图层
          mixListData: rList
        });
      }

      that.data.loading = false;

    })

    }
    // 设置过期重置
    setTimeout(function () { that.data.loading = false; }, 5000);

    setTimeout(function () {
      wx.hideLoading()
    },500)
  },
  bindChange: function (e) {
    var that = this;

    that.setData({
      currentTab: e.detail.current
    });
  },
  swichNav: function (e) {
    var that = this;

    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
      if (e.target.dataset.current == 0) {
        that.data.order_type = 5
        if (that.data.purePageOffset == 0) {
          that.getEndurance(that);
        }
      }
      if (e.target.dataset.current == 1) {
        that.data.order_type = 6
        if (that.data.mixPageOffset == 0) {
          that.getEndurance(that);
        }
      }
    }

  }, 
  scrolltolower: function () {
    // lower
    var that = this;

    if (that.data.order_type == 5) {
      if (that.data.pureHasMoreData == true) {
        that.getEndurance(that);
      }
    } else {
      if (that.data.mixHasMoreData == true) {
        that.getEndurance(that);
      } 
    }

//     wx.showToast({
//       title: '',
//     })

    console.log('onReachBottom上拉加载---------------' + that.data.pageOffset)

  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../../details/details?pinyin=' + data.pinyin
    })
  }
});
