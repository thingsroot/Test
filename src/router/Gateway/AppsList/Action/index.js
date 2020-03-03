import React, { Component } from 'react';
import { Button, Switch, Popconfirm, message, Modal, Input, Icon } from 'antd';
import http from '../../../../utils/Server';
import { withRouter, Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import GatesAppsUpgrade from '../Upgrade';
import intl from 'react-intl-universal';

let timer;
function cancel () {
    message.error('You have canceled the update');
  }
@withRouter
@inject('store')
@observer
class Action extends Component {
    state = {
        visible: false,
        upgradeLoading: false,
        setName: false,
        setNameConfirmLoading: false,
        appdebug: false,
        running_action: false
    }
    componentWillUnmount (){
        clearInterval(this.t1);
        clearInterval(timer)
    }
    confirm = (record, sn)=>{
        if (this.props.store.gatewayInfo.actionEnable) {
            const data = {
                gateway: sn,
                inst: record.inst_name,
                id: `app_remove/${sn}/${record.inst_name}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_remove', data).then(res=>{
                if (res.data){
                    if (res.ok){
                        let title = intl.get('gateway.unloading_application') + data.inst + intl.get('gateway.request_succeeded!')
                        message.info(title + `${intl.get('gateway.wait_for_gateway_response')}!`)
                        this.props.store.action.pushAction(res.data, title, '', data, 10000,  ()=> {
                        this.props.update_app_list();
                        })
                    } else {
                        message.error(intl.get('gateway.unloading_application') + data.inst + intl.get('gateway.request_succeeded!'))
                    }
                }
            })
        }
    }
    handleCancel = () => {
        this.setState({
            visible: false,
            running_action: false
        });
    };
    showModal = (type) => {
        this.setState({
            [type]: true,
            running_action: true
        });
    }
    setAutoDisabled (record, props){
        const { sn } = this.props.match.params;
        let type = props ? 1 : 0;
        const data = {
            gateway: sn,
            inst: record.inst_name,
            option: 'auto',
            value: type,
            id: `option/${sn}/${record.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_option', data).then(res=>{
            if (res.ok){
                let title = (props ? intl.get('gateway.turn_on_the_application_and_start_it_automatically') : intl.get('gateway.disable_the_application_from_starting')) + intl.get('gateway.request_succeeded');
                message.info(title + intl.get('gateway.wait_for_gateway_response'))
                let info = {
                    gateway: sn,
                    inst: record.inst_name,
                    value: type
                }
                this.props.store.action.pushAction(res.data, title, '', info, 10000,  ()=> {
                    this.props.update_app_list();
                })
            } else {
                let title = (props ? intl.get('gateway.turn_on_the_application_and_start_it_automatically') : intl.get('gateway.disable_the_application_from_starting')) + intl.get('gateway.request_was_aborted');
                message.error(title)
            }
        })
    }
    handleOk = () => {
        const {record} = this.props;
        this.setState({
            visible: true,
            running_action: true
        });
        const data = {
            gateway: this.props.match.params.sn,
            app: record.name,
            inst: record.inst_name,
            version: record.latestVersion,
            id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_upgrade', data).then(res=>{
            if (res.ok) {
                this.props.store.action.pushAction(res.data, intl.get('gateway.application_upgrade'), '', data, 10000,  ()=> {
                    this.props.update_app_list();
                })
            } else {
                message.error(res.error)
            }
            this.setState({ running_action: false });
        }).catch(req=>{
            req;
            this.setState({ running_action: false });
            message.error(intl.get('gateway.send_request_failed'))
        })
        setTimeout(() => {
            this.setState({ upgradeLoading: false, visible: false});
        }, 3000);
    }
    appSwitch = (type) =>{
        this.setState({ running_action: true });
        let action = '';
        if (type === 'stop'){
            action = intl.get('gateway.close')
        } else if (type === 'start'){
            action = intl.get('gateway.open')
        } else {
            action = intl.get('gateway.restart')
        }
        const data = type === 'stop' || type === 'restart' ? {
            gateway: this.props.match.params.sn,
            inst: this.props.record.inst_name,
            reason: 'reason',
            id: `gateways/${type}/${this.props.match.params.sn}/${new Date() * 1}`
        } : {
            gateway: this.props.match.params.sn,
            inst: this.props.record.inst_name,
            id: `gateways/${type}/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_' + type, data).then(res=>{
            if (res.ok) {
                message.success(action + data.inst + intl.get('gateway.request_sent_successfully'))
                this.props.store.action.pushAction(res.data, action + intl.get('common.applications'), '', data, 10000,  ()=> {
                    this.props.update_app_list();
                })
                setTimeout(()=> {
                    this.setState({ running_action: false })
                }, 2000)
            } else {
                message.error(action +  data.inst + `${intl.get('gateway.request_send_failed')}。${intl.get('common.error')}` + res.error)
                this.setState({ running_action: false });
            }
        }).catch(req=>{
            req;
            message.error(intl.get('gateway.send_request_failed'))
            this.setState({ running_action: false });
        })
    }
    sendForkCreate (record){
        const {gatewayInfo} = this.props.store
        http.post('/api/applications_forks_create', {
            name: record.name,
            version: Number(record.version)
        }).then(res=>{
            if (res.ok){
                if (res.data){
                    this.props.history.push(`/appeditorcode/${res.data.name}/${res.data.app_name}/${gatewayInfo.sn}/${record.inst_name}`);
                    this.setState({appdebug: false})
                }
            } else {
                message.error(res.error)
                this.setState({appdebug: false})
            }
        })
    }
    onDebug = (record) =>{
        const {gatewayInfo} = this.props.store;
        if (gatewayInfo.data.enable_beta === 0) {
            message.error(intl.get('gateway.gateway_does_not_turn_on_debugging_mode'))
            return
        }
        if (record.data){
            let user_id = this.props.store.session.user_id
            let app = record.data.name.replace(/\//g, '*')
            let app_name = record.data.app_name
            let app_inst = record.inst_name
            if (record.data.developer === user_id){
                window.open(`/appeditorcode/${app}/${app_name}/${gatewayInfo.sn}/${app_inst}`, '_blank');
                this.setState({appdebug: false})
            } else {
                let url = `/api/applications_forks_list?name=${app}&version=${record.version}&developer=${user_id}`
                http.get(url).then(result=>{
                    if (result.ok){
                        if (result.data && result.data.length > 0){
                            let forked_app = result.data[0]
                            window.open(`/appeditorcode/${forked_app.name}/${forked_app.app_name}/${gatewayInfo.sn}/${app_inst}`, '_blank');
                            this.setState({appdebug: false})
                        } else {
                            this.setState({appdebug: true})
                        }
                    } else {
                        this.setState({appdebug: true})
                    }
                }).catch(err => {
                    message.error(intl.get('gateway.get_clone_version_error') + err)
                })
            }
        }
    }
    render () {
        const { actionEnable } = this.props.store.gatewayInfo;
        const { record, show_app_config } = this.props;
        const { upgradeLoading, visible, setName, setNameConfirmLoading, nameValue, appdebug } = this.state;
        return (
            <div>
                <div style={{width: '80%', lineHeight: '30px'}}>
                    <span className="spanStyle">
                        {intl.get('gateway.app_ID')}: {record.data && record.data.name || intl.get('gateway.local_application')}
                        {
                            record.data && record.data.name
                            ? <span style={{color: 'blue', padding: '0 5px'}} >
                                <Link to={`/appdetails/${record.data.name}`}>
                                    {intl.get('gateway.view_details')}
                                </Link>
                            </span> : null
                        }
                    </span>
                    <span className="spanStyle">
                        {intl.get('appedit.apply_name')}: {record.data && record.data.app_name || intl.get('gateway.local_application')}
                    </span>
                    <span className="spanStyle">
                        {intl.get('gateway.application_Developer')}：{record.data && record.data.developer || this.props.store.session.companies}
                    </span>
                    <br/>
                    {
                        record.data && record.data.fork_from ? (
                            <span>
                                {intl.get('gateway.from_application')}：{record.data && record.data.fork_from}
                                <span style={{color: 'blue', padding: '0 5px'}} >
                                    <Link to={`/appdetails/${record.data.name}`}>
                                        {intl.get('gateway.view_details')}
                                    </Link>
                                </span>
                                <span
                                    style={{color: 'orange', padding: '0 5px'}}
                                    onClick={
                                        ()=>{
                                            message.info(intl.get('gateway.in_function_development'))
                                        }
                                    }
                                >
                                    {intl.get('gateway.apply_replace_with_source')} <Icon type="rollback"/>
                                </span>
                            </span>
                        ) : null
                    }
                    {
                        record.data && record.data.fork_from ? (
                            <span>
                                {intl.get('gateway.from_version')}：{record.data && record.data.fork_version}
                            </span>
                        ) : null
                    }
                </div>
                <div style={{display: 'flex', marginTop: 10, width: '100%', minWidth: 840, flexWrap: 'wrap'}}>
                    <div style={{paddingTop: 5}}>
                        <span className="spanStyle">{intl.get('gateway.boo_from_boot')}:</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <Switch checkedChildren=" ON"
                            unCheckedChildren="OFF"
                            defaultChecked={Number(record.auto) === 0 ? false : true}
                            disabled={this.state.running_action || !actionEnable}
                            onChange={(checked)=>{
                                this.setAutoDisabled(record, checked)
                            }}
                        />
                    </div>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.showModal('setName')
                        }}
                    >
                        {intl.get('appeditorcode.change_name')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        disabled={!record.data}
                        onClick={()=>{
                            if (record.data){
                            show_app_config(record.inst_name, record.conf, record.data)
                            }
                        }}
                    >
                        {intl.get('gateway.application_configuration')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        onClick={this.onDebug.bind(this, record)}
                        disabled={this.state.running_action || !actionEnable || !(record.data && record.data.name)}
                    >
                        {intl.get('gateway.application_debugging')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        style={{marginBottom: 5}}
                        disabled={record.latestVersion === undefined || record.latestVersion <= record.version || this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.showModal('visible')
                        }}
                    >
                        {intl.get('gateway.updated_version')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        onClick={()=>{
                            this.appSwitch('start')
                        }}
                        disabled={this.state.running_action || !actionEnable}
                    >
                        {intl.get('gateway.startup_application')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.appSwitch('stop')
                        }}
                    >
                        {intl.get('gateway.close_application')}
                    </Button>
                    <span style={{margin: '0 5px'}}> </span>
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.appSwitch('restart')
                        }}
                    >
                        {intl.get('gateway.restart_app')}
                    </Button>
                    <span style={{margin: '0 5px'}}></span>
                    <Popconfirm
                        disabled={this.state.running_action || !actionEnable}
                        title={intl.get('gateway.are_you_sure_you_want_to_uninstall_this_app')}
                        onConfirm={()=>{
                            this.confirm(record, this.props.match.params.sn, this)
                        }}
                        onCancel={cancel}
                        okText={intl.get('common.yes')}
                        cancelText={intl.get('common.no')}
                    >
                        <Button
                            disabled={this.state.running_action || !actionEnable}
                            type="danger"
                        >{intl.get('gateway.apps_Uninstall')}</Button>
                    </Popconfirm>
                    <Modal
                        visible={visible}
                        title={intl.get('gateway.application_upgrade_details')}
                        onOk={this.handleOk}
                        destroyOnClose
                        onCancel={this.handleCancel}
                        footer={[
                        <Button
                            key="back"
                            onClick={this.handleCancel}
                        >
                            {intl.get('common.cancel')}
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={upgradeLoading}
                            onClick={this.handleOk}
                        >
                            {intl.get('gateway.upgrade')}
                        </Button>
                        ]}
                    >
                        {
                            console.log(record.version)
                        }
                    <GatesAppsUpgrade
                        version={record.version}
                        inst={record.inst_name}
                        sn={this.props.match.params.sn}
                        app={record.name}
                    />
                    </Modal>
                    <Modal
                        visible={appdebug}
                        title={intl.get('gateway.application_debugging')}
                        onOk={()=>{
                            this.sendForkCreate(record)
                        }}
                        destroyOnClose
                        onCancel={()=>{
                            this.setState({appdebug: false, running_action: false})
                        }}
                    >
                        {intl.get('gateway.operate')[0]}{record.data && record.data.app_name}{intl.get('gateway.operate')[1]}
                    </Modal>
                    <Modal
                        visible={setName}
                        confirmLoading={setNameConfirmLoading}
                        title={intl.get('gateway.change_instance_name')}
                        onOk={()=>{
                            if (nameValue === undefined || nameValue === record.inst_name) {
                                message.error(intl.get('gateway.instance_name_not_modified'))
                                return
                            }
                            this.setState({setNameConfirmLoading: true})
                            http.post('/api/gateways_applications_rename', {
                                gateway: this.props.match.params.sn,
                                inst: record.inst_name,
                                new_name: nameValue,
                                id: `gateway/rename/${nameValue}/${new Date() * 1}`
                            }).then(result=>{
                                if (result.ok) {
                                    message.success(intl.get('gateway.change_instance_name_successful_request_sent_successfully'))
                                    let info = {
                                        gateway: this.props.match.params.sn,
                                        inst: this.props.record.inst_name,
                                        new_inst: nameValue
                                    }
                                    this.props.store.action.pushAction(result.data, intl.get('gateway.application_renaming'), '', info, 10000, ()=> {
                                        this.setState({setName: false}, ()=>{
                                            this.props.update_app_list();
                                        })
                                    })
                                } else {
                                    message.error(result.error)
                                    this.setState({setNameConfirmLoading: false})
                                }
                                this.setState({running_action: false})
                            }).catch(()=>{
                                this.setState({running_action: false})
                            })
                        }}
                        destroyOnClose
                        onCancel={()=>{
                            this.setState({setName: false, running_action: false})
                        }}
                        afterClose={()=>{
                            this.setState({setNameConfirmLoading: false})
                        }}
                    >
                        <span>{intl.get('appsinstall.instance_name')}: </span>
                        <Input
                            defaultValue={record.inst_name}
                            onChange={(e)=>{
                                this.setState({nameValue: e.target.value})
                            }}
                        />
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Action;