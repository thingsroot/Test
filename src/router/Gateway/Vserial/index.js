import { Button, Select, Table } from 'antd';
import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import ServiceState from '../../../common/ServiceState';
// import Logviewer from '../Logviewer';
import http from '../../../utils/Server';
import './style.scss';
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
function Parity (value) {
    console.log(value)
    let str = '';
    switch (value) {
        case 0 : str = 'N' ;break;
        case 1 : str = 'O' ;break;
        case 2 : str = 'E' ;break;
        default: str = 'undefined'; break;
    }
    return str;
}
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
        port: '',
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
                render: (key, item)=>{
                    if (Object.keys(item).length > 0) {
                        return (
                            <span>{item.BaudRate}/{item.DataBits}/{Parity(item.Parity)}/{item.StopBits}</span>
                        )
                    }
                }
            }, {
                title: '串口状态',
                dataIndex: 'status',
                key: 'status',
                render: (key, item)=>{
                    if (Object.keys(item).length > 0){
                        return (
                            <span>{item.app_path ? '已打开' : '已关闭'}</span>
                        )
                    }
                }
            }, {
                title: '打开程序',
                dataIndex: 'open',
                key: 'open',
                reder: (key, item)=>{
                    if (item !== ''){
                        return (
                            <span>{item.split('\\')[item.split('\\').length - 1]}</span>
                        )
                    }
                }
            }, {
                title: '连接地址',
                dataIndex: 'host',
                key: 'host'
            }, {
                title: '连接状态',
                dataIndex: 'peer_state',
                key: 'peer_state'
            }, {
                title: '串口(收/发)',
                dataIndex: 'recv_count',
                key: 'recv_count',
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
        console.log(mqtt.vserial_channel.PortLength)
        this.sendAjax()
        // mqtt.vserial_channel.setShow(true)
        // this.setState({filterText: mqtt.log_channel.filter})
        mqtt.connect(this.state.gateway, this.state.mqtt_topic, true)
        // mqtt.connect(this.state.gateway, 'v1/update/api/servers_list', true)
        // http.get('/apis/method/iot_ui.iot_api.gate_applist').then(res=>{
            console.log(mqtt)
        // })
        this.t1 = setInterval(() => {
            console.log(mqtt.vserial_channel.PortLength)
            mqtt && mqtt.client  && mqtt.client.connected && mqtt.client.publish('v1/vspax/api/list', JSON.stringify({id: 'api/list/' + new Date() * 1}))
            if (mqtt.vserial_channel.PortLength.length > 0) {
                this.setState({flag: false, stopLoading: false})
            }
            if (mqtt.vserial_channel.PortLength.length === 0){
                this.setState({flag: true, openLoading: false})
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
        // if (mqtt.vserial_channel.Active) {
        //     mqtt.vserial_channel.setShow(false)
        // }
        // if (mqtt.client.connected) {
        //     mqtt.client.end()
        // }
    }
    // UNSAFE_componentWillReceiveProps (){
    //     const {PortLength} = this.props.mqtt.vserial_channel
    //     if (PortLength.length > 0 && this.state.flag) {
    //         this.setState({flag: false})
    //     }
    //     if (PortLength.length === 0){
    //         this.setState({flag: true})
    //     }
    // }
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
                        this.setState({port: item.pv.split(':')[1]})
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
    openVserial = () => {
        const { mqtt } = this.props;
        const { SerialPort, BaudRate, DataBits, Check, StopBit } = this.state;
        console.log(mqtt, this)
        let params = {
            gateway: this.props.gateway,
            name: this.props.gateway + '.freeioe_Vserial',
            output: 'heartbeat_timeout',
            value: 60,
            prop: 'value',
            id: 'send_output/' + this.props.gateway + '/ ' + this.props.gateway + '/ heartbeat_timeout/60/' + new Date() * 1
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
                stopbit: StopBit
            },
            id: `send_output/${this.props.gateway}/ ${this.props.gateway}.freeioe_Vserial/ serial_config/${new Date() * 1}`
        }
        http.post('/api/gateways_dev_outputs', params).then(res=>{
            console.log(res)
        })
        http.post('/api/gateways_dev_outputs', params1).then(res=>{
            console.log(res)
        })
        const data = {
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
        console.log(mqtt)
        mqtt && mqtt.connected &&  mqtt.client.publish('v1/vspax/api/list', JSON.stringify({id: 'vspax/api/list' + new Date() * 1}))
        mqtt && mqtt.connected &&  mqtt.client.publish('v1/vspax/api/add', JSON.stringify(data))
    }
    stopVserial = () => {
        console.log('open')
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
            id: `send_output/${this.props.gateway}/ ${this.props.gateway}.freeioe_Vserial/ serial_stop/${new Date() * 1}`
        }
        http.post('/api/gateways_dev_outputs', params).then(res=>{
            console.log(res)
        })
        const data = {
            id: 'api/remove/' + new Date() * 1,
            by_name: 1,
            name: addPortData[0].name.toUpperCase()
        }
        mqtt.connected && mqtt.client.publish('v1/vspax/api/remove', JSON.stringify(data))
        setTimeout(() => {
            mqtt.onReceiveaddPortMsg(null)
        }, 5000);
        // if (addPortData && addPortData.length > 0) {
        // }
    }
    changeStatus = (value, name)=>{
        this.setState({
            [name]: value
        })
    }
    render () {
        const { SerialPort, flag, serviceName, openLoading, stopLoading } = this.state;
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
                                console.log(Object.keys(addPortData[0]))
                            }
                            {
                                addPortData[0] && Object.keys(addPortData[0]).length === 0
                                ? <Button
                                    type="primary"
                                    loading={openLoading}
                                    disabled={!mqtt.connect}
                                    onClick={()=>{
                                        this.setState({
                                            openLoading: true
                                        }, ()=>{
                                            this.openVserial()
                                        })
                                    }}
                                  >开启</Button>
                                    : <Button
                                        type="danger"
                                        loading={stopLoading}
                                        onClick={()=>{
                                            this.setState({
                                                stopLoading: true
                                            }, ()=>{
                                                this.stopVserial()
                                            })
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
                            rowKey="serialPort"
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
                        rowKey="connectStatus"
                    />
                </div>
            </div>
        );
    }
}

export default Vserial;