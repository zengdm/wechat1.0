import xapi from "../../utils/xapi"
import { favorite } from "../../plugins/favorite";
import { wxapi } from "../../plugins/wxapi";



var app = getApp();
Page({
  data: {
    // tab切换选中
    currentTab:0,
    // 收藏的车系
    serieIds:[],
    // 收藏的文章
    artIds:[],
    // 列表数据
    res: {article:[], serie:[]},
    // 列表分页条数
    psize: 10,
    // 文章当前分页
    pages: {article:1, serie:1},
    // 列表是否已到尾页
    more: {article: true, serie:true},
    // 是否加载中
    loading: false,
  },
  onLoad: function () {
    var that = this;
    // 收藏信息
    that.fav            = new favorite(that);
    that.data.serieIds  = that.fav.getFav('serie');
    that.data.artIds    = that.fav.getFav('article');
    // 接口类
    that.wxapi = new wxapi(that);
  },
  onReady: function () {
    var that = this;

    // 收藏的车系列表

    // that.wxapi.favList('serie', 1, that.data.psize, 'cb_serie');

    that.wxapi.favList('serie', that.data.pages.serie, that.data.psize, 'cb_List');

    // 收藏的文章列表（延迟加载)
    setTimeout(function(){
      that.wxapi.favList('article', that.data.pages.article, that.data.psize, 'cb_List');
    }, 1000);
    


    // 设置屏幕
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });

  },
  /**
   * 列表回调
   * that.res.data['serie']: 车系列表数据
   * that.res.data['article']: 文章列表数据
   *            
   */
  cb_List: function(res, ftype) {
    var that = this;
    // 重置请求(可再次请求下一页)
    that.data.loading = false;


    // console.log(that.data.res.serie)


    if (res.code==0) {
      // 追加列表数据
      var len = res.data.length;
      for (var i=0; i<len; i++) {
        that.data.res[ftype].push(res.data[i]);
      }
      // 是否尾页
      if (len<that.data.psize) {
        that.data.more[ftype] = false;
      }
      console.log()


      var serielen = that.data.res['serie'].length;
      var articlelen = that.data.res['article'].length;
      if (serielen == 0){
        console.log("555555555555555555555555555555")
      }else{
        that.setData({
          // resData: that.data.res,
          serie: that.data.res.serie,
          morePage: that.data.more,
        })
      }
      if (articlelen == 0) {
        console.log("555555555555555555555555555555")
      } else {
        that.setData({
          // resData: that.data.res,
          article: that.data.res.article,
          morePage: that.data.more,
        })
      }

   


    
    } else {
      // 提示错误消息
    }

    console.log('callback cb_serie--------------------------------------------');
    console.log(res);
  },

  parseSerie: function(data) {
    console.log('callback serielist');
    console.log(data);
  },

  getEndurance: function (that) {
   
    var requestUrl = app.apiHost + "/passport/ark/"+cType;

    console.log(requestUrl)

    xapi.request({
      url: requestUrl,
      method: "POST",
      data: {
        token: that.data.token
      },
      header: {
        'content-type': 'application/json',
      },
    }).then(function (res) {
      console.log("5555555555555555555555");
        console.log(res);


    })
  },

  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {
    var that = this;
    console.log("e.target.dataset.current");
    console.log(e.target.dataset.current);
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    }
    else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }

    if (e.target.dataset.current == 0){
      // 车系
      // that.getEndurance();
    }else{
      // 文章

    }

  },
  gotoSeries: function (e) {
    var data = {
      pinyin: e.currentTarget.dataset.pinyin,
      cxid: e.currentTarget.id,
      cityId:1101
    }
    //跳转到新页面，可返回
    wx.navigateTo({
      url: '../details/details?pinyin=' + data.pinyin
    })
  },

  goNews:function(e){
    console.log(e);
  },

  itemClick: function (e) {
    var that = this;
    console.log(e.currentTarget.dataset.feedid);

  
    var data = {
      feedid: e.currentTarget.dataset.feedid,
      // platid: e.currentTarget.dataset.platid,
      // sourceid: e.currentTarget.dataset.sourceid
    };

    // console.log(that.data.points[data.feedid]);

    // 设置浏览量
    // if (that.data.points[data.feedid]) {
    //   that.data.points[data.feedid]['pv']++;
    //   that.setData({
    //     points: that.data.points
    //   })
    // }
    // console.log(data);
    wx.navigateTo({
      url: '../info_detail/info_detail?feedid=' + data.feedid
    })
  },

  scrollArt: function(e) {
    console.log(e.detail.scrollTop);
  }, 
  /**
   * 加载更多
   */
  loadMore: function(e) {
    var that = this;
    // 加载类型 article:文章  serie:车系
    var ftype = e.currentTarget.dataset.ftype;

    // 是否已到尾页（cb_List方法设置)
    if (!that.data.more[ftype]) {
      return false;
    }

    // 加载更多
    if (!that.data.loading) {
      that.data.loading = true;
      that.data.pages[ftype]++;
      that.wxapi.favList('article', that.data.pages[ftype], that.data.psize, 'cb_'+ftype);

      // 过期重置
      setTimeout(function() {that.data.loading = false}, 5000);
    }
    console.log('load more');
  }
});
