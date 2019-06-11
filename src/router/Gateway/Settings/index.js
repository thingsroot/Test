import React, { Component } from 'react';
import { Card, Button, Switch, message, InputNumber } from 'antd';
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

function getMin (i, date) {
    let Dates = new Date(date - i * 60000)
    let min = Dates.getMinutes();
    if (min < 10){
      return '0' + min
    } else {
      return min;
    }
  }
@withRouter
@inject('store')
@observer
class GatewaySettings extends Component {
    state = {
        title: '',
        config: {},
        address: '',
        opendata: [],
        newdata: [],
        loading: true,
        gateway: '',
        upgrading: false,
        flag: true,
        DATA_UPLOAD_PERIOD: false,
        DATA_UPLOAD_PERIOD_VALUE: 0,
        COV_TTL: false,
        COV_TTL_VALUE: 0,
        EVENT_UPLOAD: false,
        EVENT_UPLOAD_VALUE: 0,
        version: 0,
        skynet_version: 0,
        update: false,
        barData: []
    }
    componentDidMount (){
        this.setState({
            gateway: this.props.match.params.sn,
            loading: true
        }, ()=> {
            this.getData();
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.match.params.sn !== this.state.gateway){
            this.setState({
                gateway: nextProps.match.params.sn,
                loading: true
            }, ()=> {
                this.getData();
            })
        }
    }
    componentWillUnmount () {
        window.removeEventListener('resize', this.resize, 20)
        clearInterval(this.timer)
        clearInterval(this.timer1)
    }
    resize () {
        this.myFaultTypeChart1 && this.myFaultTypeChart1.resize();
        this.myFaultTypeChart2 && this.myFaultTypeChart2.resize();
    }
    getData (){
        const { gateway } = this.state;
        http.get(`/api/gateways_historical_data?sn=${gateway}&tag=cpuload&vt=float&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
            let data = [];
            const date = new Date() * 1;
            for (var i = 0;i < 10;i++){
            data.unshift(new Date(date - (i * 60000)).getHours() + ':' + getMin(i, date));
            }
            let myCharts1 = this.refs.cpu
            if (myCharts1) {
                this.myFaultTypeChart1 = echarts.init(myCharts1);
                this.myFaultTypeChart1.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    xAxis: {
                        data: data
                    },
                    yAxis: {},
                    series: [
                    {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        http.get(`/api/gateways_historical_data?sn=${gateway}&tag=mem_used&vt=int&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
            let data = [];
            const date = new Date() * 1;
            for (var i = 0;i < 10;i++){
            data.unshift(new Date(date - (i * 60000)).getHours() + ':' + getMin(i, date));
            }
            let myCharts2 = this.refs.mem
            if (myCharts2) {
                this.myFaultTypeChart2 = echarts.init(myCharts2);
                this.myFaultTypeChart2.setOption({
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    xAxis: {
                        data: data
                    },
                    yAxis: {},
                    series: [
                    {
                        name: '数值',
                        type: 'line',
                        color: '#37A2DA',
                        data: res.data
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        http.get('/api/gateways_read?name=' + gateway).then(res=>{
            if (!res.ok) {
                message.error(res.error)
                return
            }
            let config = res.data;

            this.setState({
                config: config,
                loading: false,
                DATA_UPLOAD_PERIOD_VALUE: config.data.data_upload_period,
                COV_TTL_VALUE: config.data.data_upload_cov_ttl,
                EVENT_UPLOAD_VALUE: config.data.event_upload
            }, ()=>{
                const {data} = this.state.config
                http.get('/api/applications_versions_list?app=FreeIOE&beta=' + (data.enable_beta ? 1 : 0)).then(res=>{
                    const arr = [];
                    res.data && res.data.length > 0 && res.data.map(item=>{
                        if (item.version > data.version){
                            if (data.enable_beta){
                                arr.push(item)
                            } else {
                                if (item.beta === 0){
                                    arr.push(item)
                                }
                            }
                        }
                    })
                    this.setState({
                        newdata: arr
                    })
                })
                http.get('/api/applications_versions_list?app=' + data.platform + '_skynet&beta=' + (data.enable_beta ? 1 : 0)).then(res=>{
                    const arr = [];
                    res.data && res.data.length > 0 && res.data.map(item=>{
                        if (item.version > data.skynet_version){
                            if (data.enable_beta){
                                arr.push(item)
                            } else {
                                if (item.beta === 0){
                                    arr.push(item)
                                }
                            }
                        }
                    })
                    this.setState({
                        opendata: arr
                    })
                })
                http.get('/api/applications_versions_latest?app=freeioe&beta=' + (data.enable_beta ? 1 : 0)).then(res=>{
                    this.setState({
                        version: res.data
                    })
                })
                http.get('/api/applications_versions_latest?app=' + data.platform + '_skynet&beta=' + (data.enable_beta ? 1 : 0)).then(res=>{
                    this.setState({
                        skynet_version: res.data
                    })
                })
            })
            axios.get('https://restapi.amap.com/v3/geocode/regeo?key=bac7bce511da6a257ac4cf2b24dd9e7e&location=' + res.longitude + ',' + res.latitude).then(location=>{
                if (location.data.regeocode){
                    this.setState({address: location.data.regeocode.formatted_address});
                } else {
                    this.setState({address: '- -'});
                }
            })
        })
    }
    setConfig (record, config){
        const { gateway } = this.state;
        if (!config) {
            let params = {
                gateway: gateway,
                inst: record,
                app: record ===  'ioe_network' ? 'network_uci' : 'frpc',
                version: 'latest',
                from_web: '1',
                conf: {
                    auto_start: true,
                    enable_web: true
                },
                id: `installapp/${gateway}/${record}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_install', params).then(res=>{
                if (res.ok) {
                    message.info('功能开启请求成功. 等待网关响应!')
                    this.props.store.action.pushAction(res.data, '功能开启', '', params, 30000,  ()=> {
                      this.getData();
                    })
                } else {
                    message.error(res.error)
                }
            })
        } else {
            let params = {
                gateway: gateway,
                inst: record,
                id: `removeapp/${gateway}/${record}/${new Date() * 1}`
            }
            http.post('/api/gateways_applications_remove', params).then(res=>{
                if (res.ok) {
                    message.info('功能关闭请求成功. 等待网关响应!')
                    this.props.store.action.pushAction(res.data, '功能关闭', '', params, 10000,  ()=> {
                      this.getData();
                    })
                } else {
                    message.error(res.error)
                }
            })
        }
    }
    setAutoDisabled (record, config){
        const type = config ? 0 : 1;
        const inst = record === 'beta' ? 'beta' : 'enable';
        const name = record === 'beta' ? 'gateway' : 'name';
        let params = {
            [name]: this.state.gateway,
            [inst]: type
        }
        let title = `开启${record === 'beta' ? '测试模式' : '开机自启'}`
        http.post('/api/gateways_' + record + '_enable', params).then(res=>{
            if (res.ok){
                this.props.store.action.pushAction(res.data, title, '', params, 10000)
            } else {
                message.error(res.error)
            }
        }).catch(err => {
            message.error(err)
        })
    }
    restart (url){
        const { gateway } = this.state;
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
    changeState  = (name)=> {
        // const data = Object.assign(this.state.config, {[name]: !this.state.config[name]});
        const { config } = this.state;
        const data = Object.assign({}, config, {[name]: !config[name]});
        this.setState({
            config: data
        })
    }
    onChange (value, type) {
        this.setState({[type]: value})
    }
    buttonOnclick (value, type){
        const { gateway } = this.state;
        if (type === 'EVENT_UPLOAD'){
            let params = {
                name: gateway,
                min_level: this.state[value],
                id: `enable_event/${this.state.gateway}/min${value}/${new Date() * 1}`
            }
            http.post('/api/gateways_enable_event', params).then(res=>{
                message.success('发送更改事件上送等级请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, '更改事件上送等级', '', params, 5000)
                } else {
                    message.success('发送更改事件上送等级请求失败：' + res.error)
                }
            }).catch(err=>{
                message.success('发送更改事件上送等级请求失败：' + err)
            })
        } else {
            let params = {
                name: gateway,
                data: {
                    [type]: this.state[value]
                },
                id: `set${type}/${gateway}/min${value}/${new Date() * 1}`
            }
            http.post('/api/gateways_cloud_conf', params).then(res=>{
                message.success('更改设置成功请求成功')
                if (res.ok) {
                    this.props.store.action.pushAction(res.data, '更改设置', '', params, 5000)
                } else {
                    message.success('更改设置失败:' + res.error)
                }
            }).catch(err=>{
                message.success('更改设置成功请求失败：' + err)
            })
        }
    }
    render () {
        const { actionEnable } = this.props.store.gatewayInfo;
        const {  upgrading, flag, title, update, config, newdata, opendata, loading
            , DATA_UPLOAD_PERIOD, DATA_UPLOAD_PERIOD_VALUE, COV_TTL, COV_TTL_VALUE, EVENT_UPLOAD, EVENT_UPLOAD_VALUE } = this.state;
        return (
            <div className="settings">
                <div className={flag && !update ? 'linkstatuswrap show flex' : 'linkstatuswrap hide'}>
                    <div style={{ background: '#ECECEC', padding: '30px' }}
                        className="linkstatus"
                    >
                        <div className="setbutton">
                            <Button
                                disabled={!actionEnable}
                                onClick={()=>{
                                    this.setState({update: true})
                                }}
                            >高级设置</Button>
                        </div>
                        <div className="border">
                            <Card title="| 基本信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>序列号：</b>{config.sn}</p>
                            <p><b>位置：</b> {config.address} </p>
                            <p><b>名称：</b>{config.dev_name}</p>
                            <p><b>描述：</b>{config.description}</p>
                            <p><b>型号：</b>{config.model ? config.model : 'Q102'}</p>
                            </Card>
                            <Card title="| 配置信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>CPU:</b>{config.cpu}</p>
                            <p><b>内存:</b>{config.ram}</p>
                            <p><b>存储:</b>{config.rom}</p>
                            <p><b>操作系统:</b>{config.os}</p>
                            <p><b>核心软件:</b>{config.data && config.data.skynet_version}{this.state.skynet_version > (config.data ? config.data.skynet_version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'openwrt x86_64_skynet'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            <p><b>业务软件:</b>{config.data && config.data.version}{this.state.version >  (config.data ? config.data.version : 0)
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'FreeIOE'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            {/* <p><b>公网IP:</b>{config.public_ip}</p> */}
                            <p><b>调试模式:</b>{config.data && config.data.enable_beta === 1 ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{config.data && config.data.data_upload ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{config.data && config.data.stat_upload ? '开启' : '关闭'}</p>
                            <p><b>日志上传:</b>{config.data && config.data.event_upload}</p>
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
                <div className={flag && update === true ? 'linkstatuswrap show' : 'linkstatuswrap hide'}>
                    <Card
                        title="高级设置"
                        extra={
                            <Button
                                onClick={()=>{
                                    this.setState({flag: true, update: false})
                                }}
                            >X</Button>}
                        // loading={loading}
                        style={{ width: '100%' }}
                    >
                        <div className="list">
                            <span>
                                调试模式 [*开启后可安装测试版本软件]
                            </span>
                            <Switch
                                checkedChildren="ON&nbsp;"
                                unCheckedChildren="OFF"
                                checked={config.data && config.data.enable_beta === 1}
                                onChange={()=>{
                                    this.setAutoDisabled('beta', config.data.enable_beta === 1)
                                    config.data.enable_beta = config.data.enable_beta === 1 ? 0 : 1
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                数据上传 [*开启后设备数据会传到当前平台]
                            </span>
                            <Switch
                                checkedChildren="ON&nbsp;"
                                unCheckedChildren="OFF"
                                checked={config.data && config.data.data_upload}
                                onChange={()=>{
                                    this.changeState('data_upload')
                                    this.setAutoDisabled('data', config.data.data_upload)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                变化数据上送间隔（ms） [*程序会重启]
                            </span>
                            <div style={{position: 'relative'}}>
                                <InputNumber
                                    min={0}
                                    value={DATA_UPLOAD_PERIOD_VALUE}
                                    style={{width: 100}}
                                    onChange={(value)=>{
                                        this.onChange(value, 'DATA_UPLOAD_PERIOD_VALUE')
                                    }}
                                    onFocus={()=>{
                                        this.setState({DATA_UPLOAD_PERIOD: true})
                                    }}
                                />
                                {
                                    DATA_UPLOAD_PERIOD
                                    ? <Button
                                        style={{
                                            position: 'absolute',
                                            right: -70,
                                            marginLeft: 66,
                                            top: 9
                                        }}
                                        onClick={()=>{
                                            this.buttonOnclick('DATA_UPLOAD_PERIOD_VALUE', 'DATA_UPLOAD_PERIOD')
                                            this.setState({DATA_UPLOAD_PERIOD: false})
                                        }}
                                      >保存</Button>
                                    : ''
                                }
                            </div>
                        </div>
                        <div className="list">
                            <span>
                                全量数据上送间隔（s） [*程序会重启]
                            </span>
                            <div style={{position: 'relative'}}>
                                <InputNumber
                                    value={COV_TTL_VALUE}
                                    min={0}
                                    style={{width: 100}}
                                    onChange={(value)=>{
                                        this.onChange(value, 'COV_TTL_VALUE')
                                    }}
                                    onFocus={()=>{
                                        this.setState({COV_TTL: true})
                                    }}
                                />
                                {
                                    COV_TTL
                                    ? <Button
                                        style={{
                                            position: 'absolute',
                                            right: -70,
                                            marginLeft: 66,
                                            top: 9
                                        }}
                                        onClick={()=>{
                                            this.buttonOnclick('COV_TTL_VALUE', 'COV_TTL')
                                            this.setState({COV_TTL: false})
                                        }}
                                      >保存</Button>
                                    : ''
                                }
                            </div>
                        </div>
                        <div className="list">
                            <span>
                                统计上传 [*开启后统计数据传到当前平台]
                            </span>
                            <Switch
                                checkedChildren="ON&nbsp;"
                                unCheckedChildren="OFF"
                                checked={config.data && config.data.stat_upload}
                                onChange={()=>{
                                    this.changeState('stat_upload');
                                    this.setAutoDisabled('stat', config.data.stat_upload)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                网络配置
                            </span>
                            <Switch
                                checkedChildren="ON&nbsp;"
                                unCheckedChildren="OFF"
                                checked={config.ioe_network}
                                onChange={()=>{
                                    this.changeState('ioe_network');
                                    this.setConfig('ioe_network', config.ioe_network)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                虚拟网络 [*开启后可建立点对点VPN]
                            </span>
                            <Switch
                                checkedChildren="ON&nbsp;"
                                unCheckedChildren="OFF"
                                checked={config.ioe_frpc}
                                onChange={()=>{
                                    this.changeState('ioe_frpc');
                                    this.setConfig('ioe_frpc', config.ioe_frpc)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                事件上传等级 [*事件上传的最低等级]
                            </span>
                            <div style={{position: 'relative'}}>
                                <InputNumber
                                    value={EVENT_UPLOAD_VALUE}
                                    min={0}
                                    style={{width: 100}}
                                    onChange={(value)=>{
                                        this.onChange(value, 'EVENT_UPLOAD_VALUE')
                                    }}
                                    onFocus={()=>{
                                        this.setState({EVENT_UPLOAD: true})
                                    }}
                                />
                                {
                                    EVENT_UPLOAD
                                    ? <Button
                                        style={{
                                            position: 'absolute',
                                            right: -70,
                                            marginLeft: 66,
                                            top: 9
                                        }}
                                        onClick={()=>{
                                            this.buttonOnclick('EVENT_UPLOAD_VALUE', 'EVENT_UPLOAD')
                                            this.setState({EVENT_UPLOAD: false})
                                        }}
                                      >保存</Button>
                                    : ''
                                }
                            </div>
                        </div>
                        <div className="list">
                            <span>
                                重启FreeIOE [*FreeIOE重启会导致5秒左右的离线]
                            </span>
                            <Button
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
                                onClick={()=>{
                                    this.restart('reboot')
                                }}
                            >网关重启</Button>
                        </div>
                    </Card>
            </div>
                <div className={!flag && !update ? 'update show' : 'update hide'}>
                    <Button
                        onClick={()=>{
                            this.setState({update: false, flag: true})
                        }}
                    >X</Button>
                    <Upgrade
                        config={config}
                        title={title}
                        upgrading={upgrading}
                        version={this.state.version}
                        skynet_version={this.state.skynet_version}
                        version_data={newdata}
                        skynet_version_data={opendata}
                        onUpgrade={()=>{
                            this.setState({upgrading: true})
                            const data = config.data && config.data.skynet_version < this.state.skynet_version
                            ? {
                                name: config.sn,
                                skynet_version: this.state.skynet_version,
                                version: this.state.version,
                                no_ack: 1,
                                id: `sys_upgrade/${config.sn}/${new Date() * 1}`
                            }
                            : {
                                name: config.sn,
                                version: this.state.version,
                                no_ack: 1,
                                id: `sys_upgrade/${config.sn}/${new Date() * 1}`
                            }
                            http.post('/api/gateways_upgrade', data).then(res=>{
                                if (res.ok) {
                                    this.props.store.action.pushAction(res.data, '网关固件升级', '', data, 10000,  (result)=> {
                                        if (result.ok){
                                            this.setState({update: false, flag: true})
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
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default GatewaySettings;