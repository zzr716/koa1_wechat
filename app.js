const Koa = require('koa')
const app = new Koa()
const path = require('path')
const util = require('./libs/util.js')
const wechat_file = path.join(__dirname, './config/wechat.txt')
// 加密 password 
// const sha1 = require('sha1')
const wechat = require('./wechat/g.js')
var config = {
    wechat: {
        appID: 'wx9595f778055696ee',
        appSecret: 'dcd181d47d3ba80f7672e5c04b60687a',
        token: 'weixin',
        getAccessToken: function () {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file, data)
        }
    }
}

app.use(wechat(config.wechat))
// web服务器里面中间件是串联形式的，可以停下来，按顺序
// 为了满足这个要求，异步变同步
// 发展史 从promise ->generator->async
// 生成器函数 *
// app.use(function *(next) {
//     // yield 
//     // this相当于上下文环境
//     console.log(this.query)
//     var token = config.wechat.token
//     // signature微信签名 验证请求,来自微信
//     var signature = this.query.signature
//     // nonce随机字符串 
//     var nonce = this.query.nonce
//     var timestamp = this.query.timestamp
//     // 传回微信服务器
//     var echostr = this.query.echostr
//     console.log(signature, nonce, timestamp, echostr)
//     // 按照字典排序
//     var str = [token, timestamp, nonce].sort().join('')
//     console.log(str, signature)
//     str = sha1(str)
//     if (str == signature) {
//         this.body = echostr + ''
//     } else {
//         this.body = 'wrong'
//     }
// })
app.listen(1234)
console.log('Listening: 1234')