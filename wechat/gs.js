const sha1 = require('sha1')
const Promise = require('bluebird')
// const request = Promise.promisify(require('request'))
const request = require('request')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
// url配置项
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
}
function Wechat (opts) {
    var that = this
    this.appID = opts.appID
    this.appSecret = opts.appSecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken
    // 获取令牌环 promise
    this.getAccessToken().then(function(data) {
        try {
            data = JSON.parse(data)
        } catch (e) {
            return that.updateAccessToken()
        }
        // 验证是否合格 7200s
        if (that.isValidAccessToken(data)) {
            Promise.resolve(data)
        } else {
            // 更新一下
            return that.updateAccessToken()
        }
    }).then(function (data) {
        // 一定是有合格的accessToken
        // accessToken将在对象上 对象在内存中 一直可以引用
        that.access_token = data.access_token
        that.expires_in = data.expires_in
        that.saveAccessToken(data)
    })
}
Wechat.prototype.isValidAccessToken = function (data) {
    // 没值
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }
    var access_token = data.access_token
    var expires_in = data.expires_in
    // 时间戳
    var now = (new Date().getTime())
    if (now < expires_in-100) {
        return true
    } else {
        return false
    }
}
Wechat.prototype.updateAccessToken = function () {
    var appID = this.appID
    var appSecret = this.appSecret
    var url = api.accessToken + '&appid=' + '&secret' + appSecret
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, body) {
            // console.log('++++++')
            // console.log(body)
            var data = body
            var now = (new Date().getTime())
            var expires_in = 
                now + (data.expires_in-20)*1000
            data.expires_in = expires_in
            console.log(data)
            resolve(data)
        })
    })
}
module.exports = function (opts) {
    var wechat = new Wechat(opts)
    return function *(next) {
        // yield 
        // this相当于上下文环境
        console.log(this.query)
        var token = opts.token
        // signature微信签名 验证请求,来自微信
        var signature = this.query.signature
        // nonce随机字符串 
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        // 传回微信服务器
        var echostr = this.query.echostr
        console.log(signature, nonce, timestamp, echostr)
        // 按照字典排序
        var str = [token, timestamp, nonce].sort().join('')
        console.log(str, signature)
        str = sha1(str)
        if (str == signature) {
            this.body = echostr + ''
        } else {
            this.body = 'wrong'
        }
    }
}