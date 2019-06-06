import {observable, action} from 'mobx'
import Cookie from 'mobx-cookie'
import {isAuthenticated} from '../utils/Session';

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
class AppStore {
  _sid = new Cookie('sid');
  _user_id = new Cookie('user_id');
  @observable isLogin = !!isAuthenticated()  //利用cookie来判断用户是否登录，避免刷新页面后登录状态丢失
  @observable users = []  //模拟用户数据库
  @observable loginUser = {}  //当前登录用户信息
  @observable gateList = []
  @observable status = {}
  @observable config ={}
  @observable devs_len = 0;
  @observable apps_len = 0;
  @observable lognum = 0;
  @observable data = [];
  @observable localstor = [];
  @observable actionSwi = false;
  @observable logflag = false;
  @observable  searchflag = true;
  @observable maxNum = false;
  @observable value = '';
  @observable isleave = false;
  @observable flag = true;
  @observable connected = false;
  @observable searchtype = 'content'
  @observable mqttSN = '';
  @observable scrolltop = 0;
  @observable tire = [];
  @observable instflag = true;
  @observable toggle = true;
  @observable timer = null;
  @observable timeNum = 0;
  @observable arr = [];
  @action setLogFlag (values) {
    this.logflag = values;
  }
  @action setGatelist (values) {
      this.gateList = [...values];
  }
  @action setDevlen (value){
    this.devs_len = value;
  }
  @action setApplen (value){
    this.apps_len = value;
  }
  @action setLogNum (values){
    this.lognum = values;
  }
  @action setStatus (values){
      // this.devs_len = values.devs_len
      // this.apps_len = values.apps_len
      this.status = values;
      if (values.device_status === 'ONLINE'){
        this.actionSwi = false;
      } else {
        this.actionSwi = true;
      }
      // this.config = {...values.config}
  }

  @action toggleLogin (flag, info = {}) {
    this.loginUser = info  //设置登录用户信息

  }
  @action initUsers () {
    const localUsers = localStorage['users'] ? JSON.parse(localStorage['users']) : []
    this.users = [{username: 'admin', password: 'admin'}, ...localUsers]
  }
  @action setData (data){
    this.data = data;
  }
  cleartime (){
    if (this.timer){
      clearInterval(this.timer)
    }
    this.timeNum = 0;
  }
  countdown (){
    this.timeNum = 0;
    this.timer = setInterval(() => {
      this.timeNum++;
      if (this.timeNum >= 300){
        clearInterval(this.timer)
        this.flag = true;
        this.timer = null;
        if (this.client){
          this.client.end()
          this.client = null;
          this.connected = false;
        }
      }
    }, 1000);
  }
  connect (sn){
    this.mqttSN = sn;
    const options = {
    connectTimeout: 4000, // 超时时间
    // 认证信息
    clientId: 'webclient-' + makeid(),
    username: this._user_id.value,
    password: this._sid.value,
    keepAlive: 6000,
    timeout: 3,
    topic: sn + '/log',
    onSuccess: success,
    onFailure: error
  }
    const topic = sn + '/log';
    if (!this.connected){
      this.client = mqtt.connect('ws://ioe.thingsroot.com:8083/mqtt', options)
        this.client.on('connect', ()=>{
            this.flag = false;
            this.connected = true;
            this.client.subscribe(topic, 1)
        })
        this.client.on('message', (topic, message)=>{
                const newmessage = JSON.parse(message.toString());
                const obj = {
                    time: getLocalTime(newmessage[1]),
                    type: newmessage[0],
                    id: newmessage[2].split(']:')[0] + ']',
                    content: newmessage[2].split(']:')[1]
                }
                if (!this.isleave) {
                    if (this.data && this.data.length < 1000){
                      this.arr.push(obj)
                          if (this.value) {
                              const newarr = this.arr.filter(item=>item[this.searchtype].toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
                              this.data = newarr
                          } else {
                              this.data = this.arr;
                              this.newdata = this.arr
                          }
                  } else {
                      this.client.unsubscribe(topic)
                      this.flag = true
                      this.maxNum = true
                      this.arr = [];
                  }
                } else {
                  this.lognum++;
                  this.arr.push(obj)
                }
      })
      } else {
          this.client.subscribe(topic)
          this.arr = [];
          this.flag = false;
      }
    }


}

export default new AppStore()