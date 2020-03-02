import React, { Component } from 'react';
import { Input, Select, Button, Table, message, Collapse } from 'antd';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import {_getCookie} from '../../../utils/Session';
import http from '../../../utils/Server';
import ServiceState from '../../../common/ServiceState';
import JSONPretty from 'react-json-pretty';
import intl from 'react-intl-universal';
import './style.scss';
const Option = Select.Option;
const { Panel } = Collapse;
const columns = [{
    title: intl.get('gateway.service_name'),
    dataIndex: 'name',
    key: 'name',
    width: '150px'
  },
  {
    title: intl.get('common.state'),
    dataIndex: 'status',
    key: 'status',
    width: '140px'
  }];
  @withRouter
  @inject('store')
  @observer
class VPN extends Component {
    state = {
        flag: true,
        tap_ip: undefined,
        arr: [],
        start_loading: false,
        stop_loading: false,
        bridge_run: '',
        router_run: '',
        bridge_config: '',
        router_config: '',
        status: 'ONLINE',
        agreement: 'tcp',
        model: 'bridge',
        port: '665',
        auth_code: '',
        ip: 'device ipaddress',
        node: 'hs.symgrid.com',
        netmask: '255.255.255.0',
        virtualIp: '',
        message: {},
        result: {},
        toggleFlag: true,
        gateStatus: '',
        chouldstatus: {},
        isShow: false,
        pingIP: '',
        timer: undefined
    }
    componentDidMount (){
        http.get('/api/user_token_read').then(res=>{
            this.setState({
                auth_code: res.data
            }, () => {
                this.props.mqtt.auth_code = res.data
            })
        })
        this.getStatus()
        this.timer = setInterval(() => {
            this.getStatus()
        }, 10000);
        this.timer1 = setInterval(() => {
            this.sendKeepAlive()
        }, 3000);
        const { mqtt } = this.props;
        mqtt.connect(this.props.gateway, 'v1/vnet/#', true)

    }
    componentWillUnmount (){
        this.props.mqtt.disconnect();
        clearInterval(this.timer)
        clearInterval(this.timer1)
    }
    startVnet = () =>{
        if (this.state.auth_code){
            const {mqtt} = this.props;
            const data = {
                id: 'start_vnet/' + new Date() * 1,
                vnet_cfg: {
                    net_mode: this.state.model,
                    net_protocol: this.state.agreement,
                    gate_sn: this.props.gateway,
                    tap_ip: this.state.tap_ip,
                    user_id: _getCookie('user_id'),
                    tap_netmask: this.state.netmask,
                    dest_ip: this.state.pingIP,
                    node: this.props.mqtt.vserial_channel.Proxy
                },
                frps_cfg: {
                    server_addr: this.props.mqtt.vserial_channel.Proxy
                }
            }
            // const postData = {
            //     id: 'post_gate/' + new Date() * 1,
            //     auth_code: this.state.auth_code,
            //     output: 'vnet_config'
            // }
            mqtt && mqtt.client && mqtt.client.publish('v1/vnet/api/service_start', JSON.stringify(data))
            // setTimeout(() => {
            //     mqtt && mqtt.client && mqtt.client.publish('v1/vnet/api/post_gate', JSON.stringify(postData))
            // }, 5000);
        } else {
            message.warning(intl.get('gateway.your_account_does_not_have_an_accessKey_at_present'), 3)
            http.post('/api/user_token_create').then(res=>{
                if (res.ok){
                    this.setState({
                        auth_code: res.data
                    }, ()=>{
                        this.startVnet()
                    })
                } else {
                    this.setState({
                        start_loading: false,
                        stop_loading: false
                    })
                    message.error(intl.get('gateway.accessKey_creation_failed'))
                }
            })
        }
    }
    sendKeepAlive = () =>{
        const { mqtt } = this.props;
        const message = {
            id: 'keep_alive/' + new Date() * 1,
            enable_heartbeat: true,
            heartbeat_timeout: 60,
            gate_sn: this.props.gateway,
            auth_code: this.state.auth_code
        };
        mqtt && mqtt.client && mqtt.client.connected && mqtt.client.publish('v1/vnet/api/keep_alive', JSON.stringify(message))
    }
    getStatus = ()=>{
        const { mqtt } = this.props;
        if (mqtt.client) {
            mqtt.connect(this.props.gateway, 'v1/vnet/#', true)
        }
        const data = {
            id: 'checkenv' + new Date() * 1
        }
        mqtt && mqtt.client && mqtt.client.connected && mqtt.client.publish('v1/vnet/api/checkenv', JSON.stringify(data))
        http.get('/api/gateway_devf_data?gateway=' + this.props.gateway + '&name=' + this.props.gateway + '.freeioe_Vnet').then(res=>{
            if (res.ok){
                if (res.data && res.data.length > 0) {
                    res.data.map(item=>{
                        if (item.name === 'lan_ip') {
                            if (!this.state.pingIP) {
                                this.setState({lan_ip: item.pv, pingIP: item.pv})
                            } else {
                                this.setState({lan_ip: item.pv})
                            }
                                if (!this.state.tap_ip){
                                    if (item.pv){
                                        const tap_ip = item.pv.split('.', 3).join('.') + '.' + parseInt(Math.random() * 200 + 10, 10)
                                        this.setState({
                                            tap_ip
                                        })
                                    }
                                }
                        }
                        if (item.name === 'router_run') {
                            this.setState({router_run: item.pv})
                        }
                        if (item.name === 'bridge_run') {
                            this.setState({bridge_run: item.pv})
                        }
                        if (item.name === 'bridge_config') {
                            this.setState({bridge_config: item.pv})
                        }
                        if (item.name === 'router_config') {
                            this.setState({router_config: item.pv})
                        }
                    })
                }
            }
        })
        if (mqtt.client && mqtt.vnet_channel.is_running) {
            setTimeout(() => {
                this.setState({stop_loading: false})
            }, 3000);
        }
        if (mqtt.client && !mqtt.vnet_channel.is_running) {
            setTimeout(() => {
                this.setState({start_loading: false})
            }, 3000);
        }
    }

    stopVnet () {
        const {mqtt} = this.props;
        const {vnet_config} = mqtt.vnet_channel;
        const data = {
            id: 'stop_vnet/' + new Date() * 1,
            vnet_cfg: {
                dest_ip: vnet_config.dest_ip,
                gate_sn: vnet_config.gate_sn,
                net_mode: vnet_config.net_mode,
                net_protocol: vnet_config.net_protocol,
                node: vnet_config.node,
                tap_ip: vnet_config.tap_ip,
                tap_netmask: vnet_config.tap_netmask
            }
        }
        const postData = {
            id: 'post_gate/' + new Date() * 1,
            auth_code: this.state.auth_code,
            output: 'vnet_stop'
        }
        mqtt && mqtt.client && mqtt.client.connected && mqtt.client.publish('v1/vnet/api/service_stop', JSON.stringify(data))
        mqtt && mqtt.client && mqtt.client.connected && mqtt.client.publish('v1/vnet/api/post_gate', JSON.stringify(postData))
    }
    getDate = (record) =>{
        if (record.id){
            const id = record.id;
            const timeStamp = Number(id.split('/')[1]);
            const date = new Date(timeStamp)
            const Hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            const time = Hours + ':' + minutes + ':' + seconds;
            return time
        }
    }
    settimer = (val) =>{
        this.setState({
            timer: val
        })
    }
    render () {
        const { mqtt } = this.props;
        const { is_running } = this.props.mqtt.vnet_channel;
        const {start_loading, stop_loading, model, isShow} = this.state;
        return (
            <div className="VPN">
                <h2>{intl.get('gateway.Remote_programming-network')}</h2>
                <div className="help_button">
                    <Button
                        icon="question-circle"
                        // style={{marginLeft: '27px', marginBottom: '4px'}}
                        onClick={()=>{
                            window.open('https://wiki.freeioe.org/doku.php?id=apps:APP00000135', '_blank')
                        }}
                    >{intl.get('header.help')}</Button>
                </div>
                <div className="vnetVserState">
                    <ServiceState
                        mqtt={this.props.mqtt}
                        gateway={this.props.match.params.sn}
                        settimer={this.settimer}
                    />
                </div>
                <div className="VPNLeft">
                    <p className="vnet_title">{intl.get('gateway.operation_parameters')}</p>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.gateway_state')}：</p>
                        <Input
                            value={this.props.store.gatewayInfo.device_status}
                        />
                    </div>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.network_mode')}：</p>
                        <Button
                            type={this.state.model === 'bridge' ? 'primary' : ''}
                            disabled={is_running}
                            onClick={()=>{
                                if (this.state.tap_ip) {
                                    const Num = this.state.tap_ip.split('.', 3).join('.') + '.' + parseInt(Math.random() * 200 + 10, 10);
                                    this.setState({model: 'bridge', port: '665', tap_ip: Num})
                                }
                            }}
                        >{intl.get('gateway.bridging_mode')}</Button>
                        <Button
                            type={this.state.model === 'router' ? 'primary' : ''}
                            disabled={is_running}
                            onClick={()=>{
                                if (this.state.tap_ip) {
                                    const Num = this.state.tap_ip.split('.', 3).join('.') + '.0';
                                    this.setState({model: 'router', port: '666', tap_ip: Num})
                                }
                            }}
                        >{intl.get('gateway.routing_mode')}</Button>
                    </div>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.transport_protocol')}：</p>
                        <Button
                            type={this.state.agreement === 'tcp' ? 'primary' : ''}
                            disabled={is_running}
                            onClick={()=>{
                                this.setState({agreement: 'tcp'})
                            }}
                        >tcp</Button>
                        <Button
                            type={this.state.agreement === 'kcp' ? 'primary' : ''}
                            disabled={is_running}
                            onClick={()=>{
                                this.setState({agreement: 'kcp'})
                            }}
                        >kcp</Button>
                    </div>
                    <div className="VPNlist">
                        <p>
                            {
                                model === 'bridge'
                                ? `${intl.get('gateway.virtual_network_card_IP')}:`
                                : intl.get('gateway.target_host_network')
                            }
                        </p>
                        <Input
                            ref="tap_ip"
                            value={this.state.tap_ip}
                            disabled={is_running}
                            className="shit1"
                            onChange={(record)=>{
                                this.setState({tap_ip: record.target.value})
                            }}
                        />
                    </div>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.subnet_mask')}:</p>
                        <Select
                            defaultValue="255.255.255.0"
                            disabled={is_running}
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
                    </div>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.gateway_IP')}：</p>
                        <Input
                            value={this.state.lan_ip}
                            disabled
                            style={{marginRight: 15}}
                        />
                    </div>
                    <div className="VPNlist">
                        <p>{intl.get('gateway.ping_target_IP')}：</p>
                        <Input
                            value={this.state.pingIP}
                            style={{marginRight: 15}}
                            disabled={is_running}
                            onChange={(record)=>{
                                this.setState({
                                    pingIP: record.target.value
                                })
                            }}
                        />
                    </div>
                    {
                        !is_running
                        ? <Button
                            className="btn"
                            type="primary"
                            loading={start_loading}
                            disabled={!(mqtt.vserial_channel.serviceNode && mqtt.vserial_channel.serviceNode.length > 0 && this.state.timer !== undefined && !this.state.timer)}
                            style={{fontSize: 24, height: 50}}
                            onClick={()=>{
                                this.setState({
                                    start_loading: true,
                                    stop_loading: false
                                }, ()=>{
                                    this.startVnet()
                                })
                            }}
                          >{intl.get('gateway.start_up')}</Button>
                    : <Button
                        className="btn"
                        type="danger"
                        loading={stop_loading}
                        style={{fontSize: 24, height: 50}}
                        onClick={()=>{
                            this.setState({
                                start_loading: false,
                                stop_loading: true
                            }, ()=>{
                                this.stopVnet()
                            })
                        }}
                      >{intl.get('gateway.stop')}</Button>
                    }
                </div>
                <div className="VPNRight">
                    {/* <div className="VPNlist">
                        <p>
                            本地运行环境：
                        </p>
                        <span>{mqtt.connected ? '运行环境正常' : '运行环境异常'}</span>
                    </div> */}
                    <p className="vnet_title">{intl.get('gateway.running_state')}</p>
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.local_connection_status')}：
                        </p>
                        <span>{is_running ? intl.get('gateway.normal') : '------'}</span>
                        <div
                            className="statusDetail"
                            style={{cursor: 'pointer', color: '#ccc'}}
                            onMouseOver={()=>{
                                this.setState({isShow: true})
                            }}
                            onMouseOut={()=>{
                                this.setState({isShow: false})
                            }}
                        >{intl.get('gateway.detail')}</div>
                        <div
                            className="isShow"
                        >
                            {
                                isShow
                                ? <Table
                                    size="small"
                                    columns={columns}
                                    dataSource={this.props.mqtt.vnet_channel.Service}
                                    rowKey="name"
                                    pagination={false}
                                  />
                                : ''
                            }
                        </div>
                    </div>
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.cloud_tunnel_status')}：
                        </p>
                        <span>{
                            is_running ? mqtt.vnet_channel.serviceState && mqtt.vnet_channel.serviceState.cur_conns && parseInt(mqtt.vnet_channel.serviceState.cur_conns) > 0 ? intl.get('gateway.normal') : intl.get('gateway.abnormal') : '------'
                            }</span>
                    </div>
                    {
                        model === 'bridge'
                        ? <div className="VPNlist">
                            <p>
                                {intl.get('gateway.gateway_tunnel_status')}：
                            </p>
                            <span>{this.state.bridge_run === 'running' ? intl.get('gateway.normal') : intl.get('gateway.abnormal')}</span>
                        </div>
                        : <div className="VPNlist">
                            <p>
                            {intl.get('gateway.gateway_tunnel_status')}：
                        </p>
                        <span>{this.state.router_run}</span>
                        </div>
                    }
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.starting_time_of_this_time')}：
                        </p>
                        <span>{
                            is_running ? mqtt.vnet_channel.serviceState && mqtt.vnet_channel.serviceState.last_start_time ? mqtt.vnet_channel.serviceState.last_start_time : '------' : '------'
                        }</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.Todays_traffic_consumption')}：
                        </p>
                        <span>{
                            is_running ? mqtt.vnet_channel.serviceState && mqtt.vnet_channel.serviceState.today_traffic_in && mqtt.vnet_channel.serviceState.today_traffic_out ? Math.ceil((mqtt.vnet_channel.serviceState.today_traffic_in + mqtt.vnet_channel.serviceState.today_traffic_out) / 1024) + ' KB' : '0KB' : '------'
                        }</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.ping_target_IP_status')}：
                        </p>
                        <span>{is_running ? mqtt.vnet_channel.serviceState && mqtt.vnet_channel.serviceState.message ? mqtt.vnet_channel.serviceState.message === 'online' ? intl.get('gateway.normal') : intl.get('gateway.abnormal') : '------' : '------'}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            {intl.get('gateway.ping_target_IP_latency')}：
                        </p>
                        <span>{is_running ? mqtt.vnet_channel.serviceState && mqtt.vnet_channel.serviceState.delay ? mqtt.vnet_channel.serviceState.delay : '------' : '------'}</span>
                    </div>
                </div>
                <div className="vnet_message">
                    <p className="vnet_title">{intl.get('gateway.news')}</p>
                    <span className="vnet_remove_message">
                        <Button
                            onClick={()=>{
                                mqtt.vnet_message = []
                            }}
                        >{intl.get('gateway.eliminate')}</Button>
                    </span>
                    <div>
                    <Collapse
                        expandIconPosition="right"
                    >
                        <Panel
                            header={intl.get('gateway.message_list')}
                            key="1"
                        >
                        {
                            mqtt.vnet_message && mqtt.vnet_message.length > 0 && mqtt.vnet_message.map((item, key) => {
                                return (
                                    <div
                                        key={key}
                                        className="vnet_message_item"
                                    >
                                        {intl.get('common.time')}:
                                        {this.getDate(item)}
                                        <br />
                                        {intl.get('appitems.content')}:
                                        <JSONPretty
                                            id="json-pretty"
                                            data={JSON.stringify(item)}
                                        ></JSONPretty>
                                    </div>
                                )
                            })
                        }
                        </Panel>
                    </Collapse>
                    </div>
                </div>
            </div>
        );
    }
}

export default VPN;