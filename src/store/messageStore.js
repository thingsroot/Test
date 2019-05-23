import {observable, action} from 'mobx'
import {_getCookie} from '../utils/Session';
import mqtt from 'mqtt';
function getLocalTime (nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString();
}
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
}

function error (){
    console.log('error')
}
class messageStore {
  @observable commnum = 0;
  @observable data = [];
  @observable messagedata = [];
  @observable localstor = [];
  @observable  searchflag = true;
  @observable maxNum = false;
  @observable value = '';
  @observable isleave = false;
  @observable messageisleave = false;
  @observable flag = true;
  @observable messageflag = true;
  @observable connected = false;
  @observable searchtype = 'content'
  @observable mqttSN = '';
  @observable scrolltop = 0;
  @observable tire = [];
  @observable instflag = true;
  @observable toggle = true;
  @observable arr = [];
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
    console.log(out)
    return out;
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
    console.log(str)
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

  @action setData (data){
    this.data = data;
  }
  connect (sn, type){
    this.mqttSN = sn;
    const options = {
    connectTimeout: 4000, // 超时时间
    // 认证信息
    clientId: 'webclient-' + makeid(),
    username: unescape(_getCookie('user_id')),
    password: unescape(_getCookie('sid')),
    keepAlive: 6000,
    timeout: 3,
    topic: sn + type,
    onSuccess: success,
    onFailure: error
  }
    const topic = sn + type;
    if (!this.connected){
      this.client = mqtt.connect('ws://ioe.thingsroot.com:8083/mqtt', options)
        this.client.on('connect', ()=>{
            if (type === '/log'){
              this.flag = false;
            } else {
              this.messageflag = false;
            }
            this.connected = true;
            this.client.subscribe(topic, 1)
            console.log(topic)
        })
        this.client.on('message', (topic, message)=>{
                const newmessage = JSON.parse(message.toString());
                // if (type === '/log'){
                //   const obj = {
                //     time: getLocalTime(newmessage[1]),
                //     type: newmessage[0],
                //     id: newmessage[2].split(']:')[0] + ']',
                //     content: newmessage[2].split(']:')[1]
                //   }
                //   if (!this.isleave) {
                //       if (this.data && this.data.length < 1000){
                //         this.arr.push(obj)
                //             if (this.value) {
                //                 const newarr = this.arr.filter(item=>item[this.searchtype].toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
                //                 this.data = newarr
                //             } else {
                //                 this.data = this.arr;
                //                 this.newdata = this.arr
                //             }
                //     } else {
                //         this.client.unsubscribe(topic)
                //         this.flag = true
                //         this.maxNum = true
                //         this.arr = [];
                //     }
                //   } else {
                //     this.lognum++;
                //     this.arr.push(obj)
                //   }
                // } else {
                //   console.log(newmessage)
                  const obj = {
                    time: getLocalTime(newmessage[1]),
                    direction: newmessage[0].split('/')[1],
                    id: newmessage[0].split('/')[0],
                    content: this.CharToHex(this.base64decode(newmessage[2]))
                  }
                  if (!this.messageisleave) {
                    if (this.messagedata && this.messagedata.length < 1000){
                      this.arr.push(obj)
                          if (this.value) {
                              const newarr = this.arr.filter(item=>item[this.searchtype].toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
                              this.messagedata = newarr
                          } else {
                              this.messagedata = this.arr;
                              this.messagenewdata = this.arr
                          }
                  } else {
                      this.client.unsubscribe(topic)
                      this.flag = true
                      this.maxNum = true
                      this.arr = [];
                  }
                } else {
                  this.commnum++;
                  this.messagedata.push(obj)
                }
                  this.messagedata.push(obj)
                // }
      })
      } else {
          this.client.subscribe(topic)
          this.arr = [];
          this.flag = false;
      }
    }


}

export default new messageStore()