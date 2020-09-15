import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Card, Button, message, Modal, Icon } from 'antd';

import EditSwitch from './switch'
import EditInputNumber from './inputNumber'

import http from '../../../../utils/Server';
import intl from 'react-intl-universal';

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
                    message.info(title + `${intl.get('gateway.request_succeeded')} ${intl.get('gateway.wait_for_gateway_response')}!`)
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
                message.error(title + `${intl.get('gateway.send_request_failed')}: ` + err)
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
                    message.info(title + `${intl.get('gateway.request_succeeded')} ${intl.get('gateway.wait_for_gateway_response')}`)
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
                message.error(title + `${intl.get('gateway.send_request_failed')}: ` + err)
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
                message.success(intl.get('gateway.restart_successful'))
                if (url === 'restart') {
                    let no_gap_time = 10000; // 10 seconds
                    setTimeout(()=>{
                        this.props.store.timer.setGateStatusNoGapTime(no_gap_time)
                    }, 5000)
                }
            } else {
                message.error(intl.get('gateway.restart_failed'))
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
            let title = value === 1 ? intl.get('gateway.enable_data_upload') : intl.get('gateway.turn_off_data_upload')
            http.post('/api/gateways_data_enable', params).then(res=>{
                message.success(title + intl.get('gateway.send_request_successfully'))
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title + `${intl.get('common.error')}: ` + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + `${intl.get('gateway.send_request_failed')}: ` + err)
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
            let title = value === 1 ? intl.get('gateway.enable_statistics_upload') : intl.get('gateway.turn_off_statistics_upload')
            http.post('/api/gateways_stat_enable', params).then(res=>{
                message.success(title + intl.get('gateway.send_request_successfully'))
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title +  `${intl.get('common.error')}: ` + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title + `${intl.get('gateway.send_request_failed')}: ` + err)
            })
        })
    }
    enableBetaWarning (checked) {
        return new Promise((resolve, reject) => {
            if (checked) {
                Modal.confirm({
                    icon: <Icon type="warning"></Icon>,
                    title: intl.get('gateway.opening_the_development'),
                    content: intl.get('gateway.please_read_the_specific_terms'),
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
            let title = value === 1 ? intl.get('gateway.open_development_and_debugging_mode') : intl.get('gateway.turn_off_development_debugging_mode')
            http.post('/api/gateways_beta_enable', params).then(res=>{
                message.success(title + intl.get('gateway.send_request_successfully'))
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, title, '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.error(title + `${intl.get('common.error')}: ` + res.error)
                }
            }).catch(err=>{
                reject(err)
                message.error(title +  `${intl.get('gateway.send_request_failed')}: ` + err)
            })
        })
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
                message.success(intl.get('gateway.send_change_event_send_level_request_succeeded'))
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, intl.get('gateway.change_event_escalation_level'), '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.success(`${intl.get('gateway.failed_to_send_change_event_level_up_request')}: ` + res.error)
                }
            }).catch(err=>{
                message.success(`${intl.get('gateway.failed_to_send_change_event_level_up_request')}: ` + err)
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
                message.success(intl.get('gateway.change_settings_successful_request_succeeded'))
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, intl.get('gateway.change_setting'), '', params, 5000, (result) => {
                        resolve(result, 60000)
                        this.props.store.timer.setGateStatusNoGapTime(10000)
                    })
                } else {
                    resolve(false)
                    message.success(`${intl.get('gateway.failed_to_change_settings')}: ` + res.error)
                }
            }).catch(err=>{
                message.success(`${intl.get('gateway.change_settings_successful_request_failed')}: ` + err)
                reject(err)
            })
        })
    }

    render () {
        const { gateway, refreshGatewayData, gatewayInfo, onClose } = this.props;
        refreshGatewayData;
        return (
            <Card
                title={intl.get('gateway.advanced_setting')}
                extra={
                    <Button
                        onClick={onClose}
                    >X</Button>}
                style={{ width: '100%' }}
            >
                <div className="list">
                    <span>
                        {intl.get('gateway.debug_mode')} {intl.get('gateway.development_version_software_can_be_installed_after_opening')}
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
                        {intl.get('gateway.data_upload')} {intl.get('gateway.after_opening')}
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
                        {intl.get('gateway.statistical_upload')} {intl.get('gateway.after_opening_the_statistical')}
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
                        {intl.get('gateway.change_data_delivery_interval')}（ms） {intl.get('gateway.the_program_will_restart')}
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
                        {intl.get('gateway.full_data_delivery_interval')}（s） {intl.get('gateway.the_program_will_restart')}
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
                        {intl.get('gateway.event_upload_level')} {intl.get('gateway.minimum_level_of_event_upload')}
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
                        {intl.get('gateway.restart_FreeIOE')} {intl.get('gateway.restart_will_cause_about_5_seconds_offline')}
                    </span>
                    <Button
                        disabled={!gatewayInfo.actionEnable}
                        onClick={()=>{
                            this.restart('restart')
                        }}
                    >{intl.get('gateway.program_reset')}</Button>
                </div>
                <div className="list">
                    <span>
                        {intl.get('gateway.restart_gateway')} {intl.get('gateway.gateway_restart_will_lead_to_about_60_seconds_offline')}
                    </span>
                    <Button
                        disabled={!gatewayInfo.actionEnable}
                        onClick={()=>{
                            this.restart('reboot')
                        }}
                    >{intl.get('gateway.gateway_restart')}</Button>
                </div>
            </Card>
        )
    }
}


export default GatewaySettingsEdit