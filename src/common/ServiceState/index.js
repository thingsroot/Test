import React, { Component } from 'react';
import { Input, Select, Button, message} from 'antd';
import { inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import './style.scss';
const Option = Select.Option;
@withRouter
@inject('store')
class ServiceState extends Component {
    state = {
        message: {},
        proxy: '',
        appVersion: undefined,
        apps: [],
        latestVersion: 0,
        instName: '',
        settimer: false
    }
    componentDidMount (){
        const { mqtt } = this.props;
        this.t1 = setInterval(() => {
            mqtt && mqtt.client && mqtt.connected && mqtt.client.publish('v1/update/api/version', JSON.stringify({'id': 'get_new_version/' + new Date() * 1}))
            mqtt && mqtt.client && mqtt.connected && mqtt.client.publish('v1/vspax/api/list', JSON.stringify({id: 'api/list/' + new Date() * 1}))
            if (mqtt.vserial_channel.PortLength.length > 0) {
                this.setState({flag: false, stopLoading: false})
            }
            if (mqtt.vserial_channel.PortLength.length === 0){
                this.setState({flag: true, openLoading: false})
            }
        }, 5000);
        this.alive = setInterval(() => {
            if (mqtt.client && mqtt.client.connected && this.state.settimer) {
                this.setState({
                    settimer: false
                })
            }
            if (mqtt.client && !mqtt.client.connected && !this.state.settimer) {
                this.setState({
                    settimer: true
                })
            }
        }, 3000);
        this.getVersionLatest()
    }
    UNSAFE_componentWillReceiveProps (nextprops){
        const pathname = nextprops.location.pathname.toLowerCase();
        if (nextprops.store.gatewayInfo.apps !== this.state.apps){
            this.setState({
                apps: nextprops.store.gatewayInfo.apps
            }, ()=>{
                if (this.state.apps && this.state.apps.length > 0){
                    this.state.apps.map(item=>{
                        if (item.name === 'APP00000130' && pathname.indexOf('vserial') !== -1){
                            this.setState({appVersion: item.version})
                        }
                        if (item.name === 'APP00000135' && pathname.indexOf('vnet') !== -1) {
                            this.setState({appVersion: item.version})
                        }
                    })
                }
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
        clearInterval(this.alive)
        this.props.mqtt.vserial_channel.setProxy(null)
        this.props.mqtt.disconnect()
    }
    upgradeApp = () =>{
        const pathname = this.props.location.pathname.toLowerCase();
        let app = '';
        if (pathname.indexOf('vserial') !== -1) {
            app = 'APP00000130'
        }
        if (pathname.indexOf('vnet') !== -1) {
            app = 'APP00000135'
        }
        if (this.state.instName) {
            const data = {
                app: app,
                inst: this.state.instName,
                gateway: this.props.gateway,
                version: this.state.latestVersion,
                id: `vserial/upgrade/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_upgrade', data).then(res=>{
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, '应用升级', '', data, 10000)
                } else {
                    message.error(res.error)
                }
            })
            return false;
        } else {
                this.getVersionLatest()
        }
    }
    getVersionLatest = () => {
        const pathname = this.props.location.pathname.toLowerCase();
        let app = '';
        if (pathname.indexOf('vserial') !== -1) {
            app = 'APP00000130'
        }
        if (pathname.indexOf('vnet') !== -1) {
            app = 'APP00000135'
        }
        http.get('/api/gateways_app_version_latest?beta=' + this.props.store.gatewayInfo.data.enable_beta + '&app=' + app).then(res=>{
            if (res.ok) {
                this.setState({
                    latestVersion: res.data
                })
            }
        })
        if (!this.state.instName) {
            http.get('/api/gateways_app_list?gateway=' + this.props.match.params.sn).then(res=>{
                if (res.ok){
                    if (res.data && res.data.length > 0){
                        res.data.map((item)=>{
                            if (item.name === 'APP00000130' && this.props.location.pathname.indexOf('vserial') !== -1){
                                this.setState({instName: item.inst_name})
                            }
                            if (item.name === 'APP00000135' && this.props.location.pathname.indexOf('vnet') !== -1){
                                this.setState({instName: item.inst_name})
                            }
                        })
                    }
                }
            })
            return false;
        } else {
            setTimeout(() => {
                console.log('1111111111')
                this.getVersionLatest()
            }, 2000);
        }
    }
    upgradeRprogramming = () =>{
        const { mqtt } = this.props;
        const { newVersionMsg } = mqtt.vserial_channel;
        console.log(mqtt)
        const data = {
            'id': 'upgradeRprogramming/' + new Date() * 1,
            'update_confirm': newVersionMsg.update,
            'new_version': newVersionMsg.new_version,
            'new_version_filename': newVersionMsg.new_version_filename
        }
        mqtt.client.publish('v1/update/api/update', JSON.stringify(data))
    }
    handleChange = (value)=>{
        console.log(value)
        const { mqtt } = this.props;
        mqtt.vserial_channel.setProxy(value)
        console.log(mqtt.vserial_channel.Proxy)
    }
    render () {
        const { mqtt } = this.props;
        const { message, appVersion, latestVersion} = this.state;
        const { addPortData, serviceNode } = mqtt.vserial_channel;
        const { pathname } = this.props.location;
        const gateway = pathname.indexOf('vserial') !== -1
        ? addPortData[0].info && addPortData[0].info.sn ? addPortData[0].info.sn : '------'
        : mqtt.vnet_channel.vnet_config && mqtt.vnet_channel.is_running ? mqtt.vnet_channel.vnet_config.gate_sn : '------';
        return (
            <div className="VserviceStateWrapper">
                <p>远程编程服务状态：<span>{message && Object.keys(message).length > 0 && message.info.sn}</span></p>
                <div>
                    <div className="flex">
                        <p>服务版本:</p>
                        <Input
                            value={mqtt.new_version}
                        />
                        <div className="versionMsg">
                                {
                                    mqtt.new_version
                                    ? mqtt.vserial_channel.Active && mqtt.versionMsg
                                    ? '已是最新版本！'
                                    : <div>
                                        请升级到最新版本！&nbsp;&nbsp;&nbsp;&nbsp;
                                        <Button
                                            type="primary"
                                            loading={!mqtt.versionMsg}
                                            onClick={this.upgradeRprogramming}
                                        >升级</Button>
                                    </div>
                                    : ''
                                }
                            </div>
                    </div>
                    {
                            this.state.settimer
                            ? <div className="prompt">
                            未能连接到远程编程服务，请确认freeioe_Rprogramming是否安装并运行。下载<a href="http://thingscloud.oss-cn-beijing.aliyuncs.com/freeioe_Rprogramming/freeioe_Rprogramming.zip">freeioe_Rprogramming</a>
                          </div>
                            :  ''
                        }
                    <div className="flex">
                        <p>关联网关:</p>
                        <Input
                            value={gateway}
                        />
                    </div>
                    <div className="flex">
                        <p>应用版本:</p>
                        <Input
                            value={appVersion}
                        />
                            <div className="versionMsg">
                                {
                                    appVersion
                                    ? appVersion < latestVersion
                                    ? <div>
                                    请升级到最新版本！&nbsp;&nbsp;&nbsp;&nbsp;
                                    <Button
                                        type="primary"
                                        onClick={this.upgradeApp}
                                    >升级</Button>
                                  </div>
                                    : '已是最新版本！'
                                    : ''
                                }
                            </div>
                    </div>
                    <div className="flex">
                        <p>服务节点:</p>
                        <div>
                            {
                            serviceNode && serviceNode.length > 0 &&
                            <Select
                                defaultValue={serviceNode && serviceNode.length > 0 && serviceNode[0].host}
                                style={{ width: 230 }}
                                onChange={this.handleChange}
                                disabled={this.props.mqtt.vnet_channel.is_running}
                            >
                                {
                                    !mqtt.vserial_channel.Proxy && mqtt.vserial_channel.setProxy(serviceNode[0].host)
                                }
                                {
                                    serviceNode.map((val, ind)=>{
                                        return (
                                            <Option
                                                value={val.host}
                                                key={ind}
                                            >{val.desc}-----{val.delay}</Option>
                                        )
                                    })
                                }
                            </Select>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ServiceState;