import React, { Component } from 'react';
import { Card, Button, Switch, message, InputNumber, Icon } from 'antd';
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
class LinkStatus extends Component {
    state = {
        title: '',
        config: {},
        data: [],
        opendata: [],
        newdata: [],
        loading: true,
        sn: this.props.match.params.sn,
        flag: true,
        DATA_UPLOAD_PERIOD: false,
        DATA_UPLOAD_PERIOD_VALUE: 0,
        COV_TTL: false,
        COV_TTL_VALUE: 0,
        UOLOAD: false,
        UOLOAD_VALUE: 0,
        iot_beta: 0,
        use_beta: 0,
        skynet_version: 0,
        update: false,
        barData: []
    }
    componentDidMount (){
      this.getData(this.props.match.params.sn);
    }
    UNSAFE_componentWillReceiveProps (nextProps){
      if (nextProps.location.pathname !== this.props.location.pathname){
        this.setState({
            loading: true
        })
        setTimeout(() => {
        const sn = nextProps.match.params.sn;
            this.getData(sn);
        }, 1000);
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
        http.get(`/api/gateways_historical_data?sn=${this.props.match.params.sn}&tag=cpuload&vt=float&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
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
                        data: res.message
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        http.get(`/api/gateways_historical_data?sn=${this.props.match.params.sn}&tag=mem_used&vt=int&time_condition=time > now() -10m&value_method=raw&group_time_span=5s&_=${new Date() * 1}`).then(res=>{
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
                        data: res.message
                    }
                    ]
                });
                window.addEventListener('resize', this.resize, 20);
                }
        })
        const res = this.props.store.appStore.status;
        axios.get('https://restapi.amap.com/v3/geocode/regeo?key=bac7bce511da6a257ac4cf2b24dd9e7e&location=' + res.longitude + ',' + res.latitude).then(location=>{
                let config = res;
                if (location.data.regeocode){
                    config.address = location.data.regeocode.formatted_address;
                } else {
                    config.address = '- -';
                }
                this.setState({
                    config,
                    loading: false,
                    DATA_UPLOAD_PERIOD_VALUE: this.props.store.appStore.status.data_upload_period,
                    COV_TTL_VALUE: this.props.store.appStore.status.data_upload_cov_ttl,
                    UOLOAD_VALUE: this.props.store.appStore.status.event_upload
                }, ()=>{
                    http.get('/api/applications_versions_list?app=FreeIOE&beta=' + (this.state.config.enable_beta ? 1 : 0)).then(res=>{
                        const arr = [];
                        res.data && res.data.length > 0 && res.data.map(item=>{
                            if (item.version > this.state.config.version){
                                if (config.use_beta){
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
                    http.get('/api/applications_versions_list?app=' + this.state.config.platform + '_skynet&beta=' + (this.state.config.enable_beta ? 1 : 0)).then(res=>{
                        const arr = [];
                        res.data && res.data.length > 0 && res.data.map(item=>{
                            if (item.version > this.state.config.skynet_version){
                                if (config.enable_beta){
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
                })
            })
            this.setState({use_beta: this.state.config.enable_beta}, ()=>{
                http.get('/api/applications_versions_latest?app=freeioe&beta=' + (this.state.config.enable_beta ? 1 : 0)).then(res=>{
                    this.setState({
                        iot_beta: res.data
                    })
                })
                http.get('/api/applications_versions_latest?app=' + this.props.store.appStore.status.platform + '_skynet&beta=' + (this.state.config.enable_beta ? 1 : 0)).then(res=>{
                    this.setState({
                        skynet_version: res.data
                    })
                })
            })
    }
    setConfig (record, config){
        if (!config) {
            http.post('/api/gateways_applications_install', {
                gateway: this.props.match.params.sn,
                inst: record,
                app: record ===  'Network' ? 'network_uci' : 'frpc',
                version: 'latest',
                conf: {
                    auto_start: true,
                    enable_web: true
                },
                id: `installapp/${this.props.match.params.sn}/${record}/${new Date() * 1}`
            }).then(res=>{
                if (res.data){
                    this.timer = setTimeout(() => {
                        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                            if (result.data){
                                if (result.data.result) {
                                    message.success('开启成功')
                                } else {
                                    message.error('开启失败')
                                }
                                clearInterval(this.timer)
                            }
                        })
                    }, 1000);
                }
            })
        } else {
            http.post('/api/gateways_applications_remove', {
                gateway: this.props.match.params.sn,
                inst: record,
                id: `removeapp/${this.props.match.params.sn}/${record}/${new Date() * 1}`
            }).then(res=>{
                if (res.data) {
                    this.timer1 = setTimeout(() => {
                        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                            if (result.data){
                                if (result.data.result) {
                                    message.success('关闭成功')
                                } else {
                                    message.error('关闭失败')
                                }
                                clearInterval(this.timer1)
                            }
                        })
                    }, 1000);
                }
            })
        }
    }
    setAutoDisabled (record, config){
        const type = config ? 0 : 1;
        const inst = record === 'beta' ? 'beta' : 'enable';
        const name = record === 'beta' ? 'gateway' : 'name';
        http.postToken('/api/gateways_' + record + '_enable', {
            [name]: this.state.sn,
            [inst]: type
        }).then(res=>{
            if (res.data){
                this.timer = setTimeout(() => {
                    http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                        if (result.data){
                            if (result.data.result) {
                                message.success(type === 1 ? '开启成功' : '关闭成功')
                                // this.changeState()
                            } else {
                                message.error(type === 1 ? '开启失败' : '关闭失败')
                                // this.changeState()
                            }
                            clearInterval(this.timer)
                        }
                    })
                }, 1000);
            }
        })
      }
      restart (url){
          const data = {
              id: `gateways/${url}/${this.props.match.params.sn}/${new Date() * 1}`,
              name: this.props.match.params.sn
          }
          http.postToken('/api/gateways_' + url, data).then(res=>{
              if (res.ok){
                  message.success('重启成功，请稍等...')
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
          if (type === 'UOLOAD'){
              http.post('/api/gateways_enable_event', {
                  name: this.props.match.params.sn,
                  min_level: this.state[value],
                  id: `enable_event/${this.props.match.params.sn}/min${value}/${new Date() * 1}`
              }).then(res=>{
                this.timer = setTimeout(() => {
                    http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                        if (result.data){
                            if (result.data.result) {
                                message.success('开启成功')
                            } else {
                                message.error('开启失败')
                            }
                            clearInterval(this.timer)
                        }
                    })
                }, 1000);

              })
          } else {
            http.post('/api/gatewyas_cloud_conf', {
                name: this.props.match.params.sn,
                data: {
                    [type]: this.state[value]
                },
                id: `set${type}/${this.props.match.params.sn}/min${value}/${new Date() * 1}`
            }).then(res=>{
                this.timer = setTimeout(() => {
                    http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                        if (result.data){
                            if (result.data.result) {
                                message.success('开启成功')
                            } else {
                                message.error('开启失败')
                            }
                            clearInterval(this.timer)
                        }
                    })
                }, 1000);
            })
          }
      }
    render () {
        const { status, actionSwi } = this.props.store.appStore;
        const {  flag, title, update, config, newdata, opendata, loading, DATA_UPLOAD_PERIOD, DATA_UPLOAD_PERIOD_VALUE, COV_TTL, COV_TTL_VALUE, UOLOAD, UOLOAD_VALUE } = this.state;
        return (
            <div className="setgateway">
                <div className={flag && !update ? 'linkstatuswrap show flex' : 'linkstatuswrap hide'}>
                    <div style={{ background: '#ECECEC', padding: '30px' }}
                        className="linkstatus"
                    >
                        <div className="setbutton">
                            <Button
                                disabled={actionSwi}
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
                            <p><b>序列号：</b>{status.sn}</p>
                            <p><b>位置：</b> {config.address} </p>
                            <p><b>名称：</b>{status.dev_name}</p>
                            <p><b>描述：</b>{status.description}</p>
                            <p><b>型号：</b>{status.model ? status.model : 'Q102'}</p>
                            </Card>
                            <Card title="| 配置信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                loading={loading}
                            >
                            <p><b>CPU:</b>{status.cpu}</p>
                            <p><b>内存:</b>{status.ram}</p>
                            <p><b>存储:</b>{status.rom}</p>
                            <p><b>操作系统:</b>{status.os}</p>
                            <p><b>核心软件:</b>{status.skynet_version}{this.state.skynet_version > status.skynet_version
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'openwrt x86_64_skynet'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            <p><b>业务软件:</b>{status.version}{this.state.iot_beta > status.version
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false, title: 'FreeIOE'})
                                }}
                              >发现新版本></Link> : ''}</p>
                            {/* <p><b>公网IP:</b>{config.public_ip}</p> */}
                            <p><b>调试模式:</b>{status.enable_beta === 1 ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{status.data_upload ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{status.stat_upload ? '开启' : '关闭'}</p>
                            <p><b>日志上传:</b>{status.event_upload}</p>
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
                                checked={status.enable_beta === 1}
                                onChange={()=>{
                                    this.setAutoDisabled('beta', status.enable_beta === 1)
                                    status.enable_beta = status.enable_beta === 1 ? 0 : 1
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
                                checked={config.data_upload}
                                onChange={()=>{
                                    this.changeState('data_upload')
                                    this.setAutoDisabled('data', status.data_upload)
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
                                checked={status.stat_upload}
                                onChange={()=>{
                                    this.changeState('stat_upload');
                                    this.setAutoDisabled('stat', status.stat_upload)
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
                                checked={status.Net_Manager}
                                onChange={()=>{
                                    this.changeState('Net_Manager');
                                    this.setConfig('Network', status.Net_Manager)
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
                                checked={status.p2p_vpn}
                                onChange={()=>{
                                    this.changeState('p2p_vpn');
                                    this.setConfig('ioe_frpc', status.p2p_vpn)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                事件上传等级 [*事件上传的最低等级]
                            </span>
                            <div style={{position: 'relative'}}>
                                <InputNumber
                                    value={UOLOAD_VALUE}
                                    min={0}
                                    style={{width: 100}}
                                    onChange={(value)=>{
                                        this.onChange(value, 'UOLOAD_VALUE')
                                    }}
                                    onFocus={()=>{
                                        this.setState({UOLOAD: true})
                                    }}
                                />
                                {
                                    UOLOAD
                                    ? <Button
                                        style={{
                                            position: 'absolute',
                                            right: -70,
                                            marginLeft: 66,
                                            top: 9
                                        }}
                                        onClick={()=>{
                                            this.buttonOnclick('UOLOAD_VALUE', 'UOLOAD')
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
                    <div>
                        <div className="title">
                                    <p>固件升级</p>
                                    <div>
                                        <div className="Icon">
                                            <Icon type="setting" />
                                        </div>
                                        <div>
                                            <h3>FreeIOE</h3>
                                            <p>
                                                {config.version < this.state.iot_beta
                                                ? <span>{config.version} -> {this.state.iot_beta}</span>
                                                : <span>{this.state.iot_beta}</span>
                                            }</p>
                                        </div>
                                        {
                                            config.skynet_version >= this.state.skynet_version
                                            ? ''
                                            : <div style={{display: 'flex'}}>
                                                    <div className="Icon"
                                                        style={{marginLeft: 100}}
                                                    >
                                                    <Icon type="setting" />
                                                </div>
                                                <div>
                                                    <h3>openwrt x86_64_skynet</h3>
                                                    <p>
                                                        {config.skynet_version < this.state.skynet_version ? <span>{config.skynet_version} -> {this.state.skynet_version}</span> : <span>{this.state.skynet_version}</span>}</p>
                                                    <span>{title === 'FreeIOE' ? config.version === this.state.iot_beta ? '已经是最新版' : '可升级到最新版' : config.skynet_version === this.state.skynet_version ? '已经是最新版' : '可升级到最新版'}</span>
                                                </div>
                                              </div>
                                        }
                                    </div>
                                    {
                                        config.version < this.state.iot_beta || config.skynet_version < this.state.skynet_version
                                        ? <Button
                                            disabled={actionSwi}
                                            onClick={()=>{
                                                const data = config.skynet_version < this.state.skynet_version
                                                ? {
                                                    name: this.props.match.params.sn,
                                                    skynet_version: this.state.skynet_version,
                                                    version: this.state.iot_beta,
                                                    no_ack: 1,
                                                    id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
                                                }
                                                : {
                                                    name: this.props.match.params.sn,
                                                    version: this.state.iot_beta,
                                                    no_ack: 1,
                                                    id: `sys_upgrade/${this.props.match.params.sn}/${new Date() * 1}`
                                                }
                                                http.postToken('/api/gateways_upgrade', data).then(res=>{
                                                    this.timer = setInterval(() => {
                                                        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                                                            if (result.ok){
                                                                message.success('网关固件升级成功')
                                                                clearInterval(this.timer)
                                                            } else {
                                                                message.error('网关固件升级失败，请重试')
                                                                clearInterval(this.timer)
                                                            }
                                                        })
                                                    }, 3000);
                                                })
                                            }}
                                          >升级更新</Button> : <Button>检查更新</Button>
                                    }
                        </div>
                        <div style={{display: 'flex', flexWrap: 'wrap'}}>
                            <div style={{width: '50%', padding: 10, boxSizing: 'border-box'}}>
                            <h1>FreeIOE</h1>
                                {
                                    newdata && newdata.length > 0 && newdata.map((v, i)=>{
                                        return (
                                            <Card
                                                title={`应用名称：${v.app_name}`}
                                                key={i}
                                                style={{marginTop: 10}}
                                            >
                                                <p>版本号：{v.version}</p>
                                                <p>更新内容：{v.comment}</p>
                                                <p>更新时间：{v.modified.split('.')[0]}</p>
                                            </Card>
                                        )
                                    })
                                }
                            </div>
                            <div style={{width: '50%', padding: 10}}>
                            {
                                config.skynet_version < this.state.skynet_version
                                ? <h1>{this.state.config.platform}_skynet</h1>
                                : ''
                            }
                                {
                                    opendata && opendata.length > 0 && opendata.map((v, i)=>{
                                        return (
                                            <Card
                                                title={`应用名称：${v.app_name}`}
                                                key={i}
                                                style={{marginTop: 10}}
                                            >
                                                <p>版本号：{v.version}</p>
                                                <p>更新内容：{v.comment}</p>
                                                <p>更新时间：{v.modified.split('.')[0]}</p>
                                            </Card>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default LinkStatus;