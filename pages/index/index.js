// pages/index/index.js
const app=getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		user_id:'',
		list:[],
		src:'../mp3.wav'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that=this;
		this.getOpenId();
		this.getGroupList();
		setInterval(function(){
			//that.getGroupList();
		},1500)
	},
	getOpenId:function(){
		var that = this;
		app.loading('登录中...');
		app.getOpenid(function (ret) {
			wx.hideLoading();
			console.log('用户id',ret.data);
			that.setData({user_id:ret.data.user_id})
			//将userid存储到缓存中
			wx.setStorage({
				key: 'user_id',
				data: ret.data.user_id,
			})
			console.log('登录用户id', ret.data.user_id);
		})
	},
  getGroupList: function () {
    var that = this;
    app.ajax('index/getGroupList', {}, function (res) {
      var data = res.data.list;
      //console.log('群组列表',data);
      that.setData({ list: data });
      wx.setNavigationBarTitle({
        title: data[0].group_name
      });
    }, 'POST')
  },
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		
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
	openChat:function(e){
		var that=this;
		var room=e.currentTarget.dataset.name;
		var title = e.currentTarget.dataset.title;
		//检测用户是否授权头像、昵称
		wx.getSetting({
			success: function (res) {
				if (!res.authSetting['scope.userInfo']) {
					wx.navigateTo({
						url: '../login/login'
					})
					return false;
				}else{
					// 必须是在用户已经授权的情况下调用
					wx.getUserInfo({
						success: function (res) {
							var userInfo = res.userInfo
							var nickName = userInfo.nickName
							var avatarUrl = userInfo.avatarUrl
							var gender = userInfo.gender //性别 0：未知、1：男、2：女
							var province = userInfo.province
							var city = userInfo.city
							var country = userInfo.country
							var language = userInfo.language
							//将用户信息保存起来
							app.ajax('Index/SaveInfo', {
								user_id: that.data.user_id,
								avatar: avatarUrl,
								username: nickName,
								city: city,
								country: country,
								gender: gender,
								language: language,
								province: province
							}, function (ret) {
								if (ret.data.code == 500) {
									console.log('数据写入失败');
								} else {
									console.log('数据更新成功');
								}
							}, 'POST')
						}
					})
					app.ajax('Index/joinGroup',{user_id:that.data.user_id,group_id:room},function(res){console.log(res.data);},'POST')
					wx.navigateTo({
						url: '../chat/chat?room=' + room + "&user_id=" + that.data.user_id + "&title=" + title,
					})
				}
			}
		})
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})