import {observable, action} from 'mobx'
import {isAuthenticated, _getCookie} from '../utils/Session';
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
  isCloses (_this){
    console.log(_this.props.match.params.sn)
    setTimeout(() => {
        console.log(_this.props.match.params.sn)
    }, 3000);
  }
  connect (sn){
    this.mqttSN = sn;
    const arr = [];
    const options = {
    connectTimeout: 4000, // 超时时间
    // 认证信息
    clientId: 'webclient-' + makeid(),
    username: unescape(_getCookie('user_id')),
    password: unescape(_getCookie('sid')),
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
            this.client.subscribe(topic)
        })
        this.client.on('message', (topic, message)=>{
                if (!this.isleave) {
                    if (this.data && this.data.length < 1000){
                      const newmessage = JSON.parse(message.toString());
                      const obj = {
                          time: getLocalTime(newmessage[1]),
                          type: newmessage[0],
                          id: newmessage[2].split(']:')[0] + ']',
                          content: newmessage[2].split(']:')[1]
                      }
                      arr.push(obj)
                          if (this.value) {
                              const newarr = arr.filter(item=>item[this.searchtype].indexOf(this.value) !== -1);
                              this.data = newarr
                          } else {
                              this.data = arr;
                              this.newdata = arr
                          }
                  } else {
                      this.client.unsubscribe(topic)
                      this.flag = true
                      this.maxNum = true
                  }
                } else {
                  console.log(this.lognum)
                  this.lognum++;
                }
      })
      } else {
          this.client.subscribe(topic)
          this.flag = false;
      }
    }


}

export default new AppStore()