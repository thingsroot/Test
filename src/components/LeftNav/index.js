import React, { Component } from 'react';
import { Icon, Modal, message, Tooltip } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import EditSwitch from '../../router/Gateway/Settings/Edit/switch';
import http from '../../utils/Server';
import { GetInfoBySN} from '../../utils/hardwares';
import './style.scss';
import intl from 'react-intl-universal'
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
                text: intl.get('gateway.The_equipment_list'),
                href: '/devices'
            }, {
                icon: 'appstore',
                text: intl.get('gateway.The_application_list'),
                href: '/apps'
            }, {
                icon: 'setting',
                text: intl.get('gateway.The_gateway_is_set'),
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
          title: intl.get('common.prompt') + '：',
          content: (
            <div>
              <p>{intl.get('gateway.Please_try_again_after_changing_the_equipment')}</p>
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
                return this.installApp('freeioe_Vserial', 'APP00000377', intl.get('devece_list.Enable_remote_serial_port_function'), data)
            } else {
                return this.installApp('freeioe_Vserial', 'APP00000377', intl.get('devece_list.Enable_remote_serial_port_function'))
            }
        } else {
            return this.removeApp('freeioe_Vserial', intl.get('devece_list.Turn_off_remote_serial_port_function'))
        }
    }
    enableVNET (enable) {
        if (enable) {
            const data = this.JudgeState('APP00000135')
            if (JSON.stringify(data) !== '{}') {
                return this.installApp('freeioe_Vnet', 'APP00000135', intl.get('devece_list.Enable_remote_programming_network_function'), data)
            } else {
                return this.installApp('freeioe_Vnet', 'APP00000135', intl.get('devece_list.Enable_remote_programming_network_function'))
            }
        } else {
            return this.removeApp('freeioe_Vnet', intl.get('devece_list.Turn_off_remote_programming_network_functionality'))
        }
    }
    enableIOENetwork (enable){
        if (enable) {
            const data = this.JudgeState('APP00000115')
            if (JSON.stringify(data) !== '{}') {
                return this.installApp('net_info', 'APP00000115', intl.get('devece_list.Enable_virtual_network_function'), data)
            } else {
                return this.installApp('net_info', 'APP00000115', intl.get('devece_list.Enable_virtual_network_function'))
            }
        } else {
            return this.removeApp('net_info', intl.get('devece_list.Turn_off_the_virtual_network_function'))
        }
    }
    installApp (inst_name, app_name, title, data){
        return new Promise((resolve, reject) => {
            const { gateway } = this.props;
            if (data) {
                http.post('/api/gateways_applications_start', data).then(res=>{
                    if (res.ok) {
                        this.props.store.action.pushAction(res.data, intl.get('gateway.app_star'), '', data, 10000, (result)=> {
                            resolve(result, 60000)
                            // this.props.refreshGatewayData();
                        })
                    }
                }).catch(err=>{
                    reject(err)
                    message.error(title + intl.get('gateway.send_request_failed') + err)
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
                        message.info(title + intl.get('gateway.request_succeeded') + intl.get('gateway.wait_for_gateway_response') + '!')
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
                    message.error(title + intl.get('gateway.send_request_failed') + err)
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
                    message.info(title + intl.get('gateway.send_request_successfully') + '. ' + intl.get('gateway.wait_for_gateway_response') + '!')
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
                message.error(title + intl.get('gateway.request_send_failed') + '：' + err)
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
        <p className="FeaturesGroup">{intl.get('gateway.The_basic_function')}</p>
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
                        <p className="FeaturesGroup">{intl.get('gateway.Advanced_features')}</p>
                        <ul>
                            <Link
                                to={`${url}/logs`}
                                onClick={()=>{
                                    this.setState({index: 6})
                                }}
                            >
                                <li
                                    className={index === 6 ? 'active' : ''}
                                >{this.state.lognum !== 0 ? <div className="logcount count">{this.state.lognum}</div> : ''}<Icon type="ordered-list"/>&nbsp;&nbsp;{intl.get('gateway.The_gateway_log')}</li>
                            </Link>
                            <Link
                                to={`${url}/comms`}
                                onClick={()=>{
                                    this.setState({index: 7})
                                }}
                            >
                                <li
                                    className={index === 7 ? 'active' : ''}
                                >{this.state.commnum !== 0 ? <div className="logcount count">{this.state.commnum}</div> : ''}<Icon type="bars"/>&nbsp;&nbsp;{intl.get('gateway.The_gateway_message')}</li>
                            </Link>
                            <Link
                                to={`${url}/platformevents`}
                                onClick={()=>{
                                    this.setState({index: 8})
                                }}
                            >
                                <li
                                    className={index === 8 ? 'active' : ''}
                                ><Icon type="bell"/>&nbsp;&nbsp;{intl.get('gateway.Platform_event')}</li>
                            </Link>
                            <Link
                                to={`${url}/events`}
                                onClick={()=>{
                                    this.setState({index: 9})
                                }}
                            >
                                <li
                                    className={index === 9 ? 'active' : ''}
                                ><Icon type="notification"/>&nbsp;&nbsp;{intl.get('gateway.Equipment_time')}</li>
                            </Link>
                            <Link
                                to={`${url}/onlinerecords`}
                                onClick={()=>{
                                    this.setState({index: 5})
                                }}
                            >
                                <li
                                    className={index === 5 ? 'active' : ''}
                                ><Icon type="exception"/>&nbsp;&nbsp;{intl.get('gateway.The_online_record')}</li>
                            </Link>
                        </ul>
                </div>
                <div className="navlist">
                    <div className="FeaturesGroup">
                        <p>
                            <Tooltip title={intl.get('gateway.Extend_the_functionality')}>
                                <span>{intl.get('gateway.abbreviations_Extend_the_functionality')}</span>
                            </Tooltip>
                        </p>
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
                                >
                                    <Icon type="control" />
                                    &nbsp;&nbsp;
                                    {/* {intl.get('gateway.Remote_programming-serial_port')} */}
                                    <span>
                                        <Tooltip title={intl.get('gateway.Remote_programming-serial_port')}>
                                            <span>{intl.get('gateway.abbreviations_Remote_programming-serial_port')}</span>
                                        </Tooltip>
                                    </span>
                                </li>
                              </Link>
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
                              <li className={index === 4 ? 'active' : ''}>
                                    <Icon type="compass" />
                                    &nbsp;&nbsp;
                                    {/* {intl.get('gateway.Remote_programming-network')} */}
                                    <span>
                                        <Tooltip title={intl.get('gateway.Remote_programming-network')}>
                                            <span>{intl.get('gateway.abbreviations_Remote_programming-network')}</span>
                                        </Tooltip>
                                    </span>
                                </li>
                              </Link>
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
                                ><Icon type="bell"/>
                                &nbsp;&nbsp;
                                {/* {intl.get('gateway.The_network_configuration')} */}
                                <span>
                                    <Tooltip title={intl.get('gateway.The_network_configuration')}>
                                        <span>{intl.get('gateway.abbreviations_The_network_configuration')}</span>
                                    </Tooltip>
                                </span>
                                </li>
                            </Link>
                            : ''
                        }
                    </ul>
                </div>
                <Modal
                    title={intl.get('gateway.Extended_function_Settings')}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    cancelText={intl.get('common.cancel')}
                    okText={intl.get('common.confirm')}
                >
                    <div className="list">
                        <span>
                        {intl.get('gateway.The_network_configuration')}
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
                            {intl.get('gateway.Remote_serial_programming')} [*{intl.get('gateway.Remote_serial_programming_desc')}]
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
                            {intl.get('gateway.Remote_network_programming')} [*{intl.get('gateway.Remote_network_programming_desc')}]
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