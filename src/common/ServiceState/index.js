import React, { Component } from 'react';
import { Input, Select, message, Button, Modal} from 'antd';
import { inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import './style.scss';
import intl from 'react-intl-universal';
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
        settimer: undefined,
        app_name: '',
        the_old_version: undefined,
        showConfirm: false,
        upgradeButton: false,
        upgradeStatus: false
    }
    componentDidMount (){
        const { mqtt } = this.props;
        this.getGateywayInfo()
        this.setintervalGayewayInfo = setInterval(() => {
            this.getGateywayInfo()
        }, 5000);
        this.test_version = setInterval(() => {
            if (((mqtt.version && mqtt.version < 200519) || this.state.the_old_version === 'the_old_version') && this.props.location.pathname.indexOf('vnet') === -1) {
                if (this.state.showConfirm) {
                    return false;
                }
                this.setState({
                    showConfirm: true
                }, () =>{
                    this.showConfirm()
                })
            }
            if (mqtt && mqtt.version && this.state.appVersion && (this.state.the_old_version === 'false' || (this.state.the_old_version === 'the_old_version'))) {
                clearInterval(this.test_version)
            }
        }, 100);
        this.t1 = setInterval(() => {
            mqtt && mqtt.client && mqtt.connected && mqtt.client.publish('v1/update/api/servers_list', JSON.stringify({'id': 'server_list/' + new Date() * 1}))
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
            if (mqtt.client && mqtt.client.connected && (this.state.settimer || this.state.settimer === undefined)) {
                this.setState({
                    settimer: false
                }, ()=>{
                    this.props.settimer(false)
                })
            }
            if (mqtt.client && !mqtt.client.connected && (!this.state.settimer || this.state.settimer === undefined)) {
                this.setState({
                    settimer: true
                }, ()=>{
                    this.props.settimer(true)
                })
            }
        }, 3000);
        this.getVersionLatest()
    }
    UNSAFE_componentWillReceiveProps (nextprops){
        const pathname = nextprops.location.pathname.toLowerCase();
        if (nextprops.mqtt.upgrade_status === 'failed' && this.t1) {
            clearInterval(this.t1)
            if (this.state.upgradeStatus) {
                this.setState({
                    upgradeStatus: false
                })
            }
        }
        if (nextprops.store.gatewayInfo.apps !== this.state.apps){
            this.setState({
                apps: nextprops.store.gatewayInfo.apps
            }, ()=>{
                if (this.state.apps && this.state.apps.length > 0){
                    let flag = false;
                    this.state.apps.map(item=>{

                        if (item.name === 'APP00000130'){
                            this.setState({appVersion: item.version, the_old_version: 'the_old_version', app_name: 'isVserial'})
                            flag = true;
                        }
                        if (item.name === 'APP00000377' && pathname.indexOf('vserial') !== -1 && item.inst_name === 'freeioe_Vserial'){
                            this.setState({appVersion: item.version, app_name: 'isVserial'})
                        }
                        if (item.name === 'APP00000135' && pathname.indexOf('vnet') !== -1) {
                            this.setState({appVersion: item.version, app_name: 'isVnet'})
                        }
                    })
                    if (!flag) {
                        this.setState({
                            the_old_version: 'false'
                        })
                    }
                }
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
        clearInterval(this.alive)
        clearInterval(this.one_short_timer)
        clearInterval(this.setintervalGayewayInfo)
        this.props.mqtt.vserial_channel.setProxy(null)
        this.props.mqtt.disconnect()
    }
    showConfirm = () => {
        Modal.info({
          title: '应用版本过低，请升级！',
        //   icon: <ExclamationCircleOutlined />,
          content: '应用版本过低，请升级后再使用，如不升级，将无法使用此功能！',
          okText: '升级',
        //   cancelText: '放弃升级',
          onOk: () => {
            if (this.state.the_old_version === 'the_old_version') {
                this.upgradeApp()
            }
            if (this.props.mqtt.version < 200519) {
                this.upgradeRprogramming()
                this.setState({
                    upgradeButton: true
                }, ()=>{
                    setTimeout(() => {
                        this.setState({
                            upgradeButton: false
                        })
                    }, 5000);
                })
            }
            return new Promise((resolve, reject) => {
              setTimeout(Math.random() > 0.5 ? resolve : reject, 5000);
            }).catch((err) => console.log('Oops errors!' + err));
          }
        //   onCancel: () => {
        //     this.props.history.push(`/gateway/${this.props.match.params.sn}/devices`)
        //   }
        });
      }
    getGateywayInfo = () => {
        http.get('/api/gateways_read?name=' + this.props.gateway).then(res=>{
            if (res.ok) {
                if (!res.data.data.data_upload) {
                    if (!this.one_short_timer) {
                        this.enableDataUploadOneShort(60)
                        this.one_short_timer = setInterval(()=>{
                            this.enableDataUploadOneShort(60)
                        }, 55000)
                    }
                }
            }
        })
    }
    enableDataUploadOneShort (duration) {
        const { gatewayInfo } = this.props.store;
        const sn = this.props.gateway;
        if (!gatewayInfo.data.data_upload) {
            let params = {
                name: sn,
                duration: duration,
                id: `enable_data_one_short/${sn}/${new Date() * 1}`
            }
            http.post('/api/gateways_enable_data_one_short', params).then(res => {
                if (!res.ok) {
                    message.error(intl.get('gateway.temporary_data_delivery_instruction_failed') + ':' + res.error)
                }
            }).catch( err => {
                message.error(intl.get('gateway.temporary_data_delivery_instruction_failed') + ':' + err)
            })
        }
    }
    upgradeApp = () =>{
        const pathname = this.props.location.pathname.toLowerCase();
        let app = '';
        let inst = '';
        if (pathname.indexOf('vserial') !== -1) {
            app = 'APP00000377';
            inst = 'freeioe_Vserial'
        }
        if (pathname.indexOf('vnet') !== -1) {
            app = 'APP00000135';
            inst = 'freeioe_Vnet'
        }
        if (this.state.instName) {
            const data = {
                app: app,
                inst: inst,
                gateway: this.props.gateway,
                version: this.state.latestVersion,
                fork: true,
                id: `${inst}/upgrade/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_upgrade', data).then(res=>{
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, intl.get('gateway.application_upgrade'), '', data, 10000, (result) =>{
                        console.log(result)
                    })
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
            app = 'APP00000377'
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
                            if ((item.name === 'APP00000377' || item.name === 'APP00000130') && this.props.location.pathname.indexOf('vserial') !== -1){
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
                this.getVersionLatest()
            }, 2000);
        }
    }
    upgradeRprogramming = () =>{
        const { mqtt } = this.props;
        const { newVersionMsg } = mqtt.vserial_channel;
        const data = {
            'id': 'upgradeRprogramming/' + new Date() * 1,
            'update_confirm': newVersionMsg.update,
            'new_version': newVersionMsg.new_version,
            'new_version_filename': newVersionMsg.new_version_filename
        }
        mqtt && mqtt.client && mqtt.client.publish('v1/update/api/update', JSON.stringify(data))
        const datas = {
            id: 'get_upgrade_status/' + new Date() * 1
        }
        this.setState({
            upgradeStatus: true
        })
        this.t1 = setInterval(() => {
            mqtt && mqtt.client && mqtt.client.publish('v1/update/api/update_status', JSON.stringify(datas))
        }, 3000);
    }
    handleChange = (value)=>{
        const { mqtt } = this.props;
        mqtt.vserial_channel.setProxy(value)
    }
    render () {
        const { mqtt } = this.props;
        const { message, appVersion, latestVersion } = this.state;
        const { addPortData, serviceNode } = mqtt.vserial_channel;
        const { pathname } = this.props.location;
        const gateway = pathname.indexOf('vserial') !== -1
        ? addPortData[0].info && addPortData[0].info.sn ? addPortData[0].info.sn : '------'
        : mqtt.vnet_channel.vnet_config && mqtt.vnet_channel.is_running ? mqtt.vnet_channel.vnet_config.gate_sn : '------';
        return (
            <div className="VserviceStateWrapper">
                <p className="VserviceState_title">{intl.get('gateway.service_state')}<span>{message && Object.keys(message).length > 0 && message.info.sn}</span></p>
                <div>
                    <div className="flex">
                        <p>{intl.get('gateway.service_state')}:</p>
                        <Input
                            value={this.state.settimer !== undefined ? this.state.settimer ? intl.get('gateway.abnormal') : intl.get('gateway.normal') : intl.get('gateway.In_the_load') + '...'}
                        />
                        <div className="versionMsg">
                                {
                                    mqtt.new_version
                                    ? mqtt.vserial_channel.Active && mqtt.versionMsg
                                    ? intl.get('gateway.Its_the_latest_version')
                                    : <div>
                                        {intl.get('gateway.Please_upgrade')}!&nbsp;&nbsp;&nbsp;&nbsp;
                                        {
                                            !this.state.upgradeButton
                                            ? <Button
                                                type="primary"
                                                loading={this.state.upgradeStatus}
                                                onClick={this.upgradeRprogramming}
                                              >{intl.get('gateway.upgrade')}</Button>
                                            : ''
                                        }
                                    </div>
                                    : ''
                                }
                            </div>
                    </div>
                        {
                            this.state.settimer && this.state.settimer !== undefined
                            ? <div className="prompt">
                            {intl.get('gateway.Confirm_whether_to_install_or_not')}&nbsp;&nbsp;freeioe_Rprogramming&nbsp;&nbsp;{intl.get('gateway.Whether_to_install')}。
                            <a href="http://thingscloud.oss-cn-beijing.aliyuncs.com/freeioe_Rprogramming/freeioe_Rprogramming.zip">{intl.get('virtualgateways.click_to_download')} freeioe_Rprogramming</a>
                          </div>
                            :  ''
                        }
                    <div className="flex">
                        <p>{intl.get('gateway.app_state')}:</p>
                        <Input
                            value={this.props.store.gatewayInfo[this.state.app_name] ? intl.get('gateway.normal') : intl.get('gateway.abnormal')}
                        />
                            <div className="versionMsg">
                                {
                                    appVersion
                                    ? appVersion < latestVersion
                                    ? <div>
                                    {intl.get('gateway.Please_upgrade')}！&nbsp;&nbsp;&nbsp;&nbsp;
                                    <Button
                                        type="primary"
                                        onClick={this.upgradeApp}
                                    >{intl.get('gateway.upgrade')}</Button>
                                  </div>
                                    : intl.get('gateway.Its_the_latest_version')
                                    : ''
                                }
                            </div>
                    </div>
                    <div className="flex">
                        <p>{intl.get('gateway.Associated_gateway')}:</p>
                        <Input
                            value={gateway}
                        />
                    </div>
                    <div className="flex">
                        <p>{intl.get('gateway.Service_node')}:</p>
                        <div>
                            {
                                console.log(serviceNode, 'serviceNode')
                            }
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