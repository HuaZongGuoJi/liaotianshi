// 声明聊天室页面
const app = getApp();
var is_socketOpen = false;
var room_name;
var user_id;
var title;
var page = 1;
Page({

  /**
   * 聊天室使用到的数据，主要是消息集合以及当前输入框的文本
   */
  data: {
    s_top: 9999999,
    messages: [],
    inputContent: '',
    data: [],
    lastMessageId: 'none',
    src: app.globalData.wmurls + '/mp3.wav',
    user_id: '',
  },
  onLoad(options) {
    page = 1;
    is_socketOpen = false;
    room_name = options.room
    user_id = options.user_id;
    this.setData({
      user_id: user_id
    })
    title = options.title;
  },
  linkSocket: function() {
    app.loading('加载中...');
    var that = this;
    wx.connectSocket({
      url: app.globalData.wmurlwss + 'wss',
    })
    wx.onSocketOpen(function() {
      wx.hideLoading();
      is_socketOpen = true;
      console.log('监听WebSocket 连接打开事件');
    })
    wx.onSocketMessage(function(ret) {
      var data = JSON.parse(ret.data);
      if (data.type == 'init') {
        console.log('init', data);
        that.setData({
          data: data
        });
        wx.request({
          url: app.globalData.ROOTHTTP + 'index/bindUid', //接口地址
          method: 'get',
          data: {
            client_id: data.client_id,
            room_name: room_name,
            user_id: user_id
          },
          success: function(res) {
            //that.getChatLog();
          }
        })
      } else if (data.type == 'text') {
        if (data.user_id != user_id) {
          that.audioPay();
        }
        var chatLog = data.chatLog;
        chatLog = that.arrItemSort(chatLog, 'chat_log_id', 0)
        for (var i = 0; i < chatLog.length; i++) {
          if (chatLog[i].user_id == that.data.user_id) {
            chatLog[i].isMe = true;
          }
        }
        //console.log('收到服务端消息', chatLog);
        that.setData({
          messages: chatLog
        });
        that.setData({
          lastMessageId: "msg_" + (chatLog.length - 1)
        })
      } else if (data.type == 'peopleCount') {
        wx.setNavigationBarTitle({
          title: title + "(" + data.count + ")"
        });
        var chatLog = data.chatLog;
        chatLog = that.arrItemSort(chatLog, 'chat_log_id', 0)
        for (var i = 0; i < chatLog.length; i++) {
          if (chatLog[i].user_id == that.data.user_id) {
            chatLog[i].isMe = true;
          }
        }
        //console.log('收到服务端消息', chatLog);
        that.setData({
          messages: chatLog
        });
        that.setData({
          lastMessageId: "msg_" + (chatLog.length - 1)
        })
      }
    })
    wx.onSocketError(function() {
      wx.hideLoading();
      wx.closeSocket({
        code: 1000,
        success: function() {
          is_socketOpen = false
        }
      })
      setTimeout(function() {
        if (is_socketOpen == false) {
          that.linkSocket();
        }
      }, 1000)
      console.log('监听WebSocket 错误事件');
    })
    wx.onSocketClose(function(res) {
      wx.hideLoading();
      console.log('监听WebSocket 连接关闭事件')
    })
  },
  getChatLog: function() {
    var that = this;
    app.ajax('Index/getChatLog', {
      user_id: user_id,
      room_name: room_name,
      page: page
    }, function(res) {
      wx.hideLoading();
      var chatLog = res.data.list;
      if (page == 1) {
        chatLog = that.arrItemSort(chatLog, 'chat_log_id', 0)
        that.setData({
          messages: chatLog
        });
        that.setData({
          lastMessageId: "msg_" + (chatLog.length - 0)
        })
      } else {
        if (chatLog.length > 0) {
          var arr = chatLog.concat(that.data.messages);
          arr = that.arrItemSort(arr, 'chat_log_id', 0)
          that.setData({
            messages: arr,
            s_top: 440,
          })
        }
      }
      console.log('聊天记录', that.data.messages);
    }, 'POST')
  },
  /** 
   * js数组排序 支持数字和字符串
   * @param params
   * @param arrObj   obj     必填  数组对象
   * @param keyName  string  必填  要排序的属性名称
   * @param type     int     选填  默认type:0 正顺  type:1反顺
   */
  arrItemSort: function(arrObj, keyName, type) {
    //这里如果 直接等于arrObj，相当于只是对对象的引用，改变排序会同时影响原有对象的排序，而通过arrObj.slice(0)，
    //表示把对象复制给另一个对象，两者间互不影响 
    var tempArrObj = arrObj.slice(0);
    var compare = function(keyName, type) {
      return function(obj1, obj2) {
        var val1 = obj1[keyName];
        var val2 = obj2[keyName];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1);
          val2 = Number(val2);
        }
        //如果值为空的，放在最后       
        if (val1 == null && val2 == null) {
          return 0;
        } else if (val1 == null && val2 != null) {
          return (type == 1 ? -1 : 1);
        } else if (val2 == null && val1 != null) {
          return (type == 1 ? 1 : -1);
        }
        //排序
        if (val1 < val2) {
          return (type == 1 ? 1 : -1);
        } else if (val1 > val2) {
          return (type == 1 ? -1 : 1);;
        } else {
          return 0;
        }
      }
    }
    return tempArrObj.sort(compare(keyName, type));
  },
  upper: function(e) {
    var that = this;
    page++;
    that.getChatLog();
  },
  audioPay: function() {
    var that = this;
    that.audioCtx = wx.createAudioContext('myAudio')
    that.audioCtx.setSrc(that.data.src)
    that.audioCtx.play()
  },
  /**
   * 页面渲染完成后，启动聊天室
   * */
  onReady() {
    wx.setNavigationBarTitle({
      title: title
    });
  },

  /**
   * 后续后台切换回前台的时候，也要重新启动聊天室
   */
  onShow() {
    if (is_socketOpen == false) {
      this.linkSocket();
    }
  },

  /**
   * 页面卸载时，退出聊天室
   */
  onUnload() {
    var that = this;
    if (is_socketOpen == true) {
      wx.closeSocket({
        code: 100,
        success: function() {
          is_socketOpen = false;
          console.log('关闭成功');
          app.ajax('Index/onClose', {
            group_id: room_name,
            user_id: user_id
          }, function(res) {}, 'POST')

        }
      })
    }
  },

  /**
   * 页面切换到后台运行时，退出聊天室
   */
  onHide() {

  },
  /**
   * 用户输入的内容改变之后
   */
  changeInputContent(e) {
    this.setData({
      inputContent: e.detail.value
    });
  },

  /**
   * 点击「发送」按钮，通过信道推送消息到服务器
   **/
  sendMessage(e) {
    var that = this;
    var inputContent = this.data.inputContent;
    if (inputContent == '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
      })
      return false;
    }
    wx.request({
      url: app.globalData.ROOTHTTP + 'index/onMessage', //接口地址
      data: {
        msg: inputContent,
        user_id: user_id,
        room_name: room_name,
        type:  '1'
      },
      success: function(res) {
        if (res.data.code == 200) {
          that.setData({
            inputContent: ''
          });
        } else {
          wx.showToast({
            title: res.data.msg,
          })
        }
      },
      fail: function(err) {
        console.log(err);
      }
    })
  },
});