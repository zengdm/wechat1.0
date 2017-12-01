//调用公共js对象以便调用其方法
var app = getApp();//获取应用实例
// console.log(app)//可查看公共js（app.js）的方法
// console.log(app.item)
var state = false;
var loading = false;

var psize = 10; //每页请求的条数
var requestUrl = app.apiHost + "/app/feed/flist";

// 请求数据
var loadMore = function (that) {
  // that.setData({
  //   hidden: false
  // });
  setTimeout(function () {
    loading = false;
  }, 5000);
  if (!loading) {
    loading = true;
    wx.request({
      url: requestUrl,
      data: {
        psize: psize,
        lastTime: that.data.lastTime,
        lastFeedId: that.data.lastFeedId
      },
      method: 'POST',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        loading = false;
        var rList = that.data.listData;
        // console.log(rList);

        var rData = res.data.data;

        if (rData.list.length < psize || !rData.list.length) {
          state = true;
        } else {
          state = false;
        }

        var len = rData.list.length;
        for (var i = 0; i < len; i++) {
          var info = rData.list[i];
          rList.push(info);
          // 流量统计
          if (info['points']) {
            that.data.points[info['feedid']] = info['points'];
          }
        }

        // console.log(that.data.points);

        // console.log(rList);
        that.data.lastTime = rData.pageArgs.lastTime;
        that.data.lastFeedId = rData.pageArgs.lastFeedId;

        that.setData({
          listData: rList,
          points: that.data.points,
        });

      }
    });
  }



};


Page({
  data: {
    autoplay: false,
    swiperCurrent: 0,
    hidden: true,
    listData: [],
    scrollTop: 0,
    scrollHeight: 0,
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    lastTime: '',
    lastFeedId: '',
    // 流量统计计数
    points: {},
  },
  swiperChange: function (e) {
    console.log('swiperChange:' + e.detail.current);
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  scroll: function (e) {
    var that = this;
    // console.log('scroll:-------' + e.detail.scrollTop);
    var scrollTop = e.detail.scrollTop;
    var newsOne = that.data.winHeight * 1.5;
    var newsTwo = that.data.winHeight * 2.5;
    // console.log('winWidthwinWidthwinWidthwinWidthwinWidth----------' + that.data.winWidth);
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
  scrolltolower: function (e) {
    var that = this;
    // loadMore(that);
    if (state == false) { loadMore(that) }
  },

  scrolltoupper: function () {
    console.log("2666+")
  },

  photoClick: function (e) {
    var bannerimg = e.currentTarget.dataset.ext_info
    console.log(bannerimg)
    if (bannerimg) {

      var extInfo = JSON.parse(bannerimg);
      if (extInfo.platid) {
           //资讯详情页
        wx.navigateTo({
          url: '../info_detail/info_detail?platid=' + extInfo.platid + '&sourceid=' + extInfo.sourceid
        })
      } else {
        // console.log(extInfo.navigateTo)
        if (extInfo.navigateTo == "../brand/brand" || extInfo.navigateTo == "../personal/personal") {
          //tabBar页面
          wx.switchTab({
            url: extInfo.navigateTo
          });
        } else {
          //其他子页面
          wx.navigateTo({
            url: extInfo.navigateTo
          })
        }
      }
    }
  },

  itemClick: function (e) {
    var that = this;
    var data = {
      feedid: e.currentTarget.dataset.feedid,
      platid: e.currentTarget.dataset.platid,
      sourceid: e.currentTarget.dataset.sourceid
    };
    console.log("datadatadatadatadatadatadatadatadatadatadatadatadatadatadatadatadata");
    console.log(e);
    // 设置浏览量
    if (that.data.points[data.feedid]) {
      that.data.points[data.feedid]['pv']++;
      that.setData({
        points: that.data.points
      })
    }
    // console.log(data);
    wx.navigateTo({
      url: '../info_detail/info_detail?feedid=' + e.currentTarget.dataset.feedid
    })
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

    loadMore(that);

    wx.request({
      url: app.apiHost + '/app/focus/focuslist?platid=8',
      success: function (res) {
        that.data.focusImg = res.data.data;
        console.log(res.data.data)

        that.setData({//逻辑层到视图层
          focusImg: that.data.focusImg
        });
      },

    });

  },

  // onPageScroll:function(){
  //   console.log('onPageScroll页面滚动');
  // },

  onReachBottom: function () {
    var that = this;

    if (state == false) { loadMore(that) }
    // loadMore(that);
    // console.log('onReachBottom上拉加载')
  },


  onPullDownRefresh: function () {
    // console.log('onPullDownRefresh下拉刷新');
    var that = this;
    this.setData({
      listData: []
    });
    loadMore(that);
  },

  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: '电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！',
      path: '/pages/news/news',
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },



})  