import React, { Component } from 'react';
import { Card, Button, message } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import http from '../../../utils/Server';
import axios from 'axios';
import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import './style.scss';

import Upgrade from './Upgrade'
import SettingsEdit from './Edit'

@withRouter
@inject('store')
@observer
class GatewaySettings extends Component {
    state = {
        title: '',
        skynet_version_list: [],
        skynet_latest_version: 0,
        freeioe_version_list: [],
        freeioe_latest_version: 0,
        loading: true,
        gateway: '',
        upgrading: false,
        showUpgrade: false,
        showEdit: false
    }
    componentDidMount (){
        this.setState({
            gateway: this.props.gateway,
            loading: true
        }, ()=> {
            this.getAllData();
            this.timer = setInterval(() => {
                this.fetchUpdate()
            }, 10000);
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway){
            this.setState({
                gateway: nextProps.gateway,
                loading: true
            }, ()=> {
                this.getAllData();
            })
        }
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.resize, 20)
        clearInterval(this.timer)
    }
    resize () {
        this.myFaultTypeChart1 && this.myFaultTypeChart1.resize();
        this.myFaultTypeChart2 && this.myFaultTypeChart2.resize();
    }
    fetchUpdate () {
        this.fetchFreeIOEVersion()
        this.fetchSkynetVersion()
        this.fetchCharts()
    }
    fetchFreeIOEVersion () {
        const { gatewayInfo } = this.props.store;
        http.get('/api/applications_versions_list?app=FreeIOE&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            const arr = [];
            res.data && res.data.length > 0 && res.data.map(item=>{
                if (item.version > gatewayInfo.data.version){
                    if (gatewayInfo.data.enable_beta){
                        arr.push(item)
                    } else {
                        if (item.beta === 0){
                            arr.push(item)
                        }
                    }
                }
            })
            this.setState({
                freeioe_version_list: arr
            })
        })

        http.get('/api/applications_versions_latest?app=freeioe&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            this.setState({
                freeioe_latest_version: res.data
            })
        })
    }
    fetchSkynetVersion () {
        const { gatewayInfo } = this.props.store;
        http.get('/api/applications_versions_list?app=' + gatewayInfo.data.platform + '_skynet&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            const arr = [];
            res.data && res.data.length > 0 && res.data.map(item=>{
                if (item.version > gatewayInfo.data.skynet_version){
                    if (gatewayInfo.data.enable_beta){
                        arr.push(item)
                    } else {
                        if (item.beta === 0){
                            arr.push(item)
                        }
                    }
                }
            })
            this.setState({
                skynet_version_list: arr
            })
        })

        http.get('/api/applications_versions_latest?app=' + gatewayInfo.data.platform + '_skynet&beta=' + (gatewayInfo.data.enable_beta ? 1 : 0)).then(res=>{
            this.setState({
                skynet_latest_version: res.data
            })
        })
    }
    fetchGatewayAddress () {
        const { gatewayInfo } = this.props.store;
        axios.get('https://restapi.amap.com/v3/geocode/regeo?key=bac7bce511da6a257ac4cf2b24dd9e7e&location=' + gatewayInfo.longitude + ',' + gatewayInfo.latitude).then(location=>{
            if (location.data.regeocode){
                gatewayInfo.setDeviceAddress(location.data.regeocode.formatted_address);
            } else {
                gatewayInfo.setDeviceAddress('- -');
            }
        })
    }
    fetchGatewayData () {
        const { gateway } = this.state;
        http.get('/api/gateways_read?name=' + gateway).then(res=>{
            if (res.ok) {
                if (res.data.sn !== this.state.gateway) {
                    console.log('Delayed data arrived!!', res.data, this.state.gateway)
                    return
                }
                this.props.store.gatewayInfo.updateStatus(res.data);
            }
        })
    }
    fetchCharts () {
        const { gateway } = this.state;
        http.get(`/api/gateways_historical_data?sn=${gateway}&vsn=${gateway}&tag=cpuload&vt=float&start=-10m&value_method=raw&_=${new Date() * 1}`).then(res=>{
            let myCharts1 = this.refs.cpu
            if (myCharts1) {
                this.myFaultTypeChart1 = echarts.init(myCharts1);
                this.myFaultTypeChart1.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        formatter: (params) => {
                            let time = echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', params[0].data[0])
                            return `${time} <br />${params[0].seriesName}: ${params[0].data[1]}`
                        }
                    },
                    xAxis: {
                        type: 'time'
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data.map(item=>{
                            return [new Date(item.time), item.value]
                        })
                    }
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        http.get(`/api/gateways_historical_data?sn=${gateway}&vsn=${gateway}&tag=mem_used&vt=int&start=-10m&value_method=raw&_=${new Date() * 1}`).then(res=>{
            let myCharts2 = this.refs.mem
            if (myCharts2) {
                this.myFaultTypeChart2 = echarts.init(myCharts2);
                this.myFaultTypeChart2.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        formatter: (params) => {
                            let time = echarts.format.formatTime('yyyy-MM-dd\nhh:mm:ss', params[0].data[0])
                            return `${time} <br />${params[0].seriesName}: ${params[0].data[1]}`
                        }
                    },
                    xAxis: {
                        type: 'time'
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data.map(item=>{
                            return [new Date(item.time), item.value]
                        })
                    }
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
    }
    getAllData (){
        const { gateway } = this.state;
        http.get('/api/gateways_read?name=' + gateway).then(res=>{
            if (!res.ok) {
                message.error(res.error)
                return
            }
            this.props.store.gatewayInfo.updateStatus(res.data);
            this.setState({loading: false})
            this.fetchFreeIOEVersion()
            this.fetchSkynetVersion()
            this.fetchGatewayAddress()
        })
        this.fetchCharts()
    }
    onGatewayUpgrade () {
        const { gatewayInfo } = this.props.store;
        const { freeioe_latest_version, skynet_latest_version } = this.state;
        this.setState({upgrading: true})
        const data = gatewayInfo.data && gatewayInfo.data.skynet_version < skynet_latest_version
        ? {
            name: gatewayInfo.sn,
            skynet_version: skynet_latest_version,
            version: freeioe_latest_version,
            no_ack: 1,
            id: `sys_upgrade/${gatewayInfo.sn}/${new Date() * 1}`
        }
        : {
            name: gatewayInfo.sn,
            version: freeioe_latest_version,
            no_ack: 1,
            id: `sys_upgrade/${gatewayInfo.sn}/${new Date() * 1}`
        }
        http.post('/api/gateways_upgrade', data).then(res=>{
            if (res.ok) {
                this.props.store.action.pushAction(res.data, '网关固件升级', '', data, 30000,  (result)=> {
                    if (result.ok){
                        this.setState({showUpgrade: false})
                    } else {
                        this.setState({upgrading: false})
                    }
                })
            } else {
                message.error('网关固件升级失败！ 错误:' + res.error)
                this.setState({upgrading: false})
            }
        }).catch((err)=>{
            message.error('网关固件升级失败！ 错误:' + err)
            this.setState({upgrading: false})
        })
    }
    render () {
        const { gatewayInfo } = this.props.store;
        const { upgrading, showUpgrade, title, showEdit, freeioe_version_list, skynet_version_list,
            loading, freeioe_latest_version, skynet_latest_version } = this.state;
        return (
            <div className="settings">
                <div className={!showUpgrade && !showEdit ? 'linkstatuswrap show flex' : 'linkstatuswrap hide'}>
                    <div style={{ background: '#ECECEC', padding: '30px' }}
                        className="linkstatus"
                    >
                        <div className="setbutton">
                            <Button
                                disabled={!gatewayInfo.actionEnable}
                                onClick={()=>{
                                    this.setState({showEdit: true})
                                }}
                            >高级设置</Button>
                        </div>
                        <div className="border">
                            <Card title="| 基本信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>序列号：</b>{gatewayInfo.sn}</p>
                            <p><b>位置：</b> {gatewayInfo.address} </p>
                            <p><b>名称：</b>{gatewayInfo.dev_name}</p>
                            <p><b>描述：</b>{gatewayInfo.description}</p>
                            <p><b>型号：</b>{gatewayInfo.model ? gatewayInfo.model : 'Q102'}</p>
                            </Card>
                            <Card title="| 配置信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>CPU:</b>{gatewayInfo.cpu}</p>
                            <p><b>内存:</b>{gatewayInfo.ram}</p>
                            <p><b>存储:</b>{gatewayInfo.rom}</p>
                            <p><b>操作系统:</b>{gatewayInfo.os}</p>
                            <p><b>核心软件:</b>{gatewayInfo.data && gatewayInfo.data.skynet_version}{skynet_latest_version > (gatewayInfo.data ? gatewayInfo.data.skynet_version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({showUpgrade: true, title: 'openwrt x86_64_skynet'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            <p><b>业务软件:</b>{gatewayInfo.data && gatewayInfo.data.version}{freeioe_latest_version >  (gatewayInfo.data ? gatewayInfo.data.version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({showUpgrade: true, title: 'FreeIOE'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            {/* <p><b>公网IP:</b>{gatewayInfo.public_ip}</p> */}
                            <p><b>调试模式:</b>{gatewayInfo.data && gatewayInfo.data.enable_beta === 1 ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{gatewayInfo.data && gatewayInfo.data.data_upload ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{gatewayInfo.data && gatewayInfo.data.stat_upload ? '开启' : '关闭'}</p>
                            <p><b>日志上传:</b>{gatewayInfo.data && gatewayInfo.data.event_upload}</p>
                            </Card>
                        </div>
                    </div>
                    <div className="rightecharts">
                        <Card className="border">
                            <p>CPU负载</p>
                            <div
                                style={{height: 280, width: '100%', minWidth: 300}}
                                id="CPU"
                                ref="cpu"
                            ></div>
                        </Card>
                        <Card className="border">
                            <p>内存负载</p>
                            <div
                                style={{height: 280, width: '100%', minWidth: 300}}
                                id="memory"
                                ref="mem"
                            ></div>
                        </Card>
                    </div>
                 </div>
                <div className={!showUpgrade && showEdit ? 'linkstatuswrap show' : 'linkstatuswrap hide'}>
                    <SettingsEdit
                        gatewayInfo={gatewayInfo}
                        gateway={this.state.gateway}
                        refreshGatewayData={this.fetchGatewayData}
                        onClose={()=>{
                            this.setState({showEdit: false}, ()=>{
                                this.fetchUpdate()
                            })
                        }}
                    />
            </div>
                <div className={showUpgrade && !showEdit ? 'upgrade show' : 'upgrade hide'}>
                    <Button
                        onClick={()=>{
                            this.setState({showUpgrade: false}, ()=>{
                                this.fetchUpdate()
                            })
                        }}
                    >X</Button>
                    <Upgrade
                        gatewayInfo={gatewayInfo}
                        title={title}
                        upgrading={upgrading}
                        freeioe_latest_version={freeioe_latest_version}
                        skynet_latest_version={skynet_latest_version}
                        version_data={freeioe_version_list}
                        skynet_version_data={skynet_version_list}
                        onUpgrade={()=>{
                            this.onGatewayUpgrade()
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default GatewaySettings;