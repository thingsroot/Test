import React, { Component } from 'react';
import { Card, Button, Switch, message, InputNumber, Icon } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter, Link } from 'react-router-dom';
import http from '../../../utils/Server';
import axios from 'axios';
// import echarts from 'echarts/lib/echarts';
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
        config: {},
        data: [],
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
        update: false,
        barData: []
    }
    componentDidMount (){
      this.getData(this.props.match.params.sn);
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
        http.get('/api/gateways_read?name=' + sn).then(res=>{
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
                    DATA_UPLOAD_PERIOD_VALUE: config.data_upload_period,
                    COV_TTL_VALUE: config.data_upload_cov_ttl,
                    UOLOAD_VALUE: config.event_upload
                })
            })
        })
        http.get('/api/gateways_beta_read?gateway=' + sn).then(res=>{
            this.setState({use_beta: res.data.use_beta === 1})
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
                    setTimeout(() => {
                        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                            console.log(result)
                            if (result.data.result) {
                                message.success('开启成功')
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
                    setTimeout(() => {
                        http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                            console.log(result)
                            if (result.data.result) {
                                message.success('关闭成功')
                            }
                        })
                    }, 1000);
                }
            })
        }
        console.log(record, config)
    }
    setAutoDisabled (record, config){
        console.log(config)
        const type = config ? 0 : 1;
        const inst = record === 'beta' ? 'beta' : 'enable';
        const name = record === 'beta' ? 'gateway' : 'name';
        http.postToken('/api/gateways_' + record + '_enable', {
            [name]: this.state.sn,
            [inst]: type
        }).then(res=>{
            if (res.data){
                http.get('/api/gateways_exec_result?id=' + res.data).then(result=>{
                     if (result.data.result){
                        const text = config ? '关闭' + record + '模式成功' : '开启' + record + '模式成功'
                        message.success(text)
                     }
                })
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
          console.log(this)
          const data = Object.assign({}, config, {[name]: !config[name]});
          console.log(data)
        this.setState({
            config: data
        }, ()=>{
            console.log(this.state.config)
        })
      }
        onChange (value, type) {
            this.setState({[type]: value})
        console.log('changed', value, type);
      }
      buttonOnclick (value, type){
          console.log(value, type)
          if (type === 'UOLOAD'){
              http.post('/api/gateways_enable_event', {
                  name: this.props.match.params.sn,
                  min_level: this.state[value],
                  id: `enable_event/${this.props.match.params.sn}/min${value}/${new Date() * 1}`
              }).then(res=>{
                  console.log(res);

              })
          } else {
            http.post('/api/gatewyas_cloud_conf', {
                name: this.props.match.params.sn,
                data: {
                    [type]: this.state[value]
                },
                id: `set${type}/${this.props.match.params.sn}/min${value}/${new Date() * 1}`
            })
          }
      }
    render () {
        const { status } = this.props.store.appStore;
        const {  flag, update, config, newdata, use_beta, loading, DATA_UPLOAD_PERIOD, DATA_UPLOAD_PERIOD_VALUE, COV_TTL, COV_TTL_VALUE, UOLOAD, UOLOAD_VALUE } = this.state;
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
                            <p><b>位置：</b> {config.address} </p>
                            <p><b>名称：</b>{config.dev_name}</p>
                            <p><b>描述：</b>{config.description}</p>
                            <p><b>型号：</b>{config.model ? config.model : 'Q102'}</p>
                            </Card>
                            <Card title="| 配置信息"
                                bordered={false}
                                style={{ width: '100%' }}
                                // loading={loading}
                            >
                            <p><b>CPU:</b>{config.cpu}</p>
                            <p><b>内存:</b>{config.ram}</p>
                            <p><b>存储:</b>{config.rom}</p>
                            <p><b>操作系统:</b>{config.os}</p>
                            <p><b>核心软件:</b>{config.skynet_version}</p>
                            <p><b>业务软件:</b>{config.version}{this.state.iot_beta > config.version
                            ? <Link
                                to="#"
                                style={{marginLeft: 200}}
                                onClick={()=>{
                                    this.setState({update: false, flag: false})
                                }}
                              >发现新版本></Link> : ''}</p>
                            {/* <p><b>公网IP:</b>{config.public_ip}</p> */}
                            <p><b>调试模式:</b>{config.use_beta ? '开启' : '关闭'}</p>
                            <p><b>数据上传:</b>{config.data_upload ? '开启' : '关闭'}</p>
                            <p><b>统计上传:</b>{config.stat_upload ? '开启' : '关闭'}</p>
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
                        // loading={loading}
                        style={{ width: '100%' }}
                    >
                        <div className="list">
                            <span>
                                调试模式 [*开启后可安装测试版本软件]
                            </span>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                checked={config.use_beta}
                                onChange={()=>{
                                    //this.setState({use_beta: !this.state.use_beta})
                                    this.changeState('use_beta');
                                    this.setAutoDisabled('beta', use_beta)
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
                                checked={config.data_upload}
                                onChange={()=>{
                                    this.changeState('data_upload')
                                    this.setAutoDisabled('data', config.data_upload)
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
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                checked={config.stat_upload}
                                onChange={()=>{
                                    this.changeState('stat_upload');
                                    this.setAutoDisabled('stat', config.stat_upload)
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
                                checked={config.Net_Manager}
                                onChange={()=>{
                                    console.log(this)
                                    this.changeState('Net_Manager');
                                    this.setConfig('Network', config.Net_Manager)
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
                                checked={config.p2p_vpn}
                                onChange={()=>{
                                    this.changeState('p2p_vpn');
                                    this.setConfig('ioe_frpc', config.p2p_vpn)
                                }}
                            />
                        </div>
                        <div className="list">
                            <span>
                                日志上传等级 [*事件上传的最低等级]
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