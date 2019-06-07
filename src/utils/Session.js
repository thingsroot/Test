import http from './Server';
import { message } from 'antd';
import Cookie from 'mobx-cookie'


const LOGIN_COOKIE_NAME = 'csrf_auth_token';
// export function exec_result (id) {
//   let num = 0;
//   let timer;
//   function getResult (){
//     http.get('/api/gateways_exec_result?id=' + id).then(res=>{
//       if (res.data  && res.data.result === true && res.data.message === 'Done'){
//         message.success('执行成功')
//         clearInterval(timer)
//       }
//       if (res.data && res.data.result === false){
//         clearInterval(timer)
//         message.error(res.data.message)
//       }
//     })
//   }
//   timer = setInterval(() => {
//     getResult()
//     if (num === 300){
//       clearInterval(timer);
//       message.error('执行失败，请重试')
//     }
//   }, 1000);
// }
export function _getCookie (name) {
  let cookie = new Cookie(name)
  return cookie.value
}

export function _setCookie (name, value, expire) {
  let cookie = new Cookie(name)
  return cookie.set(value, { expires: expire })
}
export function isAuthenticated () {
  let sid = _getCookie('sid')
  let user_id = _getCookie('user_id')
  if (sid === undefined || sid === 'Guest') {
    return false
  }
  if (user_id === undefined || user_id === 'Guest'){
    return false
  }
  return true
}

export function authenticateClear () {
  let cookie = new Cookie(LOGIN_COOKIE_NAME)
  cookie.remove()
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
  return new Promise((resolve, reject)=>{
          http.get('/api/user_token_read').then(res=>{
              resolve(res)
          }).catch(err=>{
            reject(err)
          })
    })
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
    let timer = setInterval(() => {
      http.get('/api/gateways_exec_result?id=' + id).then(result=>{
        if (result.ok && result.data){
          if (result.data.result){
            message.success('应用配置成功')
            clearInterval(timer)
          } else {
            message.error('应用配置失败')
            clearInterval(timer)
          }
        }
      })
    }, 3000);
  })
}