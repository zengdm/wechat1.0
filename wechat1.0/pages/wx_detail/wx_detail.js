// pages/wx_detail/wx_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    masterNumber:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var that = this;
    that.data.masterNumber = options.master_number;
    that.data.master_qr = options.master_qr;
    that.data.name = options.name;
    console.log(that.data.name);
    console.log(options.name);
    that.data.summary = options.summary;
    that.data.master_name = options.master_name;
    that.data.cover = options.cover;
    that.setData({//逻辑层到视图层
      wxDetail: options
    });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    

  },

  copy:function(e){
    var that = this;
    console.log(that.data.masterNumber);
    wx.setClipboardData({
      data: that.data.masterNumber,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) // data
             wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  preview:function(){
      var that = this;
      console.log(that.data.master_qr);
      wx.previewImage({
        current: 'that.data.master_qr', // 当前显示图片的http链接
        urls: [that.data.master_qr] // 需要预览的图片http链接列表
      })
  },

  onShareAppMessage: function (options) {
    var that = this;
    console.log('eeeeeeeeeeeeeeee');
    if (options.from === 'button') {
      console.log('按钮转发');
    } else {
      console.log('右上角转发');
    }
    return {
      title: that.data.name+'-电动邦新能源车主微信群',
      path: '/pages/wx_detail / wx_detail ? name = ' + that.data.name + ' & summary=' + that.data.summary + ' & master_name=' + that.data.masterName + '&master_number=' + that.data.masterNumber + '&master_qr=' + that.data.masterQr + '&cover=' + that.data.cover,
    
      success: function (res) {
        console.log('分享成功');
      },
      fail: function (res) {
        console.log('分享失败');
      }
    }
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

})