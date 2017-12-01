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
    order_type: 1,
    city_id: '',
    pageOffset: 0,
    pageSize: 10,
    listData: [],
    hasMoreData: true,
    // currentTabtype: 0,
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
      title: '新能源车新车上市-电动邦',
      path: '/pages/choose_car/new_car/new_car',
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
    var requestUrl = app.apiHost + "/app/xcx/order-car?city_id=" + that.data.city_id + "&pageOffset=" + that.data.pageOffset + "&pageSize=" + that.data.pageSize + "&order_type=" + that.data.order_type;
    // console.log(requestUrl)
    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      var rList = that.data.listData;

      var rdata = res.data.data;

      if (rdata.length < that.data.pageSize) {
        that.data.hasMoreData = false
      } else {
        console.log(that.data.pageOffset);
        that.data.hasMoreData = true;
        that.data.pageOffset = that.data.pageOffset + that.data.pageSize;
        console.log(that.data.pageOffset);
      }

      for (var i = 0; i < rdata.length; i++) {
        rList.push(rdata[i]);
      }

      console.log(rList);



      that.setData({//逻辑层到视图层
        listData: rList
      });

      that.data.loading = false
    })

    }

    // 设置过期重置
    setTimeout(function () { that.data.loading = false; }, 5000);

    setTimeout(function () {
      wx.hideLoading()
    }, 500)

  },

  scrolltolower: function () {
    var that = this;
    console.log('11111111111111111++++++++++++++++++++')

    if (that.data.hasMoreData) {
      that.getEndurance(that);
    } else {
      console.log('nononononoononono')
      wx.showToast({
        title: '没有更多数据了',
      })
    }

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