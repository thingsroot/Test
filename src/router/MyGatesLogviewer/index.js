import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import { _getCookie } from '../../utils/Session';
import { Table, Button, Alert } from 'antd';
import http from '../../utils/Server';
import mqtt from 'mqtt';

let client;
const columns = [{
    title: '时间',
    dataIndex: 'time',
    key: 'timer',
    width: '200px'
  }, {
    title: '类型',
    dataIndex: 'info',
    key: 'info',
    width: '100px'
  }, {
    title: '实例ID',
    dataIndex: 'id',
    key: 'id',
    width: '100px'
  }, {
    title: '内容',
    dataIndex: 'content',
    key: 'content'
  }];
  function getLocalTime (nS) {
    return new Date(parseInt(nS) * 1000).toLocaleString();
 }
function makeid () {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 8; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
function success (){
    console.log('success')
}

function error (){
    console.log('error')
}
@withRouter
class MyGatesLogviewer extends Component {
    state = {
        data: [],
        flag: true,
        maxNum: false,
        connected: false
    }
    componentDidMount (){
        this.t1 = setInterval(()=>this.tick(), 60000);
    }
    componentWillUnmount (){
        clearInterval(this.t1)
    }
    tick (){
            const data = {
                data: 60,
                device: this.props.match.params.sn,
                id: `sys_enable_log/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.postToken('/api/method/iot.device_api.sys_enable_log', data)
    }
    connect = () =>{
            const sn = this.props.match.params.sn;
            const options = {
            connectTimeout: 4000, // 超时时间
            // 认证信息
            clientId: 'webclient-' + makeid(),
            username: _getCookie('usr'),
            password: _getCookie('sid'),
            keepAlive: 6000,
            timeout: 3,
            topic: sn + '/log',
            onSuccess: success,
            onFailure: error
      }
      const topic = sn + '/log';
      if (!this.state.connected){
          client = mqtt.connect('ws://ioe.thingsroot.com:8083/mqtt', options)
            client.on('connect', ()=>{
                this.setState({flag: false, connected: true})
                this.tick()
                client.subscribe(topic)
            })
            client.on('message', (topic, message)=>{
                if (this.state.data && this.state.data.length < 1000){
                    console.log(this.state.data.length)
                    let data = this.state.data;
                    const newmessage = JSON.parse(message.toString());
                    const obj = {
                    key: new Date() * 1 + Math.random() * 1000,
                    info: newmessage[0],
                    time: getLocalTime(newmessage[1]),
                    id: newmessage[2].split(']:')[0] + ']',
                    content: newmessage[2].split(']:')[1]
                    }
                    data.unshift(obj)
                    this.setState(data)
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
    onClose = ()=>{
        this.setState({maxNum: false})
    }
    render () {
        return (
            <div>
                    {
                        this.state.flag
                        ? <Button
                            onClick={()=>{
                                this.t1;
                                this.connect()
                            }}
                          >订阅日志</Button>
                    : <Button
                        onClick={()=>{
                                clearInterval(this.t1)
                                this.setState({flag: true})
                                client.unsubscribe(this.props.match.params.sn + '/log')
                        }}
                      >取消订阅</Button>
                    }
                    <Button
                        onClick={()=>{
                            this.setState({data: []})
                        }}
                    >清除</Button>
                    <div>当前日志数量：{this.state.data && this.state.data.length}</div>
                {
                    this.state.maxNum
                    ? <Alert
                        message="超出最大数量"
                        description="日志最大数量一千条，请清除后再重新订阅！"
                        type="error"
                        closable
                        onClose={this.onClose}
                      />
                    : ''
                }
                <Table
                    columns={columns}
                    dataSource={this.state.data}
                    size="small"
                    pagination={false}
                    rowkey="key"
                    scroll={{y: 600, x: false}}
                    bordered
                />

            </div>
        );
    }
}

export default MyGatesLogviewer;