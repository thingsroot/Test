import {observable, action} from 'mobx'
import {isAuthenticated} from '../utils/Session';
const defaultGateStatusGap = 5000

class Timer {
  @observable isLogin = !!isAuthenticated()  //利用cookie来判断用户是否登录，避免刷新页面后登录状态丢失
  @observable gateStatusGap = defaultGateStatusGap
  @observable gateStatusLast = 0
  @observable gateStatusNoGapTime = 0
  @action setGateStatusGap (value) {
    this.gateStatusGap = value;
  }
  @action setGateStatusLast (value) {
    this.gateStatusLast = value;
  }
  @action setGateStatusNoGapTime (value) {
    this.gateStatusNoGapTime = new Date().getTime() + value;
  }
}

export default new Timer()