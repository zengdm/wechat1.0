import { wxapi } from "../../plugins/wxapi";

var app = getApp();
Page({
  data: {
    winHeight: '',
    winWidth: '',
    winWidth: 0,
    winHeight: 0,
    peizhiData: {},
    detailpeizhi: {},
    currentTab: 1,
    showmask:0,
    toView: '',
    options:{},
    // 对比车型id
    pzid:0,
    carIds: {},
    carNum:0,
    // 原始数据
    params:{},
    // 过滤数据
    filterData:{},
    // 显示的字段
    fields:{0:{}, 1:{}, 2:{}},
    // 删除的车型索引
    delIndexs:{},
    scroll:{x:1,y:0,left:0, top:0, height:'', style:''},
    screen: {width:0, height:0},
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.wxapi = new wxapi(that);
    // 参数获取
    that.data.options = options;

    if (options.pzid) {
      that.data.pzid = options.pzid;
      var carIds = that.data.pzid.indexOf(',')>=0?that.data.pzid.split(','):new Array(that.data.pzid);
      that.data.carNum = carIds.length;
      // console.log(that.data.carNum)
    } else {
      that.data.pzid = '898,796,1154';
      // that.data.pzid = 898;
      that.data.carNum =2;
    }
    that.setData({
      peizhiData: options,
      // 车型id，多个用英文逗号隔开
      pzid: that.data.pzid,
      // 车型数量
      carNum: that.data.carNum
    });

    
  },
  onReady: function () {
    var that = this;
    // 异步获取配置数据
    that.wxapi.carArgs(that.data.pzid, 'cb_params');
  },

  onShow: function() {
    var that = this;

    wx.getSystemInfo({
      success: function (res) {
        that.data.screen.width = res.windowWidth;
        that.data.screen.height = res.windowHeight;
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    console.log('screen:');
    console.log(that.data.screen);
    // 设置屏幕滚动方向
    that.setScroll(1, 0);
  },

  /**
   * 获取参数回调方法
   */
  cb_params: function(res) {
    var that = this;
    that.data.params = res;
    
    // 默认隐藏空项
    that.filterData();

    that.setData({//逻辑层到视图层
      carParams: res,
      currentTab:1
    });
  },

  // 过滤数据  过滤方式 0:全部参数  1:隐藏空项  2:显示不同
  filterData: function(ptype) {
    var that = this;
    var params = that.data.params;
    var len = params.length;
    console.log(that.data.fields);
    if (len > 0) {
      var first = that.data.params[0];
      for (let k in first){
        var par = first[k];
        if (par.list) {
            // 循环单一配置字段列表
            for (let p in par.list) {
              var field = par.list[p]['field'];
              // 默认字段显示
              if (typeof (that.data.fields[0][k]) == 'undefined') {
                that.data.fields[0][k] = { 'showT': 1 };
                that.data.fields[1][k] = { 'showT': 1 };
                that.data.fields[2][k] = { 'showT': 1 };
              }
              that.data.fields[0][k][field] = 1;
              that.data.fields[1][k][field] = 1;
              that.data.fields[2][k][field] = 1;

              if (field =='optional_info') {
                continue;
              }
              for (let v in par.list[p]) {
                var hasValue = false;
                var isDiff = false;
                var prevalue = '';
                // 所有车型配置对比
                for (var j = 0; j < len; j++) {
                  // 字段值
                  var value = params[j][k]['list'][p][v];
                  
                  // 空值判断
                  if (value != '-' && value != '--' && !hasValue) {
                    hasValue = true;
                  }
                  // 不同值判断
                  if (!prevalue) {
                    prevalue = value;
                  } 
                  if(prevalue!=value && !isDiff) {
                    isDiff = true;
                  }
                  // console.log('empty field=>: k=' + k + '/p=' + p + '/v=' + v + '/j=' + j + '/field=' + field)
                  if (k=='price_info' && !hasValue) {
                    hasValue = true;
                  }
                }  // end for [j]

                // 标注空字段
                if (!hasValue) {
                  that.data.fields[1][k][field] = 0;
                }
                // 标注不同字段
                if (!hasValue) {
                  that.data.fields[2][k][field] = 0;
                } else if (isDiff) {
                  that.data.fields[2][k][field] = 2;
                }
                
              } // end for [v]
            } // end for [p]
        } //end par.list
      } // end for [k]

      // 过滤大项空值，如报价信息、基本参数
      for (let em in that.data.fields) {
        for (let b in that.data.fields[em]) {
          var num = 0;
          for (let n in that.data.fields[em][b]) {
            if (n == 'showT') {
              continue;
            } else if (that.data.fields[em][b][n] == 1) {
              num++;
            }
          }
          if (!num) {
            that.data.fields[em][b]['showT'] = 0;
          }
        }
      }
    }
    
    that.setData({
      fields: that.data.fields
    })

    return that.data.fields;
  },
  
  /**
   * 条件加载列表
   */
  loadParam: function (e) {
    var that = this;
    // 过滤方式 0:全部参数  1:隐藏空项  2:显示不同
    var opt = e.currentTarget.dataset.opt;
    console.log(opt);
    
    that.setData({
      currentTab: opt
    });
  },

  onScroll: function (e) {
    var that = this;
    that.data.scroll.top = e.detail.scrollTop;
    that.data.scroll.left = e.detail.scrollLeft;
    that.data.scroll.height = e.detail.scrollHeight;

    that.setData({
      scrollData:that.data.scroll
    })
  },


  setScroll: function(x, y) {
    var that = this;
    that.data.scroll.x = x?true:false;
    that.data.scroll.y = !x?true:false;
    if (that.data.scroll.y) {
      that.data.scroll.left = 0;
      that.data.scroll.height = 50;
      that.data.scroll.style = 'height:1000rpx';
    } else {
      // that.data.scroll.top = 50;
      // that.data.scroll.height = 'height:' + that.data.scroll.height + 'rpx';
    }
    
    that.setData({
      scrollData: that.data.scroll,
    });
  },


  clickLetter: function (e) {
    var letter = e.currentTarget.dataset.letter;

    var that = this;
    that.setData({
      toView: letter,
    });
    setTimeout(function () {
      that.getclassno();
    }, 1000);
  },

  getcaradd:function(){
    var that = this;
    wx.navigateBack({
      delta: 1
    })
  },
  getdelete: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '友情提示',
      content: '是否取消所选车型对比?',
      success: function (res) {
        if (!res.cancel) {
          that.data.delIndexs[index] = 1;
          that.setData({
            delIndexs:that.data.delIndexs
          })
        }
      }
    });
    console.log("删除----------")
    that.setData({

    });
  },
  getclass: function () {
    var that = this;
    that.setScroll(0, 1);
    that.setData({
      showmask: 1,
    });
  },
  getclassno: function () {
    var that = this;
    that.setData({
      showmask:0,
    });
    that.setScroll(1, 0);
  },
});
