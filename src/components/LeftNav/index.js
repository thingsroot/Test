import React, { Component } from 'react';
import { Icon, Modal, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import EditSwitch from '../../router/Gateway/Settings/Edit/switch';
import http from '../../utils/Server';
import { GetInfoBySN} from '../../utils/hardwares';
import './style.scss';
// import {IconIOT} from '../../utils/iconfont';
// const IconFont = Icon.createFromIconfontCN({
//     scriptUrl: '//at.alicdn.com/t/font_1163855_v0zrjr2i1em.js'
// })
@withRouter
@inject('store')
@observer
class LeftNav extends Component {
    state = {
        lognum: 0,
        commnum: 0,
        visible: false,
        list: [
            {
                icon: 'gold',
                text: '设备列表',
                href: '/devices'
            }, {
                icon: 'appstore',
                text: '应用列表',
                href: '/apps'
            }, {
                icon: 'setting',
                text: '网关设置',
                href: '/settings'
            }
        ],
        index: 0
    }
    componentDidMount (){
        this.t1 = setInterval(() => {
            this.getNum()
        }, 500);
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('/devices') !== -1) {
            this.setState({
                index: 0
            })
        } else if (pathname.indexOf('/apps') !== -1){
            this.setState({
                index: 1
            });
        } else if (pathname.indexOf('/settings') !== -1){
            this.setState({
                index: 2
            });
        } else if (pathname.indexOf('/vserial') !== -1){
            this.setState({
                index: 3
            });
        } else if (pathname.indexOf('/vnet') !== -1){
            this.setState({
                index: 4
            });
        } else if (pathname.indexOf('/onlinerecords') !== -1){
            this.setState({
                index: 5
            })
        } else if (pathname.indexOf('/logs') !== -1){
            this.setState({
                index: 6
            })
        } else if (pathname.indexOf('/comms') !== -1){
            this.setState({
                index: 7
            })
        } else if (pathname.indexOf('/platformevents') !== -1){
            this.setState({
                index: 8
            })
        } else if (pathname.indexOf('/events') !== -1){
            this.setState({
                index: 9
            })
        } else if (pathname.indexOf('/networkconfig') !== -1) {
            this.setState({
                index: 10
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
    }
    setIndex (key){
        this.setState({
            index: key
        })
    }
    showModal = () => {
        this.setState({
          visible: true
        });
      };
    handleOk = () => {
        this.setState({
            visible: false
        });
    };
    handleCancel = () => {
        this.setState({
            visible: false
        });
    };
    info () {
        Modal.info({
          title: '提示：',
          content: (
            <div>
              <p>该设备暂不支持此项功能！请更换设备后重试！</p>
            </div>
          )
        });
      }
    JudgeState (app) {
        let data = {};
        this.props.store.gatewayInfo.apps.map(item => {
            if (item.name === app && item.status === 'stoped') {
                data = {
                    gateway: this.props.gateway,
                    id: 'gateways/start/' + this.props.gateway + '/1590397188921',
                    inst: item.inst_name
                }
            }
        })
        return data;
    }
    enableVSERIAL (enable) {
        if (enable) {
            const data = this.JudgeState('APP00000377')
            if (JSON.stringify(data) !== '{}') {
                return this.installApp('freeioe_Vserial', 'APP00000377', '开启远程串口功能', data)
            } else {
                return this.installApp('freeioe_Vserial', 'APP00000377', '开启远程串口功能')
            }
        } else {
            return this.removeApp('freeioe_Vserial', '关闭虚拟网络功能')
        }
    }
    enableVNET (enable) {
        if (enable) {
            const data = this.JudgeState('APP00000135')
            if (JSON.stringify(data) !== '{}') {
                return this.installApp('freeioe_Vnet', 'APP00000135', '开启远程编程网络功能', data)
            } else {
                return this.installApp('freeioe_Vnet', 'APP00000135', '开启远程编程网络功能')
            }
        } else {
            return this.removeApp('freeioe_Vnet', '关闭虚拟网络功能')
        }
    }
    enableIOENetwork (enable){
        if (enable) {
            const data = this.JudgeState('APP00000115')
            if (JSON.stringify(data) !== '{}') {
                return this.installApp('net_info', 'APP00000115', '开启虚拟网络功能', data)
            } else {
                return this.installApp('net_info', 'APP00000115', '开启虚拟网络功能')
            }
        } else {
            return this.removeApp('net_info', '关闭虚拟网络功能')
        }
    }
    installApp (inst_name, app_name, title, data){
        return new Promise((resolve, reject) => {
            const { gateway } = this.props;
            if (data) {
                http.post('/api/gateways_applications_start', data).then(res=>{
                    if (res.ok) {
                        this.props.store.action.pushAction(res.data, '应用启动', '', data, 10000, (result)=> {
                            resolve(result, 60000)
                            // this.props.refreshGatewayData();
                        })
                    }
                }).catch(err=>{
                    reject(err)
                    message.error(title + '发送请求失败：' + err)
                })
                return false;
            } else {
                let params = {
                    gateway: gateway,
                    inst: inst_name,
                    app: app_name,
                    version: 'latest',
                    from_web: '1',
                    conf: {
                        auto_start: true,
                        enable_web: true
                    },
                    id: `installapp/${gateway}/${inst_name}/${new Date() * 1}`
                }
                http.post('/api/gateways_applications_install', params).then(res=>{
                    if (res.ok) {
                        message.info(title + '请求成功. 等待网关响应!')
                        this.props.store.action.pushAction(res.data, title, '', params, 30000,  (result)=> {
                            resolve(result, 60000)
                            // this.props.refreshGatewayData();
                        })
                    } else {
                        resolve(false)
                        message.error(res.error)
                    }
                }).catch(err=>{
                    reject(err)
                    message.error(title + '发送请求失败：' + err)
                })
            }
        })
    }
    removeApp (inst_name, title) {
        return new Promise((resolve, reject) => {
            const { gateway } = this.props;
            let params = {
                gateway: gateway,
                inst: inst_name,
                id: `removeapp/${gateway}/${inst_name}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_remove', params).then(res=>{
                if (res.ok) {
                    message.info(title + '请求成功. 等待网关响应!')
                    this.props.store.action.pushAction(res.data, title, '', params, 10000,  (result)=> {
                        resolve(result, 60000)
                        // this.props.refreshGatewayData();
                    })
                } else {
                    resolve(false)
                    message.error(res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + '发送请求失败：' + err)
            })
        })
    }
    getNum (){
        this.setState({
            commnum: this.props.mqtt.comm_channel.NewArrived,
            lognum: this.props.mqtt.log_channel.NewArrived
        })
    }
    render () {
        const { list, index } = this.state;
        const { url } = this.props.match;
        const { gatewayInfo } = this.props.store;
        const { gateway } = this.props.match.params.sn;
        return (
            <div className="leftnav">
                <div className="navlist">
                    <p className="FeaturesGroup">基本功能</p>
                    <ul>
                        {
                            list.map((v, i)=>{
                                return (
                                    <Link to={`${url}${v.href}`}
                                        key={i}
                                        onClick={()=>{
                                            this.setIndex(i)
                                        }}
                                    ><li className={index === i ? 'active' : ''}>
                                    {
                                        v.href.toLowerCase() === '/devices' ? <div className="gatecount count">{gatewayInfo.devices_count}</div> : ''
                                    }
                                    {
                                        v.href.toLowerCase() === '/apps' ? <div className="appcount count">{gatewayInfo.apps_count}</div> : ''
                                    }
                                    <Icon type={v.icon}/>&nbsp;&nbsp;{v.text}</li></Link>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="navlist">
                        <p className="FeaturesGroup">高级功能</p>
                        <ul>
                            <Link
                                to={`${url}/logs`}
                                onClick={()=>{
                                    this.setState({index: 6})
                                }}
                            >
                                <li
                                    className={index === 6 ? 'active' : ''}
                                >{this.state.lognum !== 0 ? <div className="logcount count">{this.state.lognum}</div> : ''}<Icon type="ordered-list"/>&nbsp;&nbsp;网关日志</li>
                            </Link>
                            <Link
                                to={`${url}/comms`}
                                onClick={()=>{
                                    this.setState({index: 7})
                                }}
                            >
                                <li
                                    className={index === 7 ? 'active' : ''}
                                >{this.state.commnum !== 0 ? <div className="logcount count">{this.state.commnum}</div> : ''}<Icon type="bars"/>&nbsp;&nbsp;网关报文</li>
                            </Link>
                            <Link
                                to={`${url}/platformevents`}
                                onClick={()=>{
                                    this.setState({index: 8})
                                }}
                            >
                                <li
                                    className={index === 8 ? 'active' : ''}
                                ><Icon type="bell"/>&nbsp;&nbsp;平台事件</li>
                            </Link>
                            <Link
                                to={`${url}/events`}
                                onClick={()=>{
                                    this.setState({index: 9})
                                }}
                            >
                                <li
                                    className={index === 9 ? 'active' : ''}
                                ><Icon type="notification"/>&nbsp;&nbsp;设备事件</li>
                            </Link>
                            <Link
                                to={`${url}/onlinerecords`}
                                onClick={()=>{
                                    this.setState({index: 5})
                                }}
                            >
                                <li
                                    className={index === 5 ? 'active' : ''}
                                ><Icon type="exception"/>&nbsp;&nbsp;在线记录</li>
                            </Link>
                        </ul>
                </div>
                <div className="navlist">
                    <div className="FeaturesGroup">
                        <p>扩展功能</p>
                        <div className="Groupsetting"
                            onClick={this.showModal}
                        >
                            <Icon type="setting" />
                        </div>
                    </div>
                    <ul>
                        {
                            gatewayInfo.isVserial
                            ? <Link to={`${url}/vserial`}
                                key="5"
                                onClick={()=>{
                                this.setIndex(3)
                                }}
                              >
                                <li
                                    className={index === 3 ? 'active' : ''}
                                ><Icon type="control" />&nbsp;&nbsp;远程编程-串口</li></Link>
                        : ''
                        }
                        {
                            gatewayInfo.isVnet
                            ? <Link to={`${url}/vnet`}
                                key="4"
                                onClick={()=>{
                                    this.setIndex(4)
                                }}
                              >
                              <li className={index === 4 ? 'active' : ''}><Icon type="compass" />&nbsp;&nbsp;远程编程-网络</li></Link>
                            : ''
                        }
                        {
                            gatewayInfo.isNetworkConf
                            ? <Link
                                to={`${url}/networkconfig`}
                                onClick={()=>{
                                    this.setIndex(10)
                                }}
                              >
                                <li
                                    className={index === 10 ? 'active' : ''}
                                ><Icon type="bell"/>&nbsp;&nbsp;网络配置</li>
                            </Link>
                            : ''
                        }
                    </ul>
                </div>
                <Modal
                    title="扩展功能设置"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText="取消"
                    okText="确认"
                >
                    <div className="list">
                        <span>
                            网络配置
                        </span>
                        <EditSwitch
                            checked={gatewayInfo.isNetworkConf}
                            disabled={!gatewayInfo.actionEnable}
                            gateway={gateway}
                            onChange={(checked, onResult)=>{
                                this.enableIOENetwork(checked).then((result) => {
                                    onResult(result)
                                })
                            }}
                        />
                    </div>
                    <div className="list">
                        <span>
                            远程串口编程 [*开启后可使用远程串口编程功能]
                        </span>
                        <EditSwitch
                            checked={gatewayInfo.isVserial}
                            disabled={!gatewayInfo.actionEnable}
                            gateway={gateway}
                            onChange={(checked, onResult)=>{
                                const { sn } = this.props.match.params;
                                if (GetInfoBySN(sn).Disable_extension) {
                                    this.handleCancel()
                                    this.info()
                                    return false;
                                } else {
                                    this.enableVSERIAL(checked).then((result) => {
                                        onResult(result)
                                    })
                                }
                            }}
                        />
                        </div>
                        <div className="list">
                            <span>
                                远程网络编程 [*开启后可使用远程网络编程功能]
                            </span>
                            <EditSwitch
                                checked={gatewayInfo.isVnet}
                                disabled={!gatewayInfo.actionEnable}
                                gateway={gateway}
                                onChange={(checked, onResult)=>{
                                    const { sn } = this.props.match.params;

                                    if (GetInfoBySN(sn).Disable_extension) {
                                        this.handleCancel()
                                        this.info()
                                        return false;
                                    } else {
                                        this.enableVNET(checked).then((result) => {
                                            onResult(result)
                                        })
                                    }
                                }}
                            />
                        </div>
                    </Modal>
            </div>
        );
    }
}
export default LeftNav;