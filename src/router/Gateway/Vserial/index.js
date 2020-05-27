import { Button, Select, Table, message, Modal, Tooltip, Row, Col } from 'antd';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import ServiceState from '../../../common/ServiceState';
import Logviewer from './Logview';
import http from '../../../utils/Server';
import './style.scss';
import {_getCookie} from '../../../utils/Session';
const Option = Select.Option;
// const cloums = [
//     {
//         title: '服务名称',
//         dataIndex: 'name',
//         key: 'name'
//     }, {
//         title: '服务描述',
//         dataIndex: 'desc',
//         key: 'desc'
//     }, {
//         title: '服务状态',
//         dataIndex: 'status',
//         key: 'status'
//     }
// ]
export function GetSerialListBySN (sn) {
    let tty_list = ''
    if (/2-30002.+/.test(sn)) {
        // Q102
        tty_list = '/dev/ttymxc'
    } else if (/2-30102.+/.test(sn)) {
        // Q204
        // 4串口
        tty_list = '/dev/ttymxc'
    } else if (/TRTX01.+/.test(sn)) {
        // TLink X1
        tty_list = '/dev/ttyS'
    } else if (/2-30100.+/.test(sn)) {
        // Q204 无4G模块
        // 4串口
        tty_list = '/dev/ttymxc'
    }
    return tty_list
}
function showConfirm (name, path) {
    Modal.warning({
      title: '串口关闭警告',
      content: `当前虚拟串口${name}正在被程序${path}占用，释放程序占用后再关闭串口。`,
      onOk () {
        console.log('OK');
      },
      okText: '确定'
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
        SerialPort: '1',
        BaudRate: '9600',
        StopBit: '1',
        DataBits: '8',
        Check: 'NONE',
        current_com_params: '',
        port: 0,
        timer: false,
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
                onCell: () => {
                    return {
                      style: {
                        maxWidth: 100,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }
                    }
                  },
                render: (key, item)=>{
                    if (Object.keys(item).length > 0) {
                        return (
                            <Tooltip
                                placement="topLeft"
                                title={`${item.BaudRate}/${item.DataBits || 8}/${Parity(item.Parity || 0)}/${item.StopBits || 1}`}
                            >{item.BaudRate}/{item.DataBits || 8}/{Parity(item.Parity || 0)}/{item.StopBits || 1}</Tooltip>
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
                key: 'peer_state',
                render: (key, item) => <Tooltip title={item.peer_state}>{item.peer_state}</Tooltip>
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
                                type="primary"
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
                // console.log(JSON.stringify(addPortData[0]))
                const data = addPortData[0].info.com_cfg;
                this.setState({
                    SerialPort: data.serial[data.serial.length - 1],
                    BaudRate: data.baudrate,
                    StopBit: data.stopbit,
                    DataBits: data.databit,
                    Check: data.parity

                })
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
        const { gateway } = this.props;
        http.get(`/api/gateway_devf_data?gateway=${gateway}&name=${gateway}.freeioe_Vserial`).then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                let obj = {
                                name: '-----',
                                desc: '串口映射服务',
                                status: ''
                            }
                res.data.map((item) =>{
                    if (item.name === 'frpc_status') {
                        obj.status = item.pv;
                    }
                    if (item.name === 'current_com_params') {
                        const pv = JSON.parse(item.pv)
                        const str = pv.baudrate + '/' + pv.data_bits + '/' + pv.parity + '/' + pv.stop_bits;
                        this.setState({
                            current_com_params: str,
                            BaudRate: pv.baudrate,
                            StopBit: pv.stop_bits,
                            DataBits: pv.data_bits,
                            Check: pv.parity
                        })
                    }
                    if (item.name === 'com_to_frps_mapport') {
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
        const { SerialPort} = this.state;
        this.sendAjax()
        if (this.state.port > 0){
            if (this.timeout) {
                clearTimeout(this.timeout)
            }
            const datas = {
                id: 'add_local_com' + new Date() * 1,
                by_name: 1,
                name: 'COM' + SerialPort,
                peer: {
                    type: 'tcp_client',
                    host: mqtt.vserial_channel.Proxy,
                    port: this.state.port,
                    info: {
                        sn: this.props.gateway,
                        com_cfg: {
                            user_id: _getCookie('user_id'),
                            server_addr: mqtt.vserial_channel.Proxy,
                            serial: GetSerialListBySN(this.state.gateway) + SerialPort
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
            this.timeout = setTimeout(() => {
                this.stopVserial()
            }, 20000);
        }
    }
    openVserial = () => {
        const { mqtt } = this.props;
        // const { BaudRate, DataBits, Check, StopBit } = this.state;
        // const { PortLength} = mqtt.vserial_channel;
        // let SerialPort = this.state.SerialPort;
        const params = {
            gateway: this.state.gateway,
            name: this.state.gateway + '.freeioe_Vserial',
            command: 'start',
            param: {
                port: GetSerialListBySN(this.state.gateway) + this.state.SerialPort,
                frps: {
                    server_addr: mqtt.vserial_channel.Proxy,
                    server_port: '1699'
                }
            },
            id: 'send_command/' + this.state.gateway + '.freeioe_Vserial/start/' + + new Date() * 1
        }
        const params1 = {
            gateway: this.state.gateway,
            id: 'send_output/' + this.state.gateway + '.freeioe_Vserial/enable_heartbeat/' + new Date() * 1,
            name: this.state.gateway + '.freeioe_Vserial',
            output: 'enable_heartbeat',
            prop: 'value',
            value: '0'
        }
        http.post('/api/gateways_dev_commands', params).then(res=>{
            let output_record = {};
            if (res.ok){
                output_record.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                this.props.store.action.pushAction(res.data, '设备数据下置执行', '', params, 10000, (result, data)=>{
                    if (result) {
                        let output_record1 = {};
                        http.post('/api/gateways_dev_outputs', params1).then(respones=>{
                            if (respones.ok){
                                output_record1.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                                this.props.store.action.pushAction(respones.data, '设备数据下置执行', '', params1, 10000)
                                this.loop()
                            } else {
                                this.setState({openLoading: false})
                                this.stopVserial()
                            }
                        })
                    } else {
                        this.setState({openLoading: false})
                        this.stopVserial()
                        output_record.result = data.message
                        output_record.result_tm = formatTime(new Date(data.timestamp * 1000), 'hh:mm:ss S')
                    }

                })
            } else {
                message.error(res.error)
                this.setState({openLoading: false})
                this.stopVserial()
            }
        })
    }
    stopVserial = () => {
        const { mqtt } = this.props;
        const {addPortData} = mqtt.vserial_channel;
        // const {SerialPort} = this.state;
        const params = {
            gateway: this.state.gateway,
            name: this.state.gateway + '.freeioe_Vserial',
            command: 'stop',
            id: 'send_command/' + this.state.gateway + '.freeioe_Vserial/stop/' + + new Date() * 1,
            param: {}
        }
        http.post('/api/gateways_dev_commands', params)
        const data = {
            id: 'api/remove/' + new Date() * 1,
            by_name: 1,
            name: addPortData[0].name
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
    settimer = (val) =>{
        this.setState({
            timer: val
        })
    }
    render () {
        const { SerialPort, serviceName, flag, openLoading, stopLoading, logFlag } = this.state;
        const { mqtt } = this.props;
        const {  addPortData } = mqtt.vserial_channel;
        return (
            <div className="vserialWrapper">
                <h2>远程编程-串口</h2>
                <div className="help_button">
                    <Button
                        icon="question-circle"
                        // style={{marginLeft: '27px', marginBottom: '4px'}}
                        onClick={()=>{
                            window.open('https://wiki.freeioe.org/doku.php?id=apps:APP00000377', '_blank')
                        }}
                    >帮助</Button>
                </div>
                <ServiceState
                    mqtt={mqtt}
                    gateway={this.props.gateway}
                    settimer={this.settimer}
                />
                <div className="vserialPort">
                    <div>
                        <p className="vserial_title">网关串口：COM{SerialPort[SerialPort.length - 1]}</p>
                        <div className="selectWrap">
                            <div className="selectChild">
                            <Row>
                                <Col span={8}><p>串口:</p>
                                    <Select
                                        disabled={!flag}
                                        value={this.state.SerialPort}
                                        style={{width: 120, marginLeft: 10}}
                                        onChange={(value)=>{
                                            this.changeStatus(value, 'SerialPort')
                                        }}
                                    >
                                        <Option value="1">com1</Option>
                                        <Option value="2">com2</Option>
                                        {
                                            /2-30102.+/.test(this.state.gateway) || /2-30100.+/.test(this.state.gateway)
                                            ? <Option value="3">com3</Option>
                                            : null
                                        }
                                        {
                                            /2-30100.+/.test(this.state.gateway) || /2-30100.+/.test(this.state.gateway)
                                            ?  <Option value="4">com4</Option>
                                            : null
                                        }
                                    </Select>
                                </Col>
                                <Col span={8}>
                                    <p>串口信息:</p>
                                    <span className="vserialInfo">{this.state.current_com_params}</span>
                                </Col>
                                <Col span={8}>
                                    <p>服务状态:</p>
                                    <span className="vserialInfo">
                                        {serviceName[0] ? serviceName[0].status : ''}
                                    </span>
                                </Col>
                            </Row>
                            </div>
                        </div>
                        {/* <Table
                            rowKey="name"
                            columns={cloums}
                            dataSource={serviceName}
                            pagination={false}
                        /> */}
                        <div className="vserialBtn">
                            {
                                addPortData[0] && Object.keys(addPortData[0]).length === 0
                                ? <Button
                                    type="primary"
                                    loading={openLoading}
                                    disabled={!(mqtt.vserial_channel.serviceNode && mqtt.vserial_channel.serviceNode.length > 0 && !this.state.timer)}
                                    onClick={()=>{
                                        this.setState({
                                            openLoading: true,
                                            stopLoading: false
                                        }, ()=>{
                                            this.openVserial()
                                        })
                                    }}
                                  >启动</Button>
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
                    </div>
                </div>
                <div className="wrapper">
                    <p className="vserial_title">本地串口： {addPortData[0].name ? addPortData[0].name : '无'}</p>
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