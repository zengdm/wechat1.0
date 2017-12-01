// pages/service/service.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infoService:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.request({
      url: app.apiHost + '/app/wechat/service',
      method: "GET",
      header: {
        'content-type': 'application/json'
      },
      complete: function (res) {
        // console.log(res.data)
      },
      success: function (res) {
        console.log(res.data.data.service_qr)
        that.data.service_qr = res.data.data.service_qr;

        var rData = res.data.data;
        that.data.infoService = rData;
       

        that.setData({//逻辑层到视图层
          infoService:that.data.infoService
        });

      }
    })
  },

  preview: function () {
    var that = this;
    wx.previewImage({
      current: 'that.data.service_qr', // 当前显示图片的http链接
      urls: [that.data.service_qr] // 需要预览的图片http链接列表
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: '电动邦微信客服',
      path: '/pages/service/service',
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  }
})