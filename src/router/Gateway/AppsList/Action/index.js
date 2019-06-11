import React, { Component } from 'react';
import { Button, Switch, Popconfirm, message, Modal, Input } from 'antd';
import http from '../../../../utils/Server';
import { withRouter } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import GatesAppsUpgrade from '../Upgrade';
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
                        let title = '卸载应用' + data.inst + '请求成功!'
                        message.info(title + '等待网关响应!')
                        this.props.store.action.pushAction(res.data, title, '', data, 10000,  ()=> {
                        this.props.update_app_list();
                        })
                    } else {
                        message.error('卸载应用' + data.inst + '请求失败!')
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
                let title = (props ? '开启应用开机自启' : '禁止应用开机自启') + '请求成功!';
                message.info(title + '等待网关响应!')
                let info = {
                    gateway: sn,
                    inst: record.inst_name,
                    value: type
                }
                this.props.store.action.pushAction(res.data, title, '', info, 10000,  ()=> {
                    this.props.update_app_list();
                })
            } else {
                let title = (props ? '开启应用开机自启' : '禁止应用开机自启') + '请求失败!';
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
            conf: {},
            id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_applications_upgrade', data).then(res=>{
            if (res.ok) {
                this.props.store.action.pushAction(res.data, '应用升级', '', data, 10000,  ()=> {
                    this.props.update_app_list();
                })
            } else {
                message.error(res.error)
            }
            this.setState({ running_action: false });
        }).catch(req=>{
            req;
            this.setState({ running_action: false });
            message.error('发送请求失败！')
        })
        setTimeout(() => {
            this.setState({ upgradeLoading: false, visible: false});
        }, 3000);
    }
    appSwitch = (type) =>{
        this.setState({ running_action: true });
        let action = '';
        if (type === 'stop'){
            action = '关闭'
        } else if (type === 'start'){
            action = '开启'
        } else {
            action = '重启'
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
            this.props.store.action.pushAction(res.data, action + '应用', '', data, 10000,  ()=> {
                this.props.update_app_list();
            })
            } else {
                message.error(res.error)
            }
            this.setState({ running_action: false });
        }).catch(req=>{
            req;
            this.setState({ running_action: false });
            message.error('发送请求失败！')
        })
    }
    sendForkCreate (record){
        http.post('/api/applications_forks_create', {
            name: record.name,
            version: Number(record.version)
        }).then(res=>{
            if (res.ok){
                if (res.data){
                    this.props.history.push('/appeditorcode/' + res.data.name + '/' + res.data.app_name);
                    this.setState({appdebug: false})
                }
            } else {
                message.error(res.error)
                this.setState({appdebug: false})
            }
        })
    }
    onDebug = (record) =>{
        if (record.data){
            let user_id = this.props.store.session.user_id
            let app = record.data.data.name
            let app_name = record.data.data.app_name
            if (record.data.data.owner === user_id){
                this.props.history.push('/appeditorcode/' + app + '/' + app_name);
                this.setState({appdebug: false})
            } else {
                let url = `/api/applications_forks_list?name=${app}&version=${record.version}&owner=${user_id}`
                http.get(url).then(result=>{
                    if (result.ok){
                        if (result.data && result.data.length > 0){
                            this.props.history.push(`/appeditorcode/${app}/${app_name}`);
                            this.setState({appdebug: false})
                        } else {
                            this.setState({appdebug: true})
                        }
                    } else {
                        this.setState({appdebug: true})
                    }
                }).catch(err => {
                    message.error('获取克隆版本错误' + err)
                })
            }
        }
    }
    render () {
        const { actionEnable } = this.props.store.gatewayInfo;
        const { record, show_app_config } = this.props;
        const { upgradeLoading, visible, setName, setNameConfirmLoading, nameValue, appdebug } = this.state;
        return (
            <div style={{position: 'relative', paddingBottom: 50}}>
                <div style={{lineHeight: '30px', paddingLeft: 20}}>
                    <div>
                        应用ID: {record.data && record.data.data.name || '本地应用'}
                    </div>
                    <div>
                        应用名称: {record.data && record.data.data.app_name || '本地应用'}
                    </div>
                    <div>
                        应用开发者：{record.data && record.data.data.owner || this.props.store.session.companies}
                    </div>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20, minWidth: 840, position: 'absolute', right: 20, bottom: 15}}>
                    <div style={{paddingTop: 5}}>
                        <span>开机自启:</span>
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
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.showModal('setName')
                        }}
                    >
                        更改名称
                    </Button>
                    <Button
                        disabled={!record.data}
                        onClick={()=>{
                            if (record.data){
                            show_app_config(record.inst_name, record.conf, record.data.data)
                            }
                        }}
                    >
                        应用配置
                    </Button>
                    <Button
                        onClick={this.onDebug.bind(this, record)}
                        disabled={this.state.running_action || !actionEnable}
                    >
                        应用调试
                    </Button>
                    <Button
                        disabled={record.latestVersion === undefined || record.latestVersion <= record.version || this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.showModal('visible')
                        }}
                    >
                        更新版本
                    </Button>
                    <Button
                        onClick={()=>{
                            this.appSwitch('start')
                        }}
                        disabled={this.state.running_action || !actionEnable}
                    >
                        启动应用
                    </Button>
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.appSwitch('stop')
                        }}
                    >
                        关闭应用
                    </Button>
                    <Button
                        disabled={this.state.running_action || !actionEnable}
                        onClick={()=>{
                            this.appSwitch('restart')
                        }}
                    >
                        重启应用
                    </Button>
                    <Popconfirm
                        disabled={this.state.running_action || !actionEnable}
                        title="确定要卸载此应用吗?"
                        onConfirm={()=>{
                            this.confirm(record, this.props.match.params.sn, this)
                        }}
                        onCancel={cancel}
                        okText="是"
                        cancelText="否"
                    >
                        <Button
                            disabled={this.state.running_action || !actionEnable}
                            type="danger"
                        >应用卸载</Button>
                    </Popconfirm>
                    <Modal
                        visible={visible}
                        title="应用升级详情"
                        onOk={this.handleOk}
                        destroyOnClose
                        onCancel={this.handleCancel}
                        footer={[
                        <Button
                            key="back"
                            onClick={this.handleCancel}
                        >
                            取消
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={upgradeLoading}
                            onClick={this.handleOk}
                        >
                            升级
                        </Button>
                        ]}
                    >
                    <GatesAppsUpgrade
                        version={record.version}
                        inst={record.inst_name}
                        sn={this.props.match.params.sn}
                        app={record.name}
                    />
                    </Modal>
                    <Modal
                        visible={appdebug}
                        title="应用调试"
                        onOk={()=>{
                            this.sendForkCreate(record)
                        }}
                        destroyOnClose
                        onCancel={()=>{
                            this.setState({appdebug: false, running_action: false})
                        }}
                    >
                        您不是{record.data && record.data.data.app_name}的应用所有者，如要继续远程调试，会将此应用当前版本克隆一份到您的账户下，而且在代码调试页面编辑的是您克隆的代码，在代码调试页面下载应用会将克隆到你名下的应用覆盖网关中的应用！
                        如要继续，点击"继续"按钮！
                    </Modal>
                    <Modal
                        visible={setName}
                        confirmLoading={setNameConfirmLoading}
                        title="更改实例名"
                        onOk={()=>{
                            this.setState({setNameConfirmLoading: true})
                            http.post('/api/gateways_applications_rename', {
                                gateway: this.props.match.params.sn,
                                inst: record.inst_name,
                                new_name: nameValue,
                                id: `gateway/rename/${nameValue}/${new Date() * 1}`
                            }).then(result=>{
                                if (result.ok) {
                                    message.success('更改实例名成功请求发送成功，请稍后...')
                                    let info = {
                                        gateway: this.props.match.params.sn,
                                        inst: this.props.record.inst_name,
                                        new_inst: nameValue
                                    }
                                    this.props.store.action.pushAction(result.data, '应用改名', '', info, 10000, ()=> {
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
                        <span>实例名: </span>
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