import React, { Component } from 'react';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { message, Modal, Input, Select, Card, Form, Tooltip, Button } from 'antd';
import { IconIOT } from '../../../utils/iconfont';
import './style.scss';
import intl from 'react-intl-universal';

const Option = Select.Option;
@withRouter
@inject('store')
@observer
class NetworkConfig extends Component {
    state = {
        data: [],
        brlan_ip: undefined,
        netmask: '255.255.255.0',
        inst_name: undefined,
        loading: true,
        visible: false,
        default_gw: undefined,
        gw_interface: undefined,
        dns_servers: undefined,
        sn: this.props.match.params.sn,
        running_action: false,
        uploadOneShort: false,
        dataSanpshotEnable: true,
        dataFlushEnable: true,
        interface: ''
    }
    componentDidMount () {
       this.getInfo()
       this.getGateywayInfo()
       this.t1 = setInterval(() => {
        this.getInfo()
       }, 10000);
       this.setintervalGayewayInfo = setInterval(() => {
           this.getGateywayInfo()
       }, 5000);
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.match.params.sn !== this.props.match.params.sn) {
            this.setState({
                loading: true,
                data: [],
                sn: nextProps.match.params.sn
            }, ()=>{
                this.getInfo()
                clearInterval(this.setintervalGayewayInfo)
                if (this.one_short_timer) {
                    clearInterval(this.one_short_timer)
                }
                this.getGateywayInfo()
                this.setintervalGayewayInfo = setInterval(() => {
                    this.getGateywayInfo()
                }, 5000);
            })
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
        clearInterval(this.one_short_timer)
        clearInterval(this.setintervalGayewayInfo)
    }
    getGateywayInfo = () => {
        http.get('/api/gateways_read?name=' + this.state.sn).then(res=>{
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
        const { sn } = this.state;
        if (!gatewayInfo.data.data_upload) {
            let params = {
                name: this.state.sn,
                duration: duration,
                id: `enable_data_one_short/${sn}/${new Date() * 1}`
            }
            http.post('/api/gateways_enable_data_one_short', params).then(res => {
                if (!res.ok) {
                    message.error(`${intl.get('gateway.temporary_data_delivery_instruction_failed')}: ` + res.error)
                }
            }).catch( err => {
                message.error(`${intl.get('gateway.temporary_data_delivery_instruction_failed')}: ` + err)
            })
        }
    }
    dataSnapshot () {
        http.post('/api/gateways_data_snapshot', {name: this.state.sn}).then(res => {
            if (res.ok) {
                message.success(intl.get('gateway.request_gateway_data_snapshot_succeeded'))
            } else {
                message.error(`${intl.get('gateway.failed_to_request_gateway_data_snapshot')}: ` + res.error)
            }
        }).catch( err => {
            message.error(`${intl.get('gateway.failed_to_request_gateway_data_snapshot')}: ` + err)
        })
    }
    dataFlush () {
        http.post('/api/gateways_data_flush', {name: this.state.sn}).then(res => {
            if (res.ok) {
                message.success(intl.get('gateway.request_gateway_to_send_data_in_the_cycle_successfully'))
            } else {
                message.error(`${intl.get('gateway.failed_to_request_gateway_to_send_data_within_the_period')}: ` + res.error)
            }
        }).catch( err => {
            message.error(`${intl.get('gateway.failed_to_request_gateway_to_send_data_within_the_period')}: ` + err)
        })
    }
    showConfirm = (res) => {
        const $this = this;
        Modal.confirm({
          title: `${intl.get('gateway.net_info_app_is_not_installed')}?`,
          content: `${intl.get('gateway.net_info_app_is_not_installed')}?`,
          okText: intl.get('appitems.install'),
          cancelText: intl.get('common.cancel'),
          onOk () {
              $this.installNet_info(res)
              return false;
          },
          onCancel () {
              message.info(intl.get('gateway.cancel_the_installation_of_net_info'))
              $this.props.history.push(`/gateway/${$this.props.match.params.sn}/devices`)
              return false
          }
        });
      }
    getInfo = ()=>{
        this.getIsNetInfo().then(res=>{
            if (res) {
                this.getWanInfo('net_info')
            } else {
                this.showConfirm(res)
                clearInterval(this.t1)
            }
        })
    }
    installNet_info = (res) => {
        if (!res && this.props.store.gatewayInfo.sn === this.state.sn) {
            const beta = this.props.store.gatewayInfo.enabled ? 1 : 0;
            const data = {
                app: 'APP00000115',
                conf: {},
                gateway: this.state.sn,
                id: `app_install/${this.state.sn}/net_info/APP00000115/${new Date() * 1}`,
                inst: 'net_info'
            }
            message.info(intl.get('gateway.the_gateway_does_not_have_the_Netinfo_app_installed'))
            http.get('/api/applications_versions_latest?app=APP00000115&beta=' + beta).then(res=>{
                if (res.ok) {
                    data.version = res.data;
                    http.post('/api/gateways_applications_install', data).then(Response=>{
                        if (Response.ok){
                            let title = intl.get('appsinstall.installation_and_Application') + data.inst + intl.get('gateway.request')
                            message.info(title + `${intl.get('gateway.wait_for_gateway_response')}!`)
                            this.props.store.action.pushAction(Response.data, title, '', data, 10000,  ()=> {
                                this.getWanInfo('net_info')
                                this.t1 = setInterval(() => {
                                    this.getWanInfo('net_info')
                                }, 10000);
                            })
                        }
                    })
                } else {
                    message.error(res.error)
                }
            })
        }
    }
    getWanInfo  = (instname) => {
        this.setState({
            inst_name: instname
        })
        http.get('/api/gateway_devf_data?gateway=' + this.state.sn + '&name=' + this.state.sn + '.' + instname).then(res=>{
            if (res.ok) {
                const arr = []
                res.data.map(item=>{
                    if (item.name === 'net_info') {
                        const message = JSON.parse(item.pv);
                        message && message.length > 0 && message.map(value=>{
                            if (value.interface === 'symrouter' || value.interface === 'loopback' || value.interface === 'wan6' || value.proto === 'dhcpv6'){
                                return false;
                            } else {
                                arr.push(value)
                            }
                        })
                    }
                    if (item.name === 'default_gw') {
                        this.setState({
                            default_gw: item.pv
                        })
                    }
                    if (item.name === 'default_gw') {
                        this.setState({
                            default_gw: item.pv
                        })
                    }
                    if (item.name === 'dns_servers') {
                        this.setState({
                            dns_servers: eval(item.pv)
                        })
                    }
                    if (item.name === 'gw_interface') {
                        this.setState({
                            gw_interface: item.pv
                        })
                    }
                })
                arr && arr.length > 0 && arr.map((item, index)=>{
                    if (item.interface === 'lan') {
                        arr.splice(index, 1)
                        arr.unshift(item)
                    }
                })
                this.setState({
                    data: arr,
                    loading: false
                })
            }
        })
    }
    startnetinfo = (inst_name) =>{
        if (!this.state.running_action){
            message.info(intl.get('gateway.app_is_not_started'))
            const data = {
                gateway: this.props.match.params.sn,
                inst: inst_name,
                id: `gateways/start/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_start', data).then(res=>{
                if (res.ok) {
                    message.success(intl.get('gateway.start_up') + data.inst + intl.get('gateway.request_sent_successfully'))
                    this.props.store.action.pushAction(res.data, intl.get('gateway.startup_application'), '', data, 10000,  ()=> {
                        this.props.update_app_list();
                    })
                    setTimeout(()=> {
                        this.setState({ running_action: true })
                    }, 2000)
                } else {
                    message.error(intl.get('gateway.start_up') +  data.inst + `${intl.get('gateway.request_send_failed')}。${intl.get('common.error')}` + res.error)
                }
            }).catch(req=>{
                req;
                message.error(intl.get('gateway.send_request_failed'))
                this.setState({ running_action: false });
            })
        }
    }
    getIsNetInfo = ()=>{
        let isNetInfo = false;
        return new Promise((resolve, reject) =>{
                http.get('/api/gateways_app_list?gateway=' + this.state.sn).then(res=>{
                    if (res.ok && res.data.length !== 0) {
                        if (res.data && res.data.length > 0){
                            res.data.map(item=>{
                                if (item.name === 'APP00000115') {
                                    isNetInfo = true;
                                    this.getWanInfo(item.inst_name)
                                    if (item.status !== 'running') {
                                        this.startnetinfo(item.inst_name)
                                    }
                                }
                            })
                            resolve(isNetInfo)
                        } else {
                            resolve(isNetInfo)
                        }
                    } else {
                        resolve(isNetInfo)
                    }
                }).catch(()=>{
                    reject(isNetInfo)
                })
        })
    }
    showModal = (ip, item) => {
        this.setState({
            interface: item.interface,
            visible: true,
            brlan_ip: ip
        });
      };
      handleOk = () => {
        this.setState({
          visible: false
        });
        const data = {
            gateway: this.state.sn,
            id: `send_output/${this.state.sn}/${this.state.sn}.net_info/${new Date() * 1}`,
            command: 'mod_interface',
            name: `${this.state.sn}.${this.state.inst_name}`,
            param: {
                interface: this.state.interface,
                proto: 'static',
                ipaddr: this.state.brlan_ip.address,
                netmask: this.state.netmask
            }
          }
          http.post('/api/gateways_dev_commands', data).then(res=>{
              if (res.ok) {
                let title = intl.get('gateway.change_LAN_IP_address_and_subnet_mask_address') + data.name + intl.get('gateway.request')
                message.info(title + `${intl.get('gateway.wait_for_gateway_response')}!`)
                this.props.store.action.pushAction(res.data, title, '', data, 10000,  ()=> {
                    this.getWanInfo('net_info')
                })
              } else {
                  message.error(res.error)
              }
          })
      };
      handleCancel = () => {
        this.setState({
          visible: false
        });
      };
    render (){
        const {data, loading, dns_servers} = this.state;
        return (
            <div className="networkwrapper">
                <Card
                    loading={loading || data.length === 0}
                >
                    <div className="title">
                        <h2>{intl.get('gateway.The_network_configuration')}</h2>
                        <div className="btn_to_set">
                        <Tooltip
                            placement="bottom"
                            title={intl.get('gateway.force_the_gateway_to_send_the_latest_data')}
                        >
                                <Button
                                    icon="question-circle"
                                    style={{bottom: 30}}
                                    onClick={()=>{
                                        window.open('https://wiki.freeioe.org/doku.php?id=apps:APP00000115', '_blank')
                                    }}
                                >{intl.get('header.help')}</Button>
                                <br/>
                                <Button
                                    disabled={!this.state.dataFlushEnable}
                                    onClick={()=>{
                                        this.setState({dataFlushEnable: false})
                                        this.dataFlush()
                                        setTimeout(()=>{
                                            this.setState({dataFlushEnable: true})
                                        }, 1000)
                                    }}
                                >
                                    <IconIOT type="icon-APIshuchu"/>{intl.get('devece_list.Forced_to_refresh')}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                <div className="networkpagecontent">
                {
                    data && data.length > 0 && data.map((item, key)=>{
                        return (
                                <div
                                    key={key}
                                    className="networkpagelist"
                                >
                                    <p className="networkpagelist_title">{item.interface}</p>
                                    <div className="networkpagelist_content">
                                        <div className="networkpagelist_left">
                                            <div className="networkinfo_top">
                                                {item.interface}
                                            </div>
                                            <div className="networkinfo_bottom">
                                                {item.l3_device ? item.l3_device : item.device}
                                            </div>
                                        </div>
                                        <div className="networkpagelist_right">
                                            <div>
                                                <p>{intl.get('gateway.network_protocol')}：<span>{item.proto}</span></p>
                                                <p>{intl.get('common.state')}： <span>{item.up ? 'up' : 'down'}</span></p>
                                                <p>{intl.get('appsinstall.IP_address')}：<span>{item['ipv4-address'] && item['ipv4-address'].length > 0 && item['ipv4-address'][0].address ? item['ipv4-address'][0].address + '/' + item['ipv4-address'][0].mask : ''}
                                                    </span></p>
                                            </div>
                                        </div>
                                        {
                                            item.interface === 'lan'
                                            ? <div
                                                className="networksetinfo"
                                                onClick={()=>{
                                                    this.showModal(item['ipv4-address'][0], item)
                                                }}
                                              >
                                                {intl.get('appdetails.edit')}
                                            </div>
                                            : ''
                                        }
                                        <div className="modal_">
                                        <Modal
                                            maskClosable={false}
                                            title={intl.get('gateway.modify_LAN_IP_address_and_subnet_mask')}
                                            visible={this.state.visible}
                                            onOk={this.handleOk}
                                            onCancel={this.handleCancel}
                                            okText={intl.get('gateway.change')}
                                            cancelText={intl.get('common.cancel')}
                                            maskStyle={{backgroundColor: 'rgba(0,0,0,0.15)'}}
                                        >
                                            <div>
                                                <Form.Item label={`${intl.get('gateway.IP_address')}:`}>
                                                    <Input
                                                        style={{width: 300}}
                                                        onChange={(e)=>{
                                                            this.setState({
                                                                brlan_ip: {...this.state.brlan_ip, address: e.target.value}
                                                            })
                                                        }}
                                                        value={this.state.brlan_ip && this.state.brlan_ip.address ? this.state.brlan_ip.address : ''}
                                                    />
                                                </Form.Item>

                                            </div>
                                            <div>
                                                <Form.Item label={`${intl.get('gateway.subnet_mask')}:`}>
                                                    <Select
                                                        defaultValue="255.255.255.0"
                                                        style={{width: 300}}
                                                        onChange={(value)=>{
                                                            this.setState({
                                                                netmask: value
                                                            })
                                                        }}
                                                    >
                                                        <Option value="255.255.255.0">255.255.255.0</Option>
                                                        <Option value="255.255.254.0">255.255.254.0</Option>
                                                        <Option value="255.255.252.0">255.255.252.0</Option>
                                                        <Option value="255.255.128.0">255.255.128.0</Option>
                                                        <Option value="255.255.0.0">255.255.0.0</Option>
                                                    </Select>
                                                </Form.Item>
                                            </div>
                                        </Modal>
                                        </div>
                                    </div>
                            </div>
                        )
                    })
                }
                </div>
                </Card>
                <div className="DNSinfo">
                    <Card loading={loading || data.length === 0}>
                        <h2>| {intl.get('gateway.default_gateway_&_DNS')}</h2>
                        <div style={{lineHeight: '30px', marginTop: '20px', marginLeft: '30px'}}>
                            <p>{intl.get('gateway.default_gateway')}： {this.state.default_gw}</p>
                            <p>{intl.get('gateway.default_interface')}： {this.state.gw_interface}</p>
                            {
                                dns_servers && dns_servers.length > 0 &&  dns_servers.map((item, key)=>{
                                    return (
                                        <p key={key}>DNS{key + 1}: {item}</p>
                                    )
                                })
                            }
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default NetworkConfig;