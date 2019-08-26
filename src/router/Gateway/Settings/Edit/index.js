import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Button, message, Modal, Icon } from 'antd';

import EditSwitch from './switch'
import EditInputNumber from './inputNumber'

import http from '../../../../utils/Server';

@inject('store')
@observer
class GatewaySettingsEdit extends Component {
    installApp (inst_name, app_name, title){
        return new Promise((resolve, reject) => {
            const { gateway } = this.props;
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
                        this.props.refreshGatewayData();
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
                        this.props.refreshGatewayData();
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

    restart (url){
        const { gateway } = this.props;
        const data = {
            id: `gateways/${url}/${gateway}/${new Date() * 1}`,
            name: gateway
        }
        http.post('/api/gateways_' + url, data).then(res=>{
            if (res.ok){
                message.success('重启成功，请稍等...')
                if (url === 'restart') {
                    let no_gap_time = 10000; // 10 seconds
                    setTimeout(()=>{
                        this.props.store.timer.setGateStatusNoGapTime(no_gap_time)
                    }, 5000)
                }
            } else {
                message.error('重启失败，请重试...')
            }
        })
    }

    enableDataUpload (value){
        const { gateway } = this.props;
        return new Promise((resolve, reject) => {
            let params = {
                name: gateway,
                enable: value,
                id: `enable_data/${gateway}/${value}/${new Date() * 1}`
            }
            let title = value === 1 ? '开启数据上送' : '关闭数据上送'
            http.post('/api/gateways_data_enable', params).then(res=>{
                message.success(title + '发送请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title + '失败：' + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + '发送请求失败：' + err)
            })
        })
    }

    enableStatUpload (value){
        const { gateway } = this.props;
        return new Promise((resolve, reject) => {
            let params = {
                name: gateway,
                enable: value,
                id: `enable_stat/${gateway}/${value}/${new Date() * 1}`
            }
            let title = value === 1 ? '开启统计数据上送' : '关闭统计数据上送'
            http.post('/api/gateways_stat_enable', params).then(res=>{
                message.success(title + '发送请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title + '失败：' + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + '发送请求失败：' + err)
            })
        })
    }
    enableBetaWarning (checked) {
        return new Promise((resolve, reject) => {
            if (checked) {
                Modal.confirm({
                    icon: <Icon type="warning"></Icon>,
                    title: '开启开发调试模式会影响设备保修条款',
                    content: '请阅读具体条款',
                    onOk () {
                        resolve(checked)
                    },
                    onCancel () {
                        reject()
                    }
                });
            } else {
                resolve(checked)
            }
        })
    }

    enableBeta (value){
        const { gateway } = this.props;
        return new Promise((resolve, reject) => {
            let params = {
                gateway: gateway,
                beta: value,
                id: `enable_beta/${gateway}/${value}/${new Date() * 1}`
            }
            let title = value === 1 ? '开启开发调试模式' : '关闭开发调试模式'
            http.post('/api/gateways_beta_enable', params).then(res=>{
                message.success(title + '发送请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title + '失败：' + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + '发送请求失败：' + err)
            })
        })
    }

    enableIOENetwork (enable){
        if (enable) {
            return this.installApp('ioe_network', 'network_uci', '开启虚拟网络功能')
        } else {
            return this.removeApp('ioe_network', '关闭虚拟网络功能')
        }
    }

    enableFRPC (enable){
        if (enable) {
            return this.installApp('ioe_frpc', 'frpc', '开启虚拟网络功能')
        } else {
            return this.removeApp('ioe_frpc', '关闭虚拟网络功能')
        }
    }
    enableVSERIAL (enable) {
        if (enable) {
            return this.installApp('freeioe_Vserial', 'APP00000130', '开启远程串口功能')
        } else {
            return this.removeApp('freeioe_Vserial', '关闭虚拟网络功能')
        }
    }
    enableVNET (enable) {
        if (enable) {
            return this.installApp('freeioe_Vnet', 'APP00000135', '开启远程编程网络功能')
        } else {
            return this.removeApp('freeioe_Vnet', '关闭虚拟网络功能')
        }
    }

    onChangeEventUpload = (value) => {
        const { gateway } = this.props;
        return new Promise((resolve, reject) => {
            let params = {
                name: gateway,
                min_level: value,
                id: `enable_event/${gateway}/min${value}/${new Date() * 1}`
            }
            http.post('/api/gateways_enable_event', params).then(res=>{
                message.success('发送更改事件上送等级请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, '更改事件上送等级', '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.success('发送更改事件上送等级请求失败：' + res.error)
                }
            }).catch(err=>{
                message.success('发送更改事件上送等级请求失败：' + err)
                reject(err)
            })
        })
    }

    onChangeSetting = (key, value) => {
        const { gateway } = this.props;
        return new Promise((resolve, reject) => {
            let params = {
                name: gateway,
                data: {
                    [key]: value
                },
                id: `set/${gateway}/${key}/${value}/${new Date() * 1}`
            }
            http.post('/api/gateways_cloud_conf', params).then(res=>{
                message.success('更改设置成功请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, '更改设置', '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.success('更改设置失败:' + res.error)
                }
            }).catch(err=>{
                message.success('更改设置成功请求失败：' + err)
                reject(err)
            })
        })
    }

    render () {
        const { gateway, refreshGatewayData, gatewayInfo, onClose } = this.props;
        refreshGatewayData;
        return (
            <Card
                title="高级设置"
                extra={
                    <Button
                        onClick={onClose}
                    >X</Button>}
                // loading={loading}
                style={{ width: '100%' }}
            >
                <div className="list">
                    <span>
                        调试模式 [*开启后可安装开发版本软件]
                    </span>
                    <EditSwitch
                        checked={gatewayInfo.data && gatewayInfo.data.enable_beta === 1}
                        disabled={!gatewayInfo.actionEnable}
                        gateway={gateway}
                        onChange={(checked, onResult)=>{
                            this.enableBeta(checked === true ? 1 : 0).then((checked) => {
                                onResult(checked)
                            })
                        }}
                        onWarning={(checked, onResult)=>{
                            this.enableBetaWarning(checked).then((result) => {
                                onResult(result)
                            })
                        }}
                    />
                </div>
                <div className="list">
                    <span>
                        数据上传 [*开启后设备数据会传到当前平台]
                    </span>
                    <EditSwitch
                        checked={gatewayInfo.data && gatewayInfo.data.data_upload}
                        disabled={!gatewayInfo.actionEnable}
                        gateway={gateway}
                        onChange={(checked, onResult)=>{
                            this.enableDataUpload(checked === true ? 1 : 0).then((result) => {
                                onResult(result)
                            })
                        }}
                    />
                </div>
                <div className="list">
                    <span>
                        变化数据上送间隔（ms） [*程序会重启]
                    </span>
                    <div style={{position: 'relative'}}>
                        <EditInputNumber
                            value={gatewayInfo.data && gatewayInfo.data.data_upload_period}
                            disabled={!gatewayInfo.actionEnable}
                            gateway={gateway}
                            onChange={(value, onResult)=>{
                                this.onChangeSetting('data_upload_period', value).then((result) => {
                                    onResult(result)
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="list">
                    <span>
                        全量数据上送间隔（s） [*程序会重启]
                    </span>
                    <div style={{position: 'relative'}}>
                        <EditInputNumber
                            value={gatewayInfo.data && gatewayInfo.data.data_upload_cov_ttl}
                            disabled={!gatewayInfo.actionEnable}
                            gateway={gateway}
                            onChange={(value, onResult)=>{
                                this.onChangeSetting('data_upload_cov_ttl', value).then((result) => {
                                    onResult(result)
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="list">
                    <span>
                        事件上传等级 [*事件上传的最低等级]
                    </span>
                    <div style={{position: 'relative'}}>
                        <EditInputNumber
                            value={gatewayInfo.data && gatewayInfo.data.event_upload}
                            disabled={!gatewayInfo.actionEnable}
                            gateway={gateway}
                            onChange={(value, onResult)=>{
                                this.onChangeEventUpload(value).then((result) => {
                                    onResult(result)
                                })
                            }}
                        />
                    </div>
                </div>
                <div className="list">
                    <span>
                        统计上传 [*开启后统计数据传到当前平台]
                    </span>
                    <EditSwitch
                        checked={gatewayInfo.data && gatewayInfo.data.stat_upload}
                        disabled={!gatewayInfo.actionEnable}
                        gateway={gateway}
                        onChange={(checked, onResult)=>{
                            this.enableStatUpload(checked === true ? 1 : 0).then((result) => {
                                onResult(result)
                            })
                        }}
                    />
                </div>
                <div className="list">
                    <span>
                        网络配置
                    </span>
                    <EditSwitch
                        checked={gatewayInfo.ioe_network}
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
                        虚拟网络 [*开启后可建立点对点VPN]
                    </span>
                    <EditSwitch
                        checked={gatewayInfo.ioe_frpc}
                        disabled={!gatewayInfo.actionEnable}
                        gateway={gateway}
                        onChange={(checked, onResult)=>{
                            this.enableFRPC(checked).then((result) => {
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
                            this.enableVSERIAL(checked).then((result) => {
                                onResult(result)
                            })
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
                            this.enableVNET(checked).then((result) => {
                                onResult(result)
                            })
                        }}
                    />
                </div>
                <div className="list">
                    <span>
                        重启FreeIOE [*FreeIOE重启会导致5秒左右的离线]
                    </span>
                    <Button
                        disabled={!gatewayInfo.actionEnable}
                        onClick={()=>{
                            this.restart('restart')
                        }}
                    >程序重启</Button>
                </div>
                <div className="list">
                    <span>
                        重启网关 [*网关重启会导致60秒左右的离线]
                    </span>
                    <Button
                        disabled={!gatewayInfo.actionEnable}
                        onClick={()=>{
                            this.restart('reboot')
                        }}
                    >网关重启</Button>
                </div>
            </Card>
        )
    }
}


export default GatewaySettingsEdit