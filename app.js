var url = 'www.xxxxxx.com/';                    ////////////////////服务器域名
App({
  globalData: {
    wmurls: 'https://' + url,
    wmurlwss: 'wss://' + url,
    ROOTHTTP: 'https://' + url + 'home/', //请求地址
    appid: "xxxxxxxxxxxxxxxxxxx",              ////////////////////小程序appid
  },
  onLaunch: function() {

  },
  /**
   * 自定义 封装的ajax函数
   */
  ajax: function(url, datas, sucback, method = 'GET') {
    var that = this;
    datas.appid = that.globalData.appid;
    if (method == 'GET') {
      var header = "application/json";
    } else {
      var header = "application/x-www-form-urlencoded";
    }
    wx.request({
      url: this.globalData.ROOTHTTP + url, //接口地址
      method: method,
      header: {
        'content-type': header
      },
      data: datas,
      success: sucback,
      fail: function() {
        wx.hideLoading();
        //that.toast('网络异常','kulian');
      }
    })
  },
  /**
   * 自定义 封装的上传文件函数
   */
  uploadFile: function(url, filePath, success) {
    wx.uploadFile({
      url: this.globalData.ROOTHTTP + url, //接口地址
      header: {
        'content-type': 'application/json'
      },
      filePath: filePath,
      name: 'file',
      success: success
    })
  },
  /**
   * 自定义 封装的toast提示框
   */
  toast: function(msg, mytype) {
    var image = "";
    if (mytype == 'bad') {
      image = "/images/bad.png"
    }
    if (mytype == 'kulian') {
      image = "/images/kulian.png"
    }
    wx.showToast({
      title: msg,
      icon: 'success',
      image: image,
      duration: 2000
    })
  },
  /**
   * 自定义 封装的alert
   */
  alert: function(msg) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: function(res) {
        if (res.confirm) {
          // console.log('用户点击确定')
        }
      }
    });
  },
  /**
   * 自定义 封装的alert(带回调)
   */
  alertHui: function(msg, success) {
    wx.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: success
    });
  },
  /**
   * 自定义 封装的confirm
   */
  confirm: function(title, msg, success) {
    wx.showModal({
      title: title,
      content: msg,
      confirmText: "确认",
      cancelText: "取消",
      success: success
    });
  },
  /**
   * 自定义 封装的prompt
   */
  prompt: function(title, msg, success) {

    wx.showModal({
      title: title,
      content: msg,
      confirmText: "确认",
      cancelText: "取消",
      success: success
    });
  },
  /**
   * 自定义 封装的登录confirm
   */
  Loginconfirm: function(success) {
    wx.showModal({
      title: '提示',
      content: "完善资料后才能继续操作",
      confirmText: "马上完善",
      cancelText: "我先逛逛",
      success: success
    });
  },
  //封装的获取openid方法
  getOpenid: function(success) {
    var js_code;
    var that = this;
    wx.login({
      success: function(res) {
        if (res.code) {
          js_code = res.code;
          wx.request({
            url: that.globalData.ROOTHTTP + 'index/getOpenid',
            header: {
              'content-type': 'applicatiozn/json'
            },
            data: {
              js_code: js_code,
              appid: that.globalData.appid
            },
            success: success
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function(err) {
        console.log(err);
      },
      complete: function() {}
    })
  },
  /**
   * 自定义封装  加载提示等待模态
   */
  loading: function(msg) {
    wx.showLoading({
      mask: true,
      title: msg
    })
  },
})