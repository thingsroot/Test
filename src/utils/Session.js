import http from './Server';
const LOGIN_COOKIE_NAME = 'T&R_auth_token';

export function _getCookie (name) {
  let start, end
  if (document.cookie.length > 0) {
    start = document.cookie.indexOf(name + '=')
    if (start !== -1) {
      start = start + name.length + 1
      end = document.cookie.indexOf(';', start)
      if (end === -1) {
        end = document.cookie.length
      }
      return unescape(document.cookie.substring(start, end))
    }
  }
  return ''
}

export function _setCookie (name, value, expire) {
  let date = new Date()
  date.setDate(date.getDate() + expire)
  document.cookie =  name + '=' + value + '; path=/' +
    (expire ? ';expires=' + date.toGMTString() : '')
}
export function isAuthenticated () {
  return _getCookie(LOGIN_COOKIE_NAME)
}

export function authenticateSuccess (token) {
  _setCookie(LOGIN_COOKIE_NAME, token)
}
export function getParam (name) {
  //构造一个含有目标参数的正则表达式对象
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
  //匹配目标参数
  var r = window.location.search.substr(1).match(reg);
  //返回参数值
  if (r !== null){
    return unescape(r[2]);
  }
  //不存在时返回null
  return null;
}
export const getUrl = (url)=> {
  console.log(url)
  return url.split('/')[1];
}
export function logout () {
  _setCookie(LOGIN_COOKIE_NAME, '', 0)
}
// 获取token
export function get_NewToken () {
  http.get('/api/method/iot_ui.iot_api.get_token?' + Date.parse(new Date())).then(res=>{
      _setCookie('T&R_auth_token', res.message)
  })
}
// 申请AccessKey
export function apply_AccessKey (){
  const data = http.get('/api/method/iot_ui.iot_api.apply_AccessKey').then(res=>{
    return res.message;
  })
  return data;
}
// 是否公司管理员
export function isAdmin (){
  http.get('/api/method/iot_ui.iot_api.company_admin').then(res=>{
    _setCookie('T&R_isAdmin', res.message.admin)
    if (res.message.admin === true){
        _setCookie('T&R_companies', res.message.companies[0]);
    } else {
        _setCookie('T&R_companies', '');
    }
  })
}
// 拼接网关操作
export function deviceAppOption (appName, option, value, gateSn, type, sn){
  const id = `${type}/${gateSn}/${appName}/autorun/${sn}`;
  http.postToken('/api/method/iot.device_api.app_option', {
      data: {
        inst: appName,
        option: option,
        value: value
      },
      device: gateSn,
      id: id
  }).then(()=>{
    http.postToken('/api/method/iot.device_api.get_action_result?id=' + id).then(res=>{
      return res;
    })
  })
}