import { Button, Select, Table } from 'antd';
import mqtt from 'mqtt';
import React, { Component } from 'react';
import {inject, observer} from 'mobx-react';
import Logviewer from '../Logviewer';
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

const data = [
    {
        key: '1',
        name: 'com1net',
        desc: '网关串口1映射服务',
        status: 'stopped'
    }, {
        key: '2',
        name: 'com2net',
        desc: '网关串口2映射服务',
        status: 'stopped'
    }
]
function success (){
    console.log('success')
}

function error (){
    console.log('error')
}
function makeid () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 8; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
// function getLocalTime (nS) {
//     return new Date(parseInt(nS) * 1000).toLocaleString();
//  }
let client;

@inject('store')
@observer
class Vserial extends Component {
    state = {
        SerialPort: 'com1',
        BaudRate: '9600',
        StopBit: '1',
        DataBits: '8',
        Check: 'NONE',
        flag: true,
        connect_flag: false,
        logFlag: false,
        message: {},
        cloum: [
            {
                title: '串口参数',
                dataIndex: 'parame',
                key: 'parame'
            }, {
                title: '串口状态',
                dataIndex: 'status',
                key: 'status'
            }, {
                title: '打开程序',
                dataIndex: 'open',
                key: 'open'
            }, {
                title: '连接地址',
                dataIndex: 'address',
                key: 'address'
            }, {
                title: '连接状态',
                dataIndex: 'connectStatus',
                key: 'connectStatus'
            }, {
                title: '串口(收/发)',
                dataIndex: 'serialPort',
                key: 'serialPort'
            }, {
                title: '网络(收/发)',
                dataIndex: 'network',
                key: 'network'
            }, {
                title: '操作',
                dataIndex: 'action',
                key: 'action',
                render: ()=>{
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
        ],
        data: []
    }
    // componentDidMount (){

    // }
    connect = () =>{
        const sn = this.props.match.params.sn;
        const options = {
        connectTimeout: 4000, // 超时时间
        // 认证信息
        clientId: 'webclient-' + makeid(),
        username: this.props.store.session.user_id,
        password: this.props.store.session.sid,
        keepAlive: 6000,
        timeout: 3,
        topic: sn + '/log',
        onSuccess: success,
        onFailure: error
  }
//   const topic = sn + '/log';
  const topic = 'v1/vspc/#';
  if (!this.state.connected){
      client = mqtt.connect('ws://127.0.0.1:7884/mqtt', options)
        client.on('connect', ()=>{
            this.setState({
                connect_flag: true
            })
            // this.setState({connected: true})
            // this.tick()
            client.subscribe(topic)
        })
        client.on('message', (topic, message)=>{

            if (message && message.length > 0){
                if (this.state.message !== message.toString()){
                    const newMessage = JSON.parse(message.toString());
                    const data = [{
                        parame: '',
                        status: '已关闭',
                        open: '',
                        address: '' + newMessage.host + newMessage.port,
                        connectStatus: newMessage.peer_state,
                        serialPort: newMessage.recv_count + '/' + newMessage.send_count,
                        network: newMessage.peer_recv_count + '/' + newMessage.peer_send_count
                    }]
                    this.setState({
                        message: newMessage,
                        data: data
                    })
                }
            }
            if (this.state.data && this.state.data.length < 1000){
                // let data = this.state.data;
                // const newmessage = JSON.parse(message.toString());
                // const obj = {
                // key: new Date() * 1 + Math.random() * 1000,
                // info: newmessage[0],
                // time: getLocalTime(newmessage[1]),
                // id: newmessage[2].split(']:')[0] + ']',
                // content: newmessage[2].split(']:')[1]
                // }
                // data.unshift(obj)
                // this.setState(data)
            } else {
                client.unsubscribe(topic)
                this.setState({flag: true, maxNum: true})
            }
       })
    } else {
        client.subscribe(topic)
        this.setState({flag: false})
    }
   return client;

}
    changeStatus = (value, name)=>{
        this.setState({
            [name]: value
        })
    }
    render () {
        const { SerialPort, flag, logFlag, message } = this.state;
        return (
            <div>
                <div className="wrapper">
                    <p>虚拟串口服务关联网关：<span>{message && Object.keys(message).length > 0 && message.info.sn}</span></p>
                    <div>
                        {
                            flag
                            ? <Button
                                onClick={()=>{
                                    this.setState({
                                        flag: false
                                    })
                                    this.connect();
                                }}
                              >开启</Button>
                            : <Button
                                type="danger"
                                onClick={()=>{
                                    this.setState({
                                        flag: true,
                                        data: []
                                    })
                                    client.unsubscribe('v1/vspc/#')
                                }}
                              >停止</Button>
                        }
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
                            dataSource={data}
                            pagination={false}
                        />
                    </div>
                </div>
                <div className="wrapper">
                    <p>本地串口：</p>
                    <Table
                        columns={this.state.cloum}
                        dataSource={this.state.data}
                        pagination={false}
                        rowKey="connectStatus"
                    />
                </div>
                {
                    logFlag
                    ? <Logviewer />
                    : ''
                }
            </div>
        );
    }
}

export default Vserial;