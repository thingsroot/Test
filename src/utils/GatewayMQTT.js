import {observable, action} from 'mobx'
import Cookie from 'mobx-cookie'
import mqtt from 'mqtt';
import {message} from 'antd'
import { getLocalTime } from './time'


function makeid () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 8; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function success (){
    console.log('success')
    message.success('连接服务器成功')
}

function error (){
    console.log('error')
    message.success('连接服务器失败')
}

const newMessageChannel = (topic) => {
    var item = observable({
        // observable 属性:
        topic: topic,
        data: [],
        allData: [],
        filter: undefined,
        searchType: 'all',
        isShow: true,
        newArrive: 0,
        active: false,

        // 动作:
        setTopic (value) {
            this.topic = value;
        },
        pushData (value) {
            console.log(value)
            this.allData.push(value)
            if (this.filter === undefined) {
                this.data.push(value)
            } else {
                if (this.isDataApplyToFilter(value)) {
                    this.data.push(value)
                }
            }
            if (!this.isShow) {
                this.newArrive = this.newArrive + 1
            }
        },
        clearData () {
            this.data.clear()
            this.allData.clear()
            this.newArrive = 0
        },
        isDataApplyToFilter (item) {
            if (this.filter) {
                let text = this.filter.toLowerCase()
                if (this.searchType !== 'all') {
                    return item[this.searchType] && item[this.searchType].toLowerCase().indexOf(text) !== -1;
                }
                return (item.id && item.id.toLowerCase().indexOf(text) !== -1) ||
                    (item.content && item.content.toLowerCase().indexOf(text) !== -1) ||
                    (item.direction && item.direction.toLowerCase().indexOf(text) !== -1) ||
                    (item.level && item.level.toLowerCase().indexOf(text) !== -1) ||
                    (item.inst && item.inst.toLowerCase().indexOf(text) !== -1)
            } else {
                return true
            }
        },
        applyFilter () {
            if (this.filter) {
                let text = this.filter.toLowerCase()
                if (this.searchType !== 'all') {
                    this.data = this.allData.filter(item=> item[this.searchType] &&
                        item[this.searchType].toLowerCase().indexOf(text) !== -1);
                } else {
                    this.data = this.allData.filter(item=> (item.id && item.id.toLowerCase().indexOf(text) !== -1) ||
                        (item.content && item.content.toLowerCase().indexOf(text) !== -1) ||
                        (item.direction && item.direction.toLowerCase().indexOf(text) !== -1) ||
                        (item.level && item.level.toLowerCase().indexOf(text) !== -1) ||
                        (item.inst && item.inst.toLowerCase().indexOf(text) !== -1)
                    );
                }
            } else {
                this.data = this.AllData
            }
        },
        setFilter (value) {
            this.filter = value
            this.applyFilter()
        },
        clearFilter () {
            this.filter = undefined
            this.data = this.allData
        },
        setSearchType (value) {
            this.searchType = value
            this.applyFilter()
        },
        setShow (value) {
            this.isShow = value
            if (this.isShow) {
                this.newArrive = 0
            }
        },
        setActive (value) {
            this.active = value
        },

        get Data () {
            return this.data
        },
        get AllData () {
            return this.allData
        },
        get Filter () {
            return this.filter
        },
        get SearchType () {
            return this.searchType
        },
        get NewArrived ()  {
            return this.newArrive
        },
        get Active () {
            return this.active
        },
        get Size () {
            return this.allData.length
        }
    }, {
        setTopic: action,
        pushData: action,
        clearData: action,
        setFilter: action,
        clearFilter: action,
        setShow: action,
        setActive: action
    });
    return item;
}

const log_content_regex = new RegExp(/^\[(\w+)\]:\s+::(\w+)::\s+(.+)$/);
const log_content_regex_2 = new RegExp(/^\[(\w+)\]:\s+(.+)$/);


class GatewayMQTT {
    _sid = new Cookie('sid');
    _user_id = new Cookie('user_id');
    @observable timer = null;
    @observable die_time = 0;
    @observable localstor = [];
    @observable max_count = 5000;
    @observable flag = true;
    @observable connected = false;
    @observable gateway = '';
    @observable comm_channel = newMessageChannel('/comm');
    @observable log_channel = newMessageChannel('/log');

    CharToHex (str) {
        var out, i, len, c, h;

        out = '';
        len = str.length;
        i = 0;
        while (i < len){
            c = str.charCodeAt(i++);
            h = c.toString(16);
            if (h.length < 2){
              h = '0' + h;
            }
            out += h + ' ';
            /*                out += "\\x" + h + " ";
                            if(i > 0 && i % 8 == 0)
                                out += "\r\n";*/
        }
        return out.toUpperCase();
    }
    base64DecodeChars = new Array(
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
      52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
      -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
      -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
      41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    base64decode (str) {
        var c1, c2, c3, c4;
        var i, len, out;

        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            /* c1 */
            do {
                c1 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 === -1);
            if (c1 === -1){
                break;
            }

            /* c2 */
            do {
                c2 = this.base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 === -1);
            if (c2 === -1){
                break;
            }

            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            /* c3 */
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 === 61){
                    return out;
                }
                c3 = this.base64DecodeChars[c3];
            } while (i < len && c3 === -1);
            if (c3 === -1){
                break;
            }

            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

            /* c4 */
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 === 61){
                    return out;
                }
                c4 = this.base64DecodeChars[c4];
            } while (i < len && c4 === -1);
            if (c4 === -1){
                break;
            }
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }

    // Keep the connection for a time (in seconds)
    tick (time) {
        this.die_time = time + 10;
        // let's say post?
    }

    startTimer (){
        this.timer = setInterval(() => {
            this.die_time = this.die_time - 1
            if (this.die_time <= 0){
                this.disconnect()
            }
        }, 1000);
    }
    stopTimer () {
        if (this.timer !== null) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    onReceiveCommMsg = (msg) => {
        if (this.comm_channel.Size >= this.max_count) {
            if (this.comm_channel.active) {
                message.error(`报文数量超过${this.max_count}条，订阅停止!!`)
                this.unsubscribe('/comm')
                this.comm_channel.setActive(false)
            }
        }
        const obj = {
            time: getLocalTime(msg[1]),
            direction: msg[0].split('/')[1],
            id: msg[0].split('/')[0],
            content: this.base64decode(msg[2])
        }
        this.comm_channel.pushData(obj)
    }
    onReceiveLogMsg = (msg) => {
        if (this.log_channel.Size >= this.max_count) {
            if (this.log_channel.active) {
                message.error(`日志数量超过${this.max_count}条，订阅停止!!`)
                this.unsubscribe('/log')
                this.log_channel.setActive(false)
            }
        }

        const groups = log_content_regex.exec(msg[2])
        if (groups) {
            const obj = {
                time: getLocalTime(msg[1]),
                level: msg[0].toUpperCase(),
                id: groups[1],
                inst: groups[2],
                content: groups[3]
            }
            this.log_channel.pushData(obj)
        } else {
            const groups = log_content_regex_2.exec(msg[2])
            if (groups) {
                const obj = {
                    time: getLocalTime(msg[1]),
                    level: msg[0].toUpperCase(),
                    id: groups[1],
                    inst: 'N/A',
                    content: groups[2]
                }
                this.log_channel.pushData(obj)
            }
        }
        // const obj = {
        //     time: getLocalTime(msg[1]),
        //     level: msg[0].toUpperCase(),
        //     id: msg[2].split(']:')[0] + ']',
        //     content: msg[2].split(']:')[1]
        // }
        // this.log_channel.pushData(obj)
    }
    unsubscribe (topic) {
        const topic_real = this.gateway + topic;
        if (this.client && this.connected) {
            this.client.unsubscribe(topic_real)
        }
        if (topic === '/log') {
            this.log_channel.setActive(false)
        }
        if (topic === '/comm') {
            this.comm_channel.setActive(false)
        }
    }
    disconnect (clear_data) {
        this.stopTimer()
        this.gateway = ''
        this.die_time = 0
        if (this.client){
            this.client.end()
            this.client = null;
            this.connected = false;
            this.log_channel.setActive(false)
            this.comm_channel.setActive(false)
        }
        if (clear_data) {
            this.log_channel.clearData()
            this.comm_channel.clearData()
        }
    }
    connect (sn, topic){
        this.gateway = sn;
        this.die_time = 120; // 120 seconds
        const options = {
            connectTimeout: 4000, // 超时时间
            // 认证信息
            clientId: 'webclient-' + makeid(),
            username: this._user_id.value,
            password: this._sid.value,
            keepAlive: 6000,
            timeout: 3,
            onSuccess: success,
            onFailure: error
        }
        const topic_real = sn + topic;
        if (this.client && this.connected) {
            this.client.subscribe(topic_real, 1)
            if (topic === '/log') {
                this.log_channel.setActive(true)
            }
            if (topic === '/comm') {
                this.comm_channel.setActive(true)
            }
            return
        }

        this.client = mqtt.connect('wss://cloud.thingsroot.com/ws', options)
        this.client.on('connect', ()=>{
            message.success('连接服务器成功')
            this.connected = true
            this.client.subscribe(topic_real, 1)
            if (topic === '/log') {
                this.log_channel.setActive(true)
            }
            if (topic === '/comm') {
                this.comm_channel.setActive(true)
            }
            this.startTimer()
        })

        this.client.on('message', (msg_topic, msg)=>{
            //console.log(topic, message)
            if (msg_topic === this.gateway + '/comm') {
                const data = JSON.parse(msg.toString());
                this.onReceiveCommMsg(data)
            }
            if (msg_topic === this.gateway + '/log') {
                const data = JSON.parse(msg.toString());
                this.onReceiveLogMsg(data)
            }
        })
    }
}

export default GatewayMQTT