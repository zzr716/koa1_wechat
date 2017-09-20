const sha1 = require('sha1');
const getRawBody = require('raw-body');
const Wechat = require('./wechat');
const util = require('./util')
module.exports = function(opts) {
    var wechat = new Wechat(opts);
    return function *(next) {
        
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        // 传回微信服务器
        var echostr = this.query.echostr;
        console.log(signature, nonce,timestamp,
        echostr);
        var str = [token, timestamp, nonce]
            .sort()
            .join('')
        str = sha1(str)
        // console.log(str, signature)
        if (this.method === 'GET') {
            if( str == signature ) {
                this.body = echostr + '' 
            } else {
                this.body = 'wrong'
            }
        } else if (this.method === 'POST') {
            // 用户发送来的信息POST XML
            // if (sha !== signature) {
            //     this.body = 'wrong'
            //     return false
            // }
            var data = yield getRawBody(this.req, {
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })
            console.log(data.toString())
            // xml是json的前身
            // 微信数据交互使用的是xml xml需要转json 用yield让他停下来转化
            var content = yield util.parseXMLAsync(data)
            console.log(content)
            var msgType = content.xml.MsgType
            var fromUserName = content.xml.FromUserName
            var toUserName = content.xml.ToUserName
            // 要返回内容给微信 微信再把内容交给用户

            // if (message.msgType === event) {
                // if (message.Event === subscribe) {
                    const now = new Date().getTime()
                    this.status = 200
                    this.type = 'application/xml'
                    this.body = `<xml>
                        <ToUserName><![CDATA[${fromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${toUserName}]]></FromUserName>
                        <CreateTime>${now}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[Hi,23]]></Content>
                    </xml>
                    `
                // }
            // }
        }
    }
}