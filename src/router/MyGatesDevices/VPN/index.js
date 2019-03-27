import React, { Component } from 'react';
import { Input, Select, Button, Icon, Table, message } from 'antd';
import { withRouter } from 'react-router-dom';
//import http from '../../../utils/Server';
import { apply_AccessKey } from '../../../utils/Session';
import './style.scss';
const Option = Select.Option;
const columns = [{
    title: '服务名称',
    dataIndex: 'name',
    key: 'name'
  }, {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  }];
  @withRouter
class VPN extends Component {
    state = {
        flag: true,
        arr: [],
        status: 'ONLINE',
        agreement: 'tcp',
        model: 'bridge',
        port: '665',
        auth_code: '',
        ip: 'device ipaddress',
        node: 'hs.symgrid.com',
        virtualIp: '',
        message: {},
        result: {},
        toggleFlag: true,
        gateStatus: ' ',
        chouldstatus: {}
    }
    componentDidMount (){
        this.getStatus()
        this.check_gate_isbusy()
        let auth_code;
        apply_AccessKey().then(res=>{
            auth_code = res;
            this.setState({auth_code})
        });
        this.timer = setInterval(() => {
            this.getStatus()
            this.check_gate_isbusy()
        }, 5000);
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.location.pathname !== nextProps.location.pathname){
            this.setState({result: {}})
        }
    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    onchange = (val)=>{
        this.setState({node: val})
    }
    check_gate_isbusy = () => {
        const sn = this.props.match.params.sn;
        fetch('/apis/gate_isbusy', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                gate_sn: sn,
                cloud_url: 'http://iot.symgrid.com',
                auth_code: this.state.auth_code
            }),
            headers: {
                Accept: 'application/json; charset=utf-8',
                Authorization: 'Bearer 123123123',
                'Access-Control-Allow-Origin': '*'
            }
        }).then(res => {
            return res.json();
        }).then(json => {
            if (json.br_lan_ipv4 !== undefined){
                this.setState({ip: json.br_lan_ipv4})
            }
        }).catch(err => {
            console.log('请求错误', err);
        })
    }
    setIp = ()=>{
        console.log(event.target.value);
        this.setState({virtualIp: event.target.value})
    }
    getStatus = ()=>{
        fetch('/apis/act_result', {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json; charset=utf-8',
                Authorization: 'Bearer 123123123'
            }
        }).then(res => {
            return res.json();
        }).then(json => {
            console.log(json)
            if (this.state.result !== json){
                this.setState({result: {...json}}, ()=>{
                    this.setState()
                })
            }
        }).catch(err => {
            console.log('请求错误', err);
        })

        fetch('/apis/gate_alive', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                auth_code: this.state.auth_code,
                cloud_url: 'http://iot.symgrid.com',
                gate_sn: this.props.match.params.sn
            })
        }).then(res=>{
            return res.json();
        }).then(res=>{
            this.setState({gateStatus: res.message})
        })

        fetch('/apis/status', {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json; charset=utf-8',
                Authorization: 'Bearer 123123123'
            }
        }).then(res => {
            return res.json();
        }).then(json => {
            let arr = [];
            for (var key in json){
                if (json[key] === 'RUNNING' && this.state.toggleFlag){
                    this.setState({ toggleFlag: false})
                }
                arr.push({
                    name: key,
                    status: json[key]
                })
            }
            this.setState({arr})
            if (this.state.flag === true) {
                 this.setState({flag: false})
            }
            return json;
        }).catch(err => {
            err;
            this.setState({flag: true})
        })

        fetch('/apis/cloudstatus', {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                'proxy_stcp': `${this.props.match.params.sn}_${this.state.model}`
            })
        }).then(res=>{
            return res.json()
        }).then(res=>{
            console.log(res)
            if (this.state.chouldstatus !== res[`${this.props.match.params.sn}_${this.state.model}`]){
                this.setState({chouldstatus: res[`${this.props.match.params.sn}_${this.state.model}`]})
            }
        })
    }
    startVPN (){
        const {ip, virtualIp, model, port, agreement, status, auth_code, node} = this.state;
        const { sn } = this.props.match.params;
        const frpc_item = sn + '_' + model;
        const vpn_frpc_cfg = {
            'role': 'visitor',
            'type': 'stcp',
            'server_name': frpc_item,
            'sk': 'password',
            'bind_addr': '127.0.0.1',
            'bind_port': port,
            'use_encryption': 'false',
            'use_compression': 'true'
        }
        const gate_visitor_frpc_cfg = {
            'type': 'stcp',
            'sk': 'password',
            'local_ip': '127.0.0.1',
            'local_port': port,
            'use_encryption': 'false',
            'use_compression': 'true'
        }
        let gate_frpc_cfg = {'visitors': {}}
        gate_frpc_cfg['visitors'][model] = gate_visitor_frpc_cfg;

        const postinfo = {
            'gate_sn': sn,
            'cloud_url': 'http://iot.symgrid.com',
            'auth_code': auth_code,
            'vpn_cfg': {
                'net_mode': model,
                'tap_ip': virtualIp,
                'tap_netmask': node,
                'dev_ip': ip
            },
            'common': {
                'admin_addr': '127.0.0.1',
                'admin_port': '7402',
                'server_addr': 'iot.symgrid.com',
                'server_port': '5443',
                'token': 'BWYJVj2HYhVtdGZL',
                'protocol': agreement,
                'login_fail_exit': 'false'
            },

            'gate_frpc_cfg': gate_frpc_cfg,
            'local_frp_cfg': {
                'proxycfg': {

                }

            }

        }
        postinfo['local_frp_cfg']['proxycfg'][frpc_item] = vpn_frpc_cfg;
        if (ip === 'device ipaddress'){
            message.error('未获取到网关IP地址')
        } else if (status !== 'ONLINE'){
            message.error('网关未在线')
        } else if (virtualIp === ''){
            message.error('请输入网卡IP地址')
        } else {
            fetch('/apis/start', {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify(postinfo),
                headers: {
                    Accept: 'application/json; charset=utf-8',
                    Authorization: 'Bearer 123123123'
                }
            }).then(res => {
                return res.json();
            }).then(() => {
                setTimeout(() => {
                    fetch('/apis/act_result', {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            Accept: 'application/json; charset=utf-8',
                            Authorization: 'Bearer 123123123'
                        }
                    }).then(res => {
                        return res.json();
                    }).then(json => {
                        console.log(json)
                        this.setState({result: json})
                    }).catch(err => {
                        console.log('请求错误', err);
                    })

                }, 5000);
            }).catch(err => {
                console.log('请求错误', err);
            })
        }
    }
    stopVPN (){
        fetch('/apis/stop', {
            method: 'POST',
            mode: 'cors',
            headers: {
                Authorization: 'Bearer 123123123'
            }
        }).then(res => {
            return res.json();
        }).then(json => {
            if (json.message){
                this.setState({message: '停止成功', toggleFlag: true})
            }
        }).catch(err => {
            err;
        })
    }
    render () {
        const { flag, result, chouldstatus } = this.state;
        console.log(message)
        return (
            <div className="VPN">
                <div className="VPNLeft">
                    <div className="VPNlist">
                        <p>中转节点：</p>
                        <Select
                            defaultValue="hs.symgrid.com"
                            disabled={flag}
                            onChange={this.onchange}
                        >
                            <Option value="hs.symgrid.com">上海</Option>
                            <Option value="iot.symgrid.com">北京1</Option>
                            <Option value="vpn.symid.com">北京2</Option>
                        </Select>
                    </div>
                    <div className="VPNlist">
                        <p>网关状态：</p>
                        <Input
                            value={this.state.gateStatus ? this.state.gateStatus : ''}
                            disabled={flag}
                        />
                    </div>
                    <div className="VPNlist">
                        <p>网关SN：</p>
                        <Input
                            value={this.props.match.params.sn}
                            disabled
                        />
                    </div>
                    <div className="VPNlist">
                        <p>连接模式：</p>
                        <Button
                            type="primary"
                            disabled={flag}
                        >虚拟网络</Button>
                    </div>
                    <div className="VPNlist">
                        <p>{this.state.model === 'bridge' ? '虚拟网卡IP' : '现场子网地址'}：</p>
                        <Input
                            disabled={flag}
                            onChange={this.setIp}
                        />
                    </div>
                    <div className="VPNlist">
                        <p>{this.state.model === 'bridge' ? '虚拟网卡netmask' : '现场子网netmask'}：</p>
                        <Select
                            defaultValue="255.255.255.0"
                            disabled={flag}
                        >
                            <Option value="255.255.255.0">255.255.255.0</Option>
                            <Option value="255.255.254.0">255.255.254.0</Option>
                            <Option value="255.255.252.0">255.255.252.0</Option>
                            <Option value="255.255.252.0">255.255.252.0</Option>
                            <Option value="255.255.0.0">255.255.0.0</Option>
                        </Select>
                    </div>
                    <div className="VPNlist">
                        <p>网关IP：</p>
                        <Input
                            value={this.state.ip}
                            disabled
                            style={{marginRight: 15}}
                        />
                        <Button disabled={flag}><Icon type="sync"/></Button>
                    </div>
                    <div className="VPNlist">
                        <p>传输协议：</p>
                        <Button
                            type={this.state.agreement === 'tcp' ? 'primary' : ''}
                            disabled={flag}
                            onClick={()=>{
                                this.setState({agreement: 'tcp'})
                            }}
                        >tcp</Button>
                        <Button
                            type={this.state.agreement === 'kcp' ? 'primary' : ''}
                            disabled={flag}
                            onClick={()=>{
                                this.setState({agreement: 'kcp'})
                            }}
                        >kcp</Button>
                    </div>
                    <div className="VPNlist">
                        <p>网络模式：</p>
                        <Button
                            type={this.state.model === 'bridge' ? 'primary' : ''}
                            disabled={flag}
                            onClick={()=>{
                                this.setState({model: 'bridge', port: '665'})
                            }}
                        >桥接模式</Button>
                        <Button
                            type={this.state.model === 'router' ? 'primary' : ''}
                            disabled={flag}
                            onClick={()=>{
                                this.setState({model: 'router', port: '666'})
                            }}
                        >路由模式</Button>
                    </div>
                    {
                        this.state.toggleFlag
                        ? <Button
                            className="btn"
                            type="primary"
                            disabled={flag}
                            style={{fontSize: 24, height: 50}}
                            onClick={()=>{
                                this.startVPN()
                            }}
                          >启动VPN</Button>
                    : <Button
                        className="btn"
                        type="danger"
                        disabled={flag}
                        style={{fontSize: 24, height: 50}}
                        onClick={()=>{
                            this.stopVPN()
                        }}
                      >停止VPN</Button>
                    }
                    {
                        !this.state.toggleFlag ? <div className="successMessage">
                        <p>平台返回消息：{result.cloud_mes}</p>
                        <p>网关返回消息：{result.gate_mes}</p>
                        <p>本地返回消息：{result.services_mes}</p>
                    </div>
                    : ''
                    }
                </div>
                <div className="VPNRight">
                    <div className="VPNlist">
                        <p>
                            本地运行环境：
                        </p>
                        <span>{!flag ? '运行环境正常' : ''}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            本地服务状态：
                        </p>
                        <span>{!flag ? 'IOE隧道服务运行正常' : <div>无法连接本地服务，请检查freeioe_vpn_Service服务是否启动或者运行环境是否安装，如未安装,
                            <a
                                href="http://thingscloud.oss-cn-beijing.aliyuncs.com/download/freeioe_vpn_green.rar"
                                className="navbar-link"
                            >点击下载</a></div>}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            本地连接状态：
                        </p>
                        <span>{chouldstatus && chouldstatus.cur_conns > 0 ? '已连接' : '未连接'}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            云端隧道名称：
                        </p>
                        <span>{chouldstatus && chouldstatus.name}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            云端隧道状态：
                        </p>
                        <span>{chouldstatus && chouldstatus.status}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            本次启动时间：
                        </p>
                        <span>{chouldstatus && chouldstatus.last_start_time}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            上次消耗流量：
                        </p>
                        <span>{chouldstatus && chouldstatus.today_traffic_in !== undefined ? Math.round((Number(chouldstatus.today_traffic_in) + Number(chouldstatus.today_traffic_out)) / 1024) + 'KB' : ''}</span>
                    </div>
                    <div className="VPNlist">
                        <p>
                            Ping网关IP状态：
                        </p>
                        <span></span>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={this.state.arr}
                        rowKey="name"
                    />
                </div>
            </div>
        );
    }
}

export default VPN;