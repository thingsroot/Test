import { Button, Select, Table, message, Modal, Tooltip, Row, Col } from 'antd';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import ServiceState from '../../../common/ServiceState';
import Logviewer from './Logview';
import http from '../../../utils/Server';
import './style.scss';
import {_getCookie} from '../../../utils/Session';
import {GetInfoBySN} from '../../../utils/hardwares';
import intl from 'react-intl-universal';
const Option = Select.Option;
function showConfirm (name, path) {
    Modal.warning({
      title: intl.get('gateway.serial_port_shutdown_warning'),
      content: `${intl.get('gateway.current_virtual_serial_port')}${name}${intl.get('gateway.current_virtual_serial_port')}${path}${intl.get('gateway.occupy')}，${intl.get('gateway.release_the_program_occupation_and_then_close_the_serial_port')}。`,
      onOk () {
        console.log('OK');
      },
      okText: intl.get('common.sure')
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
        SerialPort: '',
        BaudRate: '9600',
        StopBit: '1',
        DataBits: '8',
        Check: 'NONE',
        current_com_params: '',
        port: 0,
        PortName: '',
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
                key: 'peer_state',
                render: (key, item) => <Tooltip title={item.peer_state}>{item.peer_state}</Tooltip>
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
        const { gateway } = this.props;
        http.get(`/api/gateway_devf_data?gateway=${gateway}&name=${gateway}.freeioe_Vserial`).then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                let obj = {
                                name: '-----',
                                desc: intl.get('gateway.serial_port_mapping_service'),
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
            const datas = {
                id: 'add_local_com' + new Date() * 1,
                by_name: 1,
                name: SerialPort,
                peer: {
                    type: 'tcp_client',
                    host: mqtt.vserial_channel.Proxy,
                    port: this.state.port,
                    info: {
                        sn: this.props.gateway,
                        com_cfg: {
                            user_id: _getCookie('user_id'),
                            server_addr: mqtt.vserial_channel.Proxy,
                            serial: SerialPort
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
        const params = {
            gateway: this.state.gateway,
            name: this.state.gateway + '.freeioe_Vserial',
            command: 'start',
            param: {
                port: this.state.SerialPort,
                user_id: _getCookie('user_id'),
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
            value: '1'
        }
        http.post('/api/gateways_dev_commands', params).then(res=>{
            let output_record = {};
            if (res.ok){
                output_record.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                this.props.store.action.pushAction(res.data, intl.get('gateway.equipment_data_download_execution'), '', params, 10000, (result, data)=>{
                    if (result) {
                        let output_record1 = {};
                        http.post('/api/gateways_dev_outputs', params1).then(respones=>{
                            if (respones.ok){
                                output_record1.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                                this.props.store.action.pushAction(respones.data, intl.get('gateway.equipment_data_download_execution'), '', params1, 10000)
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
        const { SerialPort, serviceName, flag, openLoading, stopLoading, logFlag, PortName } = this.state;
        const {tty_list} = GetInfoBySN(this.state.gateway)
        const { mqtt } = this.props;
        const {  addPortData } = mqtt.vserial_channel;
        return (
            <div className="vserialWrapper">
                <h2>{intl.get('gateway.Remote_programming-serial_port')}</h2>
                <div className="help_button">
                    <Button
                        icon="question-circle"
                        onClick={()=>{
                            window.open('https://wiki.freeioe.org/doku.php?id=apps:APP00000377', '_blank')
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
                        <p className="vserial_title">{intl.get('gateway.gateway_serial_port')}：{PortName ? PortName : tty_list && tty_list.length > 0 ? tty_list[0].name : ''}</p>
                        <div className="selectWrap">
                            <div className="selectChild">
                            <Row>
                                <Col span={8}><p>{intl.get('gateway.serial_port')}:</p>
                                    <Select
                                        disabled={!flag}
                                        value={SerialPort ? SerialPort : tty_list && tty_list.length > 0 ? tty_list[0].name : ''}
                                        style={{width: 120, marginLeft: 10}}
                                        onChange={(value, event)=>{
                                            value;
                                            this.changeStatus(event.props.value, 'SerialPort')
                                            this.changeStatus(event.props.children, 'PortName')
                                        }}
                                    >
                                        {
                                            tty_list && tty_list.length > 0 && tty_list.map((item, key)=>{
                                                return (
                                                    <Option
                                                        value={item.value}
                                                        key={key}
                                                    >{item.name}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                </Col>
                                <Col span={8}>
                                    <p>{intl.get('gateway.A_serial_port_information')}:</p>
                                    <span className="vserialInfo">{this.state.current_com_params}</span>
                                </Col>
                                <Col span={8}>
                                    <p>{intl.get('gateway.service_state')}:</p>
                                    <span className="vserialInfo">
                                        {serviceName[0] ? serviceName[0].status : ''}
                                    </span>
                                </Col>
                            </Row>
                            </div>
                        </div>
                        <div className="vserialBtn">
                            {
                                addPortData[0] && Object.keys(addPortData[0]).length === 0
                                ? <Button
                                    type="primary"
                                    loading={openLoading}
                                    disabled={!(mqtt.vserial_channel.serviceNode && mqtt.vserial_channel.serviceNode.length > 0 && !this.state.timer)}
                                    style={{width: 150, height: 50, fontSize: 20}}
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
                                        style={{width: 150, height: 50, fontSize: 20}}
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