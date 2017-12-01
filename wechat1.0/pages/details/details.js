import { favorite } from "../../plugins/favorite";
import { login } from '../../plugins/login';
import { wxapi } from '../../plugins/wxapi';

var app = getApp();

Page({
  data: {
    cxid: 0,
    pinyin: '',
    city: getApp().city,
    colortab: 2,
    detailData: {},
    cityIdData: '',
    locationData: {},
    carsData: {},
    chexingList: [],
    carList: [],
    deg: 0,
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    // tab切换 
    currentTab: 0,
    myData: {},
    // 车型对比数量
    contrast: 0,
    isaddshop: false,
    iscontrast: false,
    countnumber: 0,
    hiddenlodding: true,

    //绑定手机号
    verifyCodeTime: '验证',
    buttonDisable: '',
    hidden: true,
    phoneBorder: false,
    codeBorder: false,
    error: false,
    // 收藏相关
    fav: { 
        // 收藏的车型列表
        carList: [],
        // 收藏的车型数量
        carNum: 0,  
        //对比的车型id数据,以车型id作为下标,值[0|1]确认选中状态
        carIds:{},
        // 选中的车型列表 
        selCars:[],
        // 车系是否被收藏
        serie:false
      },
    // 定时任务
    interval: {obj:'', num:0},
    // selCars:[],
    // selCarNum:0,

    //对比弹层
    comparison: false
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    // 参数获取
    that.data.pinyin = options.pinyin?options.pinyin:'qin';
    // 统一接口类
    that.wxapi = new wxapi(that);
    // 用户授权
    that.wxapi.wxlogin();


    console.log(that.data.city);
    // 收藏对象
    that.fav = new favorite(that);
    //that.fav.cars = that.fav.getFav('car');
    // that.data.fav.carNum = that.fav.cars.length;
    // that.fav.carIds = {};
    // 收藏的车系
    that.fav.serieIds = that.fav.getFav('serie');
    
    that.login = new login(that);
    console.log(that.data.city);
    that.setData({
      myData: options,
      city: that.data.city,
    });

    // 获取地理位置
    that.wxapi.getLocation();
    
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });

      }
    });
  },


  onReady: function () {
    var that = this;
    // that.setData({
    //   hiddenlodding: false
    // });
    var pinyin = that.data.myData.pinyin;
    var cityId = that.data.city.cityId;

    wx.request({
      url: app.apiHost + '/app/xcx/detail/?pinyin=' + that.data.pinyin + '&city_id=' + cityId + '&rand' + Math.random(),
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        var rdata = res.data;
        that.data.detailData = rdata.data;
        that.data.carsData = rdata.data.cars;
        that.data.picpinyin = rdata.data.chexi_pinyin;
        that.data.cxid = rdata.data.cxid;


        // 车系收藏判断
        that.data.fav.serie = 0;
        if (that.fav.serieIds.length>0) {
          var serieIds = ','+that.fav.serieIds.join(',');
          if (serieIds.toString().indexOf(','+that.data.cxid+'_0')>=0) {
            that.data.fav.serie = 1;
          }
        }
        
        // 车型收藏
        that.favCarList();
        
        // 车系收藏
        that.favSerieList();

        that.setData({//逻辑层到视图层
          detailData: that.data.detailData,
          carsData: that.data.carsData,
          carDatalen: that.data.carsData.length,
          city: that.data.city,
          picpinyin: that.data.picpinyin,
          cxid: that.data.cxid,
        });
        
        // 设置收藏统一变量
        that.setTipsData();
        
        wx.setNavigationBarTitle({
          title: that.data.detailData.name
        });
      }
    })

    // that.setData({
    //   hiddenlodding: true
    // });
    setTimeout(function () {
      wx.hideLoading()
    }, 800)
  },
  onShow:function(){
    var that = this;
    that.wxapi.getLocation();
  },
  onShareAppMessage: function (options) {
    var that = this;
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: that.data.detailData.name+'-电动邦',
      path: '/pages/details/details?pinyin=' + that.data.pinyin,
      imageUrl: that.data.detailData.focus,
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },


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
  getitemtwo: function (e) {
    var that = this;
    that.setData({
      swipercurrentt:1
    })
  },
  getitemone: function (e) {
    var that = this;
    that.setData({
      swipercurrentt:0
    })
  },
  bindChange:function(e){
    var that = this;
    that.setData({
      currentTab: e.detail.current
    })
  },

  /**
   * 车系收藏列表
   */
  favSerieList: function() {
    var that = this;
    if (that.data.cxid) {
      that.wxapi.favList('serie', 1, 50, 'cb_favSerieList');
    }
  },

  // 车系收藏回调方法
  cb_favSerieList: function(res, opt) {
    var that = this;
    if (res.code==0) {
      var len = res.data.length;
      for (var i=0;i<len;i++) {
        if (res.data[i]['cxid'] == that.data.cxid) {
          that.data.fav.serie = true;
        }
      }
      that.setTipsData();
    }
  },
  

  /**
   * 添加车系收藏
   */
  favSerie: function () {
    var that = this;
    // 手机号校验
    var validated = that.wxapi.validatedMobile();
    if (!validated) {
      return validated;
    }

    wx.showToast({
      title: '收藏成功',
      icon: 'success',
      duration: 2000
    })

    // 添加收藏
    that.data.fav.serie = that.fav.addFav('serie', that.data.cxid, 0);
    
    that.setTipsData();
    
  },

  /**
   * 删除车系收藏
   * 
   */
  remFavSerie: function () {
    // 取消收藏
    var that = this;
    // 手机号校验
    var validated = that.wxapi.validatedMobile();
    if (!validated) {
      return validated;
    }
    
    // 删除收藏
    that.delfav = that.fav.remFav('serie', that.data.cxid, 0);
    that.data.fav.serie = false;

    // 统一设置弹窗模板变量
    that.setTipsData();
  },


  //判断手机号是否绑定-------begin
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

  /**
   * 车型对比相关方法
   *
   * @param that.data.fav相关参数
   *        that.data.fav:{
   *              carNum:0,     // 对比车型数量
   *              selCars:{},   // 车型选中状态
   *              selCarNum:0,  // 选中的车型数量
   *              carIds:{},    // 对比车型ID数组
   *              serie:false   // 车系是否被收藏
   *            },
   * 
   */

  // 设置弹窗统一模板变量
  setTipsData: function() {
    var that = this;

    // 对比车型数量
    that.data.fav.carNum = that.data.fav.carList.length;
    // 车型选中状态，车型id做为下标，值[1=收藏,2=选中]
    that.data.fav.carIds = {};
    if (that.data.fav.carNum) {
      var selCarIds = ',' + that.data.fav.selCars.join(',') + ',';
      for (var i = 0; i < that.data.fav.carNum; i++) {
        var pzid = that.data.fav.carList[i]['pzid'];
        that.data.fav.carIds[pzid] = selCarIds.indexOf(',' + pzid + ',') >= 0 ? 2 : 1;
      }
    }
    

    that.setData({
      tipsData: that.data.fav
    })
  },

  // 1. 添加车型对比
  addCar: function (e) {
    var that = this;
    // 当前对比车型ID
    that.duibi = {
      pzid: e.currentTarget.dataset.pzid,
    };

    // 处理过程提示
    wx.showLoading({
      title: '处理中...',
    });

    // 是否已添加对比
    var isfav = that.fav.isFav('car', that.duibi.pzid, 0);

    if (isfav) {
      // 取消对比
      that.fav.remFav('car', that.duibi.pzid, 0, 'cb_optCar');
    } else {
      // 添加对比
      that.fav.addFav('car', that.duibi.pzid, 0, 'cb_optCar');
    }
  },
  
  // 添加/移除车型对比 [回调方法]
  cb_optCar: function(res, opt){
    var that = this;
    // 隐藏loading弹窗
    wx.hideLoading();

    // 消息提醒
    wx.showToast({
      title: opt=='add'?'添加成功':'已取消',
    });
    
    that.favCarList();
  },

  /**
   * 1.1 车型对比弹窗
   * 
   */
  carTips: function () {
    var that = this;

    // 手机号校验
    // var validated = that.wxapi.validatedMobile();
    // if (!validated) {
    //   return validated;
    // }


    // 请求对比车型列表
    that.favCarList();

    // 弹窗动画效果
    var detailWidth = that.data.winWidth * 0.8;
    console.log('detailWidthdetailWidthdetailWidthdetailWidth---'+detailWidth)
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    that.animation = animation;
    // 332
    animation.translateX(-detailWidth).step();

    that.setData({
      animationData: animation.export(),
      comparison: true
    })
  },



  /**
   * 加载收藏车型列表
   */
  favCarList: function () {
    var that = this;
    // 重置数据
    that.data.fav.carList = [];
    that.data.fav.carNum = 0;
    that.data.fav.carIds = {};
    that.data.fav.selCars = [];
    // 重新加载
    that.fav.favList('car', 1, 50, 'cb_carTips');
  },

  /**
   * 1.1.1 车型对比弹窗回调
   */
  cb_carTips: function(res) {
    var that = this;
    if (res.code==0) {
      // 对比车型列表
      that.data.fav.carList = res.data;
      
      that.setTipsData();
    } else {
      // 接口异常提示
    }
    
  },

  /**
   * 2. 监听车型列表复选框
   */
  selCars: function (e) {
    var that = this;
    that.data.fav.selCars = e.detail.value;
    
    that.setTipsData();
  },

  // 2.1 删除车型数据
  remCars: function (e) {
    var that = this;
    var selLen = that.data.fav.selCars.length;

    if (selLen > 0) {
      wx.showModal({
        title: '友情提示',
        content: '是否删除所选对比车型',
        success: function (res) {
          if (res.confirm) {
            // 处理过程提示
            wx.showLoading({
              title: '处理中...',
            });

            that.data.interval.num = 0;
            for (var i = 0; i < selLen; i++) {
              var carId = that.data.fav.selCars[i];
              that.fav.remFav('car', carId, 0, 'cb_remCars');
            }

            // 重新加载列表
            that.data.interval.obj = setInterval(function () {
              if (that.data.interval.num>=selLen) {
                clearInterval(that.data.interval.obj);
                that.data.interval.obj = '';
                that.data.interval.num = 0;
                // 隐藏loading弹窗
                wx.hideLoading();

                // 提示消息
                wx.showToast({
                  title: '删除成功',
                });

                // 重新加载车型列表
                that.favCarList();
              }
            }, 100);

            // 超时处理
            setTimeout(function(){
              // 隐藏loading弹窗
              wx.hideLoading();
            }, 10000);
          }
          
        }
      });
    }

  },

  // 2.1.1 删除车型回调方法
  cb_remCars: function(res, opt) {
    var that = this;
    that.data.interval.num++;
    // 收藏的车型数量变更
    if (that.data.fav.carNum > 0) {
      that.data.fav.carNum--;
    }
  },

  // 2.2 关闭弹窗
  cancel:function(){
    var that = this;
    var detailWidth = that.data.winWidth * 0.8;
    console.log('detailWidthdetailWidthdetailWidthdetailWidth---------'+detailWidth)

    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: "linear",
      delay: 0
    });
    that.animation = animation;
    // 332
    animation.translateX(detailWidth).step();
    that.setData({
      animationData: animation.export()
    })


    that.setData({
      comparison: false
    });
  },

  city: function (e) {
    var that = this;
    var data = that.data.myData;
    var cityId = that.data.cityIdData;
    wx.navigateTo({
      url: '../city/city?pinyin=' + data.pinyin,
    })
  },
  picShow: function (opp) {
    var that = this;
    console.log(that.data.cxid);
    wx.navigateTo({
      url: '../atlas/atlas?piccxid=' + that.data.cxid,
    })
  },

  cartypeShow: function (e) {
    var that = this;
    var data = {
      pzid: e.currentTarget.dataset.pzid,
    }
    wx.navigateTo({
      url: '../atlas/atlas?pzid=' + data.pzid,
    })
  },


  goParam: function (e) {
    var that = this;
    if (that.data.fav.selCars.length>0) {
      wx.navigateTo({
        url: '../parameter/parameter?pzid=' + that.data.fav.selCars.join(','),
      })
    } else {

    }
  },


  parameters: function (e) {
    var that = this;
    console.log(e);
    var pzid = e.currentTarget.dataset.pzid;
    if (pzid > 0) {
      wx.navigateTo({
        url: '../parameter/parameter?pzid=' + pzid,
      })
    } else {

    }
  }
});