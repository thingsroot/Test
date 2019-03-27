import React, { Component } from 'react';
import { Card, Button, Switch, message, InputNumber, Icon } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import http from '../../../utils/Server';
import echarts from 'echarts/lib/echarts';
import  'echarts/lib/chart/line';
import  'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import './style.scss';
@withRouter
@inject('store')
@observer
class LinkStatus extends Component {
    state = {
        data: [],
        newdata: [],
        loading: true,
        sn: this.props.match.params.sn,
        flag: true,
        DATA_UPLOAD_PERIOD: false,
        COV_TTL: false,
        UOLOAD: false,
        iot_beta: 0,
        update: false,
        barData: []
    }
    componentDidMount (){
      this.getData(this.state.sn);

      http.get('/api/method/iot_ui.iot_api.device_event_type_statistics').then(res=>{
        this.setState({
            barData: res.message
        }, ()=>{
            let data1 = [];
            let data2 = [];
            let data3 = [];
            let data4 = [];
            this.state.barData.map((v) =>{
                data1.push(v['系统']);
                data2.push(v['设备']);
                data3.push(v['通讯']);
                data4.push(v['数据']);
            });
            console.log(data2)
            let myFaultTypeChart = echarts.init(document.getElementById('CPU'));
            let memory = echarts.init(document.getElementById('memory'));
            memory.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                // legend: {
                //     data: ['系统', '设备', '通讯', '数据']
                // },
                xAxis: {
                    data: ['Mon Fed 11', 'Mon Fed 13', 'Mon Fed 15', 'Mon Fed 17']
                },
                yAxis: {},
                series: [{
                    name: '系统',
                    type: 'line',
                    color: '#37A2DA',
                    data: data1
                }, {
                    name: '设备',
                    type: 'line',
                    color: '#67E0E3',
                    data: data2
                }, {
                    name: '通讯',
                    type: 'line',
                    color: '#FFDB5C',
                    data: data3
                }, {
                    name: '数据',
                    type: 'line',
                    color: '#FF9F7F',
                    data: data4
                }]
            })
            myFaultTypeChart.setOption({
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                // legend: {
                //     data: ['系统', '设备', '通讯', '数据']
                // },
                xAxis: {
                    data: ['Mon Fed 11', 'Mon Fed 13', 'Mon Fed 15', 'Mon Fed 17']
                },
                yAxis: {},
                series: [{
                    name: '系统',
                    type: 'line',
                    color: '#37A2DA',
                    data: data1
                }, {
                    name: '设备',
                    type: 'line',
                    color: '#67E0E3',
                    data: data2
                }, {
                    name: '通讯',
                    type: 'line',
                    color: '#FFDB5C',
                    data: data3
                }, {
                    name: '数据',
                    type: 'line',
                    color: '#FF9F7F',
                    data: data4
                }]
            })
        })
    })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
      if (nextProps.location.pathname !== this.props.location.pathname){
        const sn = nextProps.match.params.sn;
        this.setState({
            loading: true
        }, ()=>{
            this.getData(sn);
        });
      }
    }
    getData (sn){
      http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
        this.props.store.appStore.setStatus(res.message)
        http.get('/api/method/app_center.api.get_latest_version?app=freeioe&beta=' + res.message.basic.iot_beta).then(data=>{
            this.setState({iot_beta: data.message})
            if (data.message > res.message.config.iot_version){
                http.get('/api/method/app_center.api.get_versions?app=freeioe&beta=' + res.message.basic.iot_beta).then(req=>{
                    const data = req.message.filter(item=>item.version > res.message.config.iot_version)
                    this.setState({newdata: data})
                })
            } else {
                this.setState({newdata: []})
            }
        })
      })
      http.get('/api/method/iot_ui.iot_api.gate_devs_list?sn=' + sn ).then(res=>{
        let data = [];
        data = res.message;
        data.map((item)=>{
            item.ioc = '' + (item.inputs ? item.inputs : '0') + '/' + (item.outputs ? item.outputs : '0') + '/' + (item.commands ? item.commands : '0');
        })
        this.setState({
            data,
            loading: false
        })
    })
    }
    setConfig (record, config){
        console.log(record, config)
    }
    setAutoDisabled (record, config){
        const type = config === 1 ? 'disable' : 'enable';
        // const success = type === 'disable' ? '开启' : '关闭';
        // console.log(success)
        const data = {
            data: config === 0 ? 1 : 0,
            device: this.props.match.params.sn,
            id: `${type}/${this.props.match.params.sn}/${record}/${new Date() * 1}`
        }
        http.postToken('/api/method/iot.device_api.sys_enable_' + record, data).then(res=>{
            http.get('/api/method/iot.device_api.get_action_result?id=' + res.message).then(res=>{
                if (res.message && res.message.result === true){
                    message.success( '操作成功')
                } else {
                    message.error('操作失败')
                }
            })
        })
      }
      restart (url){
          const data = {
              data: 1,
              device: this.props.match.params.sn
          }
          http.postToken('/api/method/iot.device_api.sys_' + url, data).then(res=>{
              console.log(res)
          })
      }
        onChange (value) {
        console.log('changed', value);
      }
      foucus (name){
          this.setState({[name]: true}, ()=>{
            console.log(this.state)
          })
      }
    render () {
        const { status, config, COV_TTL, DATA_UPLOAD_PERIOD } = this.props.store.appStore;
        const { loading, flag, update, newdata } = this.state;
        return (
            <div>
                <div className={flag && !update ? 'linkstatuswrap show flex' : 'linkstatuswrap hide'}>
                    <div style={{ background: '#ECECEC', padding: '30px' }}
                        className="linkstatus"
                    >
                        <div className="setbutton">
                            <Button
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
                            <p><b>位置：</b> -- </p>
                            <p><b>名称：</b>{status.name}</p>
                            <p><b>描述：</b>{status.desc}</p>
                            <p><b>型号：</b>{status.model ? status.model : 'unknown'}</p>
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
                            <p><b>核心软件:</b>{config.skynet_version}</p>
                            <p><b>业务软件:</b>{config.iot_version}{this.state.iot_beta > config.iot_version
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false})
                                }}
                              >发现新版本></Link> : ''}</p>
                            <p><b>公网IP:</b>{config.public_ip}</p>
                            <p><b>调试模式:</b>{status.iot_beta  === 1 ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{config.data_upload === 1 ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{config.stat_upload === 1 ? '开启' : '关闭'}</p>
                            <p><b>日志上传:</b>{config.event_upload}</p>
                            </Card>
                        </div>
                    </div>
                    <div className="rightecharts">
                        <Card className="border">
                            <p>CPU负载</p>
                            <div
                                style={{height: 280, width: 700}}
                                id="CPU"
                            ></div>
                        </Card>
                        <Card className="border">
                            <p>内存负载</p>
                            <div
                                style={{height: 280, width: 700}}
                                id="memory"
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
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        <div className="list">
                            <span>
                                调试模式 [*开启后可安装测试版本软件]
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked={status.iot_beta === 1 ? true : false}
                                onChange={()=>{
                                    this.setAutoDisabled('beta', status.iot_beta)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                数据上传 [*开启后设备数据会传到当前平台]
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked={config.data_upload === 1 ? true : false}
                                onChange={()=>{
                                    this.setAutoDisabled('data', config.data_upload)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                变化数据上送间隔（ms） [*程序会重启]
                            </span>
                            <InputNumber
                                defaultValue={config.data_upload_period}
                                style={{width: 100}}
                                onChange={this.onChange}
                                onFocus={()=>{
                                    this.foucus('DATA_UPLOAD_PERIOD')
                                }}
                            />
                            {DATA_UPLOAD_PERIOD === true ? <Button>保存</Button> : ''}
                        </div>
                        <div className="list">
                            <span>
                                全量数据上送间隔（s） [*程序会重启]
                            </span>
                            <InputNumber
                                defaultValue={config.data_upload_cov_ttl}
                                style={{width: 100}}
                                onChange={this.onChange}
                                onFocus={()=>{
                                    this.foucus('COV_TTL')
                                }}
                            /><Button className={COV_TTL ? 'show' : 'hide'}>保存</Button>
                        </div>
                        <div className="list">
                            <span>
                                统计上传 [*开启后统计数据传到当前平台]
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked={config.stat_upload === 1 ? false : true}
                                onChange={()=>{
                                    this.setAutoDisabled('stat', config.data_upload)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                网络配置
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked={config.Net_Manager}
                                onChange={()=>{
                                    this.setConfig('Net_Manager', config.Net_Manager)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                虚拟网络 [*开启后可建立点对点VPN]
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked={config.ioe_frpc}
                                onChange={()=>{
                                    this.setConfig('ioe_frpc', config.Net_Manager)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                日志上传等级 [*事件上传的最低等级]
                            </span>
                            <InputNumber
                                defaultValue={config.event_upload}
                                max={99}
                                style={{width: 100}}
                                onChange={this.onChange}
                                onFocus={()=>{
                                    this.foucus('UOLOAD')
                                }}
                            />
                            {/* <Button>保存</Button> */}
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
                                            <h3>FreeIoe</h3>
                                            <p>{config.iot_version < this.state.iot_beta ? <span>{config.iot_version} -> {this.state.iot_beta}</span> : <span>{this.state.iot_beta}</span>}</p>
                                            <span>{config.iot_version === this.state.iot_beta ? '已经是最新版' : '可升级到最新版'}</span>
                                        </div>
                                    </div>
                                    {
                                        config.iot_version < this.state.iot_beta
                                        ? <Button
                                            onClick={()=>{
                                                console.log(this.state.data)
                                                const data = {
                                                    data: {
                                                        no_ack: 1
                                                    },
                                                    device: this.props.match.params.sn,
                                                    id: `sys_upgrade/${this.props.match.params.sn}/ ${new Date() * 1}`
                                                }
                                                http.postToken('/api/method/iot.device_api.sys_upgrade', data).then(res=>{
                                                    console.log(res)
                                                })
                                            }}
                                          >升级更新</Button> : <Button>检查更新</Button>
                                    }
                        </div>
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
                </div>
            </div>
        );
    }
}

export default LinkStatus;