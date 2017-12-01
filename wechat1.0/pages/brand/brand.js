import drawer from '../../pages/drawer/drawer.js'
import xapi from "../../utils/xapi"
import util from "../../utils/util"
import { wxapi } from "../../plugins/wxapi";

var app = getApp();
Page({
  data: {
    brandData: {},
    toView: '',
    winHeight: '',
    winWidth: '',
    latitude: 0,
    longitude: 0,
    pixelRatio: '',
    brandList: [],
    bannerTab: 1,
    hidden: true,
    fromcache: false,
    city: getApp().city,

    cityIdData: '',
    cityIdName: '',
    // 字母表显示状态
    wordline: false,

  },
  tapName: function (event) {
    console.log(event)
  },
  onLoad: function (options) {
    var that = this;

    var res = wx.getSystemInfoSync();
    that.setData({
      winHeight: res.windowHeight,
      winWidth: res.windowWidth,
      pixelRatio: res.pixelRatio,
      scrollYFlag: true,
      city: that.data.city,
    });

    //抽屉组件
    that.dw = new drawer(that);
    that.ul = new util(that);
    that.wxapi = new wxapi(that);
    that.wxapi.wxlogin();

    // console.log('global data');
    // console.log(getApp().globalData);
    // if (!getApp().globalData.userInfo) {
    //   console.log('init login');
    //   that.wxapi.wxlogin();
    // }

    //获取当前经纬度信息
    /*
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        // console.log(res)
        that.data.latitude = res.latitude;
        that.data.longitude = res.longitude;
        //调用后台API，获取地址信息
        wx.request({
          url: app.apiHost + '/app/xcx/lng-lat/?location=' + that.data.latitude + ',' + that.data.longitude,
          success: function (res) {
            // console.log(res.data.data)
            var data = res.data.data;
            // that.data.locationData = res.data;
            that.data.cityIdData = data.cityid;
            that.data.cityIdName = data.city;
          },

        });


      },

    })
    // console.log(that.data.cityIdData)
    if (that.data.cityIdData == '') {
      //如果没有获取位置权限默认北京
      that.data.cityIdData = "1101";
      that.data.cityIdName = "北京"
    }
    wx.setStorage({
      key: 'city',
      data: {
        cityId: that.data.cityIdData,
        cityName: that.data.cityIdName
      }
    })
     */
  },
  onReady: function () {
    var requestUrl = app.apiHost + "/app/xcx/hot-list";
    var that = this;

    xapi.request({
      url: requestUrl,
      data: {},
      method: 'GET' // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    }).then(function (res) {
      // console.log(res);

      var rdata = res.data;
      // console.log(rdata);

      that.data.brandData = rdata.data;
      var myList = rdata.data.list;
      // console.log(myList);

      that.data.brandList = that.reCombine(myList);
      // console.log(that.data.brandData)
      // console.log(that.data.brandList)

      that.setData({//逻辑层到视图层
        brandData: that.data.brandData,
        brandList: that.data.brandList,
        num: 1 + parseInt(Math.random() * 5)
      });
      // console.log(brandList)
    })

  },

  getsubsidy: function () {
    wx.navigateTo({
      url: '../choose_car/subsidy/subsidy'
    })
  },
  getendurance: function () {
    wx.navigateTo({
      url: '../choose_car/endurance/endurance'
    })
  },
  getnew_car: function () {
    wx.navigateTo({
      url: '../choose_car/new_car/new_car'
    })
  },
  getcoming_soon: function () {
    wx.navigateTo({
      url: '../choose_car/coming_soon/coming_soon'
    })
  },
  getchoose: function () {
    wx.navigateTo({
      url: '../choose/choose'
    })
  },

  reCombine: function (arr) {
    var res = [], obj = {}, index = 0;
    arr.forEach(function (item) {
      // console.log(item.letter)
      if (obj.hasOwnProperty(item.letter)) {
        res[obj[item.letter]].items.push(item);
      }
      else {
        obj[item.letter] = index++;//记录索引 0 1 2
        res.push(
          {
            flag: item.letter,
            items: [item]
          }
        );
      }
    });
    return res;
  },
  clickLetter: function (event) {
    var letter = event.target.dataset.letter;
    var that = this;
    console.log(that.data.currentLetter);

    if (that.data.currentLetter === event.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentLetter: event.target.dataset.current
      })
    }


    that.setData({
      toView: letter
    })
  },


  scroll: function (e) {
    var that = this;
    console.log('scroll:-------' + that.data.winHeight + '/' + e.detail.scrollTop + '=' + that.data.wordline);
    var scrollTop = e.detail.scrollTop;
    var winHeight = that.data.winHeight;
    var newsOne = winHeight * 1.5;
    var newsTwo = that.data.winHeight * 2.5;
    console.log('winWidthwinWidthwinWidthwinWidthwinWidth----------' + that.data.winWidth);
    var newsWidth = that.data.winWidth * 0.19;

    var pscreen = parseInt(e.detail.scrollTop / newsOne) % 2;
    console.log('pscreean:' + pscreen);
    // if (scrollTop > newsOne && pscreen == 1)
    if (newsOne <= scrollTop && scrollTop <= newsTwo) {
      
      // console.log('---------------------------------------------showshowshow----------------------------');
      that.data.wordline = true;
      that.showWords(newsWidth);
    } else {
      that.data.wordline = false;
      that.showWords(newsWidth);
    }

    that.setData({
      wordlineshow: that.data.wordline,
      scrollTop: scrollTop
    })

  },

  // 显示/隐藏分享
  showWords: function (newsWidth) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    that.animation = animation;
    if (!that.data.wordline) {
      // 332
      animation.translateX(0).step();
    } else {
      animation.translateX(newsWidth).step();
    }

    that.setData({
      animationShare: animation.export(),
      showShare: that.data.wordline
    })

  },

  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: '电动邦，带您一起了解新能源汽车、用好新能源车、玩好新能源汽车！',
      path: '/pages/brand/brand',
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },



  backdraw: function (res) {
    // 隐藏loading弹层
    // if (wx.hideLoading) {
    //     wx.hideLoading();
    // }
    console.log(res);

    // 设置模板数据
    this.setData({
      drawerSeriesData: res.list || res.data.list,
    });
  },

  showDrawer: function (e) {
    var that = this;

    var ppid = e.currentTarget.dataset.id;
    // 2. 请求数据，同时将页面绘制方法作为参数
    var data = { 'ppid': e.currentTarget.dataset.id };
    that.wxapi.serieByBrandId(data.ppid, 'cb_serie');


    that.dw.requestdata({
      "pbid": ppid,

    }, !1);
    // var path = '/app/xcx/chexi/';
    // that.getCacheData(path, 'backdraw', data);



  },

  cb_serie: function (res) {
    console.log(res.list);
    this.setData({
      drawerSeriesData: res.list || res.data.list,
      showDrawerFlag: true
    });
  },

  gotoSeries: function (e) {

    var that = this;
    
    setTimeout(function () {
      that.hideDrawer();
    }, 1000)
   

    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
      cityId: that.data.cityIdData,
      cityIdName: that.data.cityIdName
    }
    // console.log(that.data)
    // console.log(data.cityId)
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../details/details?pinyin=' + data.pinyin + '&cityId=' + data.cityId + '&cityIdName=' + data.cityIdName
    })
  }
});
