// pages/index/index.js
const app=getApp();
var user_id;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.getStorage({
			key: 'user_id',
			success: function(res) {
				user_id=res.data;
			},
		})
	},
	//授权用户信息
	getUserInfo: function(event) {
        var that = this;
        var result = event.detail;
        if (result.errMsg != 'getUserInfo:ok') {
            app.alert('必须允许获取必要信息');
            return false
        }
        var UserInfo = event.detail.userInfo;
		console.log('用户信息',UserInfo);
        that.setData({
            userInfo: UserInfo,
			authorization:2
        })
        that.SaveUserInfo();
    },
    //保存用户信息
    SaveUserInfo: function() {
        var that = this;
        var userInfo = that.data.userInfo; //获取data中的用户信息
        var headimg = userInfo.avatarUrl;
        var nickname = userInfo.nickName;
		var city = userInfo.city;
		var country = userInfo.country
		var gender = userInfo.gender
		var language = userInfo.language;
		var province = userInfo.province;
        //将用户信息保存起来
        app.ajax('Index/SaveInfo', {
            user_id: user_id,
			avatar: headimg,
            username: nickname,
			city: city,
			country: country,
			gender: gender,
			language: language,
			province: province
        }, function(ret) {
            if (ret.data.code == 500) {
                app.toast('数据写入失败', 'kulian');
            } else {
                app.toast('登录成功');
				setTimeout(function(){
					wx.navigateBack({})
				},1000)
            }
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