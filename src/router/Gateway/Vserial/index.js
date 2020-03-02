import { Button, Select, Table, message, Modal, Tooltip } from 'antd';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import ServiceState from '../../../common/ServiceState';
import Logviewer from './Logview';
import http from '../../../utils/Server';
import './style.scss';
import {_getCookie} from '../../../utils/Session';
import intl from 'react-intl-universal';

const Option = Select.Option;
const cloums = [
    {
        title: intl.get('gateway.service_name'),
        dataIndex: 'name',
        key: 'name'
    }, {
        title: intl.get('gateway.service_describe'),
        dataIndex: 'desc',
        key: 'desc'
    }, {
        title: intl.get('gateway.service_state'),
        dataIndex: 'status',
        key: 'status'
    }
]
const { confirm } = Modal;
function showConfirm (name, path) {
    confirm({
      title: intl.get('gateway.serial_port_shutdown_warning'),
      content: `${intl.get('gateway.current_virtual_serial_port')}${name}${intl.get('gateway.being_programmed')}${path}${intl.get('gateway.occupy')}，${intl.get('gateway.release_the_program_occupation_and_then_close_the_serial_port')}。`,
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
        timer: false,
        flag: false,
        connect_flag: false,
        logFlag: false,
        message: {},
        stopLoading: false,
        openLoading: false,
        cloum: [
            {
                title: intl.get('gateway.serial_port_parameters'),
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
                title: intl.get('gateway.serial_port_state'),
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
                title: intl.get('gateway.open_programs'),
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
                title: intl.get('gateway.connection_address'),
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
                title: intl.get('gateway.connection_state'),
                dataIndex: 'peer_state',
                key: 'peer_state'
            }, {
                title: intl.get('gateway.Serial_port_receiving_sending'),
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
                title: intl.get('gateway.network_receiving_sending'),
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
                title: intl.get('common.operation'),
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
                              >{intl.get('gateway.monitor')}</Button>
                            : <Button
                                type="danger"
                                onClick={()=>{
                                    this.setState({
                                        logFlag: false
                                    })
                                }}
                              >{intl.get('gateway.stop')}</Button>
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
                    SerialPort: data.serial,
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
        http.get('/api/gateway_devf_data?gateway=' + this.props.gateway + '&name=' + this.props.gateway + '.freeioe_Vserial').then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                let obj = {
                                name: '-----',
                                desc: intl.get('gateway.serial_port_mapping_service'),
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
        // const { PortLength} = mqtt.vserial_channel;
        let SerialPort = this.state.SerialPort;
        // if (PortLength.indexOf(SerialPort.toUpperCase()) !== -1) {
        //     SerialPort = 'COM' + (parseInt(SerialPort[SerialPort.length - 1]) + 1)
        // }
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
                this.props.store.action.pushAction(res.data, intl.get('gateway.equipment_data_download_execution'), '', params1, 10000, (result, data)=>{
                    if (result) {
                        let output_record1 = {};
                        http.post('/api/gateways_dev_outputs', params).then(respones=>{
                            if (respones.ok){
                                output_record1.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                                this.props.store.action.pushAction(respones.data, intl.get('gateway.equipment_data_download_execution'), '', params, 10000)
                                this.loop()
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
                <h2>{intl.get('gateway.Remote_programming-serial_port')}</h2>
                <div className="help_button">
                    <Button
                        icon="question-circle"
                        // style={{marginLeft: '27px', marginBottom: '4px'}}
                        onClick={()=>{
                            window.open('https://wiki.freeioe.org/doku.php?id=apps:APP00000130', '_blank')
                        }}
                    >{intl.get('header.help')}</Button>
                </div>
                <ServiceState
                    mqtt={mqtt}
                    gateway={this.props.gateway}
                    settimer={this.settimer}
                />
                <div className="vserialPort">
                    <div>
                        <p className="vserial_title">{intl.get('gateway.gateway_serial_port')}：{SerialPort}</p>
                        <div className="selectWrap">
                            <div className="selectChild">
                                <p>{intl.get('gateway.serial_port')}:</p>
                                <Select
                                    disabled={!flag}
                                    value={this.state.SerialPort}
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
                                <p>{intl.get('appsinstall.baud_rate')}:</p>
                                <Select
                                    disabled={!flag}
                                    value={this.state.BaudRate}
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
                                <p>{intl.get('appsinstall.Stop_bit')}:</p>
                                <Select
                                    disabled={!flag}
                                    value={this.state.StopBit}
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
                                <p>{intl.get('appsinstall.data_bits')}:</p>
                                <Select
                                    disabled={!flag}
                                    value={this.state.DataBits}
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
                                <p>{intl.get('appsinstall.check')}:</p>
                                <Select
                                    disabled={!flag}
                                    value={this.state.Check}
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
                                  >{intl.get('gateway.start_up')}</Button>
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
                                      >{intl.get('gateway.stop')}</Button>
                            }
                        </div>
                    </div>
                </div>
                <div className="wrapper">
                    <p className="vserial_title">{intl.get('gateway.local_serial_port')}： {addPortData[0].name ? addPortData[0].name : intl.get('gateway.nothing')}</p>
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