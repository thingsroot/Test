import { Button, Select, Table, message, Modal, Tooltip } from 'antd';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import ServiceState from '../../../common/ServiceState';
import Logviewer from './Logview';
import http from '../../../utils/Server';
import './style.scss';
import {_getCookie} from '../../../utils/Session';
const Option = Select.Option;
const cloums = [
    {
        title: '服务名称',
        dataIndex: 'name',
        key: 'name'
    }, {
        title: '服务描述',
        dataIndex: 'desc',
        key: 'desc'
    }, {
        title: '服务状态',
        dataIndex: 'status',
        key: 'status'
    }
]
const { confirm } = Modal;
function showConfirm (name, path) {
    confirm({
      title: '串口关闭警告',
      content: `当前虚拟串口${name}正在被程序${path}占用，释放程序占用后再关闭串口。`,
      onOk () {
        console.log('OK');
      },
      onCancel () {
        console.log('Cancel');
      }
    });
  }
function Parity (value) {
    let str = '';
    switch (value) {
        case 0 : str = 'N' ;break;
        case 1 : str = 'O' ;break;
        case 2 : str = 'E' ;break;
        default: str = 'undefined'; break;
    }
    return str;
}
function formatTime (date, fmt) {
    const o = {
        'M+': date.getMonth() + 1,     //月份
        'd+': date.getDate(),     //日
        'h+': date.getHours(),     //小时
        'm+': date.getMinutes(),     //分
        's+': date.getSeconds(),     //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        'S': date.getMilliseconds()    //毫秒
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}
@withRouter
@inject('store')
@observer
class Vserial extends Component {
    state = {
        gateway: '',
        mqtt_topic: 'v1/vspax/#',
        SerialPort: 'com1',
        BaudRate: '9600',
        StopBit: '1',
        DataBits: '8',
        Check: 'NONE',
        port: 0,
        flag: false,
        connect_flag: false,
        logFlag: false,
        message: {},
        stopLoading: false,
        openLoading: false,
        cloum: [
            {
                title: '串口参数',
                dataIndex: 'parame',
                key: 'parame',
                width: '100px',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0) {
                        return (
                            <span>{item.BaudRate}/{item.DataBits || 8}/{Parity(item.Parity || 0)}/{item.StopBits || 1}</span>
                        )
                    }
                }
            }, {
                title: '串口状态',
                dataIndex: 'status',
                key: 'status',
                width: '100px',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0){
                        return (
                            <span>{item.app_path && item.app_path.indexOf('freeioe_Rprogramming') === -1 ? '已打开' : '已关闭'}</span>
                        )
                    }
                }
            }, {
                title: '打开程序',
                dataIndex: 'app_path',
                key: 'app_path',
                onCell: () => {
                    return {
                      style: {
                        maxWidth: 150,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }
                    }
                  },
                render: (key, item)=>{
                    if (item.app_path && item.app_path.indexOf('freeioe_Rprogramming') === -1){
                        return (
                            <Tooltip
                                placement="topLeft"
                                title={item.app_path.split('\\')[item.app_path.split('\\').length - 1]}
                            >{item.app_path.split('\\')[item.app_path.split('\\').length - 1]}</Tooltip>
                        )
                    }
                }
            }, {
                title: '连接地址',
                dataIndex: 'host',
                key: 'host',
                onCell: () => {
                    return {
                      style: {
                        maxWidth: 150,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }
                    }
                  },
                render: (key, item)=>{
                    if (item.host && item.port) {
                        return (
                            <Tooltip
                                placement="topLeft"
                                title={item.host + ':' +  item.port}
                            >{item.host + ':' +  item.port}</Tooltip>
                        )
                    }
                }
            }, {
                title: '连接状态',
                dataIndex: 'peer_state',
                key: 'peer_state'
            }, {
                title: '串口(收/发)',
                dataIndex: 'recv_count',
                key: 'recv_count',
                width: '150px',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0){
                        return (
                            <span>{item.recv_count}/{item.send_count}</span>
                        )
                    }
                }
            }, {
                title: '网络(收/发)',
                dataIndex: 'peer_recv_count',
                key: 'peer_recv_count',
                width: '150px',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0) {
                        return (
                            <span>{item.peer_recv_count}/{item.peer_send_count}</span>
                        )
                    }
                }
            }, {
                title: '操作',
                dataIndex: 'action',
                key: 'action',
                width: '100px',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0) {
                        return (
                            !this.state.logFlag
                            ? <Button
                                onClick={()=>{
                                    this.setState({
                                        logFlag: true
                                    })
                                }}
                              >监视</Button>
                            : <Button
                                type="danger"
                                onClick={()=>{
                                    this.setState({
                                        logFlag: false
                                    })
                                }}
                              >停止</Button>
                        )
                    }
                }
            }
        ],
        data: [],
        serviceName: []
    }
    componentDidMount () {
        this.setState({ gateway: this.props.gateway })
        const { mqtt } = this.props;
        this.sendAjax()
        this.keepAlive()
        mqtt.vnet_channel.is_running = false;
        mqtt.connect(this.state.gateway, this.state.mqtt_topic, true)
        const {addPortData} = mqtt.vserial_channel;
        this.keep = setInterval(() => {
            this.keepAlive()
        }, 50000);
        this.t1 = setInterval(() => {
            mqtt && mqtt.client  && mqtt.client.connected && mqtt.client.publish('v1/vspax/api/list', JSON.stringify({id: 'api/list/' + new Date() * 1}))
            if (addPortData[0] && Object.keys(addPortData[0]).length > 0) {
                this.setState({flag: false, openLoading: false})
            }
            if (addPortData[0] && Object.keys(addPortData[0]).length === 0){
                this.setState({flag: true, stopLoading: false})
            }
            if (!mqtt.client) {
                mqtt.connect(this.state.gateway, this.state.mqtt_topic, true)
            }
        }, 2000);
        this.t2 = setInterval(() => {
            this.sendAjax()
        }, 5000);
    }
    componentWillUnmount (){
        const { mqtt } = this.props;
        mqtt.disconnect()
        clearInterval(this.t1)
        clearInterval(this.t2)
        clearInterval(this.keep)
    }
    keepAlive = () =>{
        let params = {
            gateway: this.props.gateway,
            name: this.props.gateway + '.freeioe_Vserial',
            output: 'heartbeat_timeout',
            value: 60,
            prop: 'value',
            id: 'send_output/ ' + this.props.gateway + '/ heartbeat_timeout/60/' + new Date() * 1
            }
        http.post('/api/gateways_dev_outputs', params)
        const id = 'keep_alive/' + Date.parse(new Date());
        const message = {
            id: id,
            enable_heartbeat: true,
            heartbeat_timeout: 60
        };
        this.props.mqtt.connected && this.props.mqtt.client.publish('v1/vspax/api/keep_alive', JSON.stringify(message))
    }
    sendAjax = ()=>{
        http.get('/api/gateway_devf_data?gateway=' + this.props.gateway + '&name=' + this.props.gateway + '.freeioe_Vserial').then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                let obj = {
                                name: '-----',
                                desc: '串口映射服务',
                                status: ''
                            }
                res.data.map((item) =>{
                    if (item.name === 'com_to_net_run') {
                        obj.status = item.pv;
                    }
                    if (item.name === 'com_to_net_mapport') {
                        this.setState({port: parseInt(item.pv.split(':')[1])})
                    }
                    if (item.name === 'current_com') {
                        obj.name = 'ser2net_' + item.pv;
                    }
                })
                if (obj !== this.state.serviceName[0]){
                    this.setState({serviceName: [obj]})
                }
            }
        })
    }
    loop = () => {
        const {mqtt} = this.props;
        const { SerialPort, BaudRate, DataBits, Check, StopBit } = this.state;
        this.sendAjax()
        if (this.state.port > 0){
            const datas = {
                id: 'add_local_com' + new Date() * 1,
                by_name: 1,
                name: SerialPort.toUpperCase(),
                peer: {
                    type: 'tcp_client',
                    host: mqtt.vserial_channel.Proxy,
                    port: this.state.port,
                    info: {
                        sn: this.props.gateway,
                        com_cfg: {
                            user_id: _getCookie('user_id'),
                            server_addr: mqtt.vserial_channel.Proxy,
                            serial: SerialPort,
                            baudrate: BaudRate,
                            databit: DataBits,
                            stopbit: StopBit,
                            parity: Check
                        },
                        serial_driver: 'vspax'
                    }
                }
            }
            mqtt.client && mqtt.client.publish('v1/vspax/api/', JSON.stringify({id: 'vspax/api/list' + new Date() * 1}))
            mqtt.client && mqtt.client.publish('v1/vspax/api/add', JSON.stringify(datas))
        } else {
            setTimeout(() => {
                this.loop()
            }, 2000);
        }
    }
    openVserial = () => {
        const { mqtt } = this.props;
        const { BaudRate, DataBits, Check, StopBit } = this.state;
        const { PortLength} = mqtt.vserial_channel;
        let SerialPort = this.state.SerialPort;
        if (PortLength.indexOf(SerialPort.toUpperCase()) !== -1) {
            SerialPort = 'COM' + (parseInt(SerialPort[SerialPort.length - 1]) + 1)
        }
        let params = {
            gateway: this.props.gateway,
            name: this.props.gateway + '.freeioe_Vserial',
            output: 'heartbeat_timeout',
            value: 60,
            prop: 'value',
            id: 'send_output/' + this.props.gateway + '/ heartbeat_timeout/60/' + new Date() * 1
            }
        const params1 = {
            gateway: this.props.gateway,
            name: this.props.gateway + '.freeioe_Vserial',
            output: 'serial_config',
            prop: 'value',
            value: {
                baudrate: BaudRate,
                databit: DataBits,
                parity: Check,
                serial: SerialPort,
                server_addr: mqtt.vserial_channel.Proxy,
                user_id: _getCookie('user_id'),
                stopbit: StopBit
            },
            id: `send_output/ ${this.props.gateway}.freeioe_Vserial/ serial_config/${new Date() * 1}`
        }
        http.post('/api/gateways_dev_outputs', params1).then(res=>{
            let output_record = {};
            if (res.ok){
                output_record.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                this.props.store.action.pushAction(res.data, '设备数据下置执行', '', params1, 10000, (result, data)=>{
                    if (result) {
                        let output_record1 = {};
                        http.post('/api/gateways_dev_outputs', params).then(respones=>{
                            if (respones.ok){
                                output_record1.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                                this.props.store.action.pushAction(respones.data, '设备数据下置执行', '', params, 10000)
                                this.loop()
                                // if (this.state.port > 0) {
                                //     const datas = {
                                //         id: 'add_local_com' + new Date() * 1,
                                //         by_name: 1,
                                //         name: SerialPort.toUpperCase(),
                                //         peer: {
                                //             type: 'tcp_client',
                                //             host: mqtt.vserial_channel.Proxy,
                                //             port: this.state.port,
                                //             info: {
                                //                 sn: this.props.gateway,
                                //                 com_cfg: {
                                //                     server_addr: mqtt.vserial_channel.Proxy,
                                //                     serial: SerialPort,
                                //                     baudrate: BaudRate,
                                //                     databit: DataBits,
                                //                     stopbit: StopBit,
                                //                     parity: Check
                                //                 },
                                //                 serial_driver: 'vspax'
                                //             }
                                //         }
                                //     }
                                //     mqtt.client.publish('v1/vspax/api/list', JSON.stringify({id: 'vspax/api/list' + new Date() * 1}))
                                //     mqtt.client.publish('v1/vspax/api/add', JSON.stringify(datas))
                                // } else {
                                //     output_record1.result = data.message
                                //     output_record1.result_tm = formatTime(new Date(data.timestamp * 1000), 'hh:mm:ss S')
                                //     // this.loop()
                                // }
                            } else {
                                this.setState({openLoading: false})
                            }
                        })
                    } else {
                        output_record.result = data.message
                        output_record.result_tm = formatTime(new Date(data.timestamp * 1000), 'hh:mm:ss S')
                    }

                })
            } else {
                message.error(res.error)
                this.setState({openLoading: false})
            }
        })
    }
    stopVserial = () => {
        const { mqtt } = this.props;
        const {addPortData} = mqtt.vserial_channel;
        const {SerialPort} = this.state;
        const params = {
            gateway: this.props.gateway,
            name: this.props.gateway + '.freeioe_Vserial',
            output: 'serial_stop',
            prop: 'value',
            value: {
                serial: SerialPort
            },
            id: `send_output/ ${this.props.gateway}.freeioe_Vserial/ serial_stop/${new Date() * 1}`
        }
        http.post('/api/gateways_dev_outputs', params)
        const data = {
            id: 'api/remove/' + new Date() * 1,
            by_name: 1,
            name: addPortData[0].name.toUpperCase()
        }
        mqtt.connected && mqtt.client.publish('v1/vspax/api/remove', JSON.stringify(data))
        setTimeout(() => {
            mqtt.onReceiveaddPortMsg(null)
        }, 5000);
    }
    changeStatus = (value, name)=>{
        this.setState({
            [name]: value
        })
    }
    render () {
        const { SerialPort, serviceName, flag, openLoading, stopLoading, logFlag } = this.state;
        const { mqtt } = this.props;
        const {  addPortData } = mqtt.vserial_channel;
        return (
            <div className="vserialWrapper">
                <ServiceState
                    mqtt={mqtt}
                    gateway={this.props.gateway}
                />
                <div className="vserialPort">
                    <div>
                        <div className="vserialBtn">
                            {
                                addPortData[0] && Object.keys(addPortData[0]).length === 0
                                ? <Button
                                    type="primary"
                                    loading={openLoading}
                                    disabled={!(mqtt.vserial_channel.serviceNode && mqtt.vserial_channel.serviceNode.length > 0)}
                                    onClick={()=>{
                                        this.setState({
                                            openLoading: true,
                                            stopLoading: false
                                        }, ()=>{
                                            this.openVserial()
                                        })
                                    }}
                                  >开启</Button>
                                    : <Button
                                        type="danger"
                                        loading={stopLoading}
                                        onClick={()=>{
                                            if (addPortData[0].app_path === '' || addPortData[0].app_path.indexOf('freeioe_Rprogramming') !== -1) {
                                                this.setState({
                                                    stopLoading: true,
                                                    openLoading: false,
                                                    logFlag: false
                                                }, ()=>{
                                                    mqtt.vserial_channel.setLogView(null)
                                                    this.stopVserial()
                                                })
                                            } else {
                                                showConfirm(addPortData[0].name, addPortData[0].app_path.split('\\')[addPortData[0].app_path.split('\\').length - 1])
                                            }
                                        }}
                                      >停止</Button>
                            }
                        </div>
                        <p>网关串口：{SerialPort}</p>
                        <div className="selectWrap">
                            <div className="selectChild">
                                <p>串口:</p>
                                <Select
                                    disabled={!flag}
                                    defaultValue="com1"
                                    style={{width: 120}}
                                    onChange={(value)=>{
                                        this.changeStatus(value, 'SerialPort')
                                    }}
                                >
                                    <Option value="com1">com1</Option>
                                    <Option value="com2">com2</Option>
                                </Select>
                            </div>
                            <div className="selectChild">
                                <p>波特率:</p>
                                <Select
                                    disabled={!flag}
                                    defaultValue="9600"
                                    style={{width: 120}}
                                    onChange={(value)=>{
                                        this.changeStatus(value, 'BaudRate')
                                    }}
                                >
                                    <Option value="300">300</Option>
                                    <Option value="600">600</Option>
                                    <Option value="1200">1200</Option>
                                    <Option value="2400">2400</Option>
                                    <Option value="4800">4800</Option>
                                    <Option value="9600">9600</Option>
                                    <Option value="19200">19200</Option>
                                    <Option value="38400">38400</Option>
                                    <Option value="56000">56000</Option>
                                    <Option value="57600">57600</Option>
                                    <Option value="115200">115200</Option>
                                </Select>
                            </div>
                            <div className="selectChild">
                                <p>停止位:</p>
                                <Select
                                    disabled={!flag}
                                    defaultValue="1"
                                    style={{width: 120}}
                                    onChange={(value)=>{
                                        this.changeStatus(value, 'StopBit')
                                    }}
                                >
                                    <Option value="1">1</Option>
                                    <Option value="2">2</Option>
                                </Select>
                            </div>
                            <div className="selectChild">
                                <p>数据位:</p>
                                <Select
                                    disabled={!flag}
                                    defaultValue="8"
                                    style={{width: 120}}
                                    onChange={(value)=>{
                                        this.changeStatus(value, 'DataBits')
                                    }}
                                >
                                    <Option value="8">8</Option>
                                    <Option value="7">7</Option>
                                </Select>
                            </div>
                            <div className="selectChild">
                                <p>校验:</p>
                                <Select
                                    disabled={!flag}
                                    defaultValue="NONE"
                                    style={{width: 120}}
                                    onChange={(value)=>{
                                        this.changeStatus(value, 'Check')
                                    }}
                                >
                                    <Option value="NONE">NONE</Option>
                                    <Option value="EVEN">EVEN</Option>
                                    <Option value="ODD">ODD</Option>
                                </Select>
                            </div>
                        </div>
                        <Table
                            rowKey="name"
                            columns={cloums}
                            dataSource={serviceName}
                            pagination={false}
                        />
                    </div>
                </div>
                <div className="wrapper">
                    <p>本地串口：{addPortData[0].name}</p>
                    <Table
                        columns={this.state.cloum}
                        dataSource={addPortData}
                        pagination={false}
                        rowKey="host"
                    />
                </div>
                <div>
                    {
                        logFlag
                        ? <Logviewer
                            gateway={this.props.gateway}
                            mqtt={this.props.mqtt}
                            isVserial="true"
                          />
                        : ''
                    }
                </div>
            </div>
        );
    }
}

export default Vserial;