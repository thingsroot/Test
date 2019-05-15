import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import { _getCookie } from '../../utils/Session';
import { Button, Alert, Input, Select } from 'antd';
const Search = Input.Search;
import http from '../../utils/Server';
import mqtt from 'mqtt';
import './style.scss';
import iScroll from 'iscroll/build/iscroll-probe';
let client;
// const columns = [{
//     title: '时间',
//     dataIndex: 'time',
//     key: 'timer',
//     width: '200px'
//   }, {
//     title: '类型',
//     dataIndex: 'info',
//     key: 'info',
//     width: '100px'
//   }, {
//     title: '实例ID',
//     dataIndex: 'id',
//     key: 'id',
//     width: '100px'
//   }, {
//     title: '内容',
//     dataIndex: 'content',
//     key: 'content'
//   }];
const Option = Select.Option;

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
        searchflag: true,
        maxNum: false,
        connected: false,
        searchtype: 'content'
    }
    componentDidMount (){
        this.t1 = setInterval(()=>this.tick(), 60000);
        this.myScroll = new iScroll('#tbody', {
            probeType: 2,
            mouseWheel: true,
            scrollbars: true,
            interactiveScrollbars: true,
            freeScroll: true,
            momentum: false,
            resizePolling: 1,
            hideScrollbar: true,
            sanp: true
        })
        this.myScroll.on('scroll', ()=>{
            console.log('lllllllllllllll')
        })
        this.myScroll.on('scrollEnd', function (){
            console.log('sssssssssssssssss')
            console.log(this.myScroll)
        })
    }
    componentDidUpdate () {
        // console.log(this.myScroll.scrollToElement())
        this.myScroll.refresh()
      }
    componentWillUnmount (){
        clearInterval(this.t1)
    }
    tick (){
            const data = {
                duration: 60,
                name: this.props.match.params.sn,
                id: `sys_enable_log/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.postToken('/api/gateways_enable_log', data)
    }
    handleChange = (value)=> {
        this.setState({
            searchtype: value.key
        })
      }
    connect = () =>{
            const arr = [];
            const sn = this.props.match.params.sn;
            const options = {
            connectTimeout: 4000, // 超时时间
            // 认证信息
            clientId: 'webclient-' + makeid(),
            username: unescape(_getCookie('user_id')),
            password: unescape(_getCookie('sid')),
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
                console.log('连接成功')
                this.setState({flag: false, connected: true})
                this.tick()
                client.subscribe(topic)
            })
            client.on('message', (topic, message)=>{
                if (this.state.data && this.state.data.length < 1000){
                    const newmessage = JSON.parse(message.toString());
                    //let data = this.state.data;
                    arr.push({
                        time: getLocalTime(newmessage[1]),
                        type: newmessage[0],
                        id: newmessage[2].split(']:')[0] + ']',
                        content: newmessage[2].split(']:')[1]
                    })
                    this.setState({
                        data: arr
                    })
                    const obj = `
                            <div class="tableHeaders">
                                <div>${getLocalTime(newmessage[1])}</div>
                                <div>${newmessage[0]}</div>
                                <div>${newmessage[2].split(']:')[0] + ']'}</div>
                                <div>${newmessage[2].split(']:')[1]}</div>
                            </div>
                    `
                    // const obj = `
                    // <tr>
                    //     <th padding='10px'>${getLocalTime(newmessage[1])}</th>
                    //     <th>${newmessage[0]}</th>
                    //     <th>${newmessage[2].split(']:')[0] + ']'}</th>
                    //     <th>${newmessage[2].split(']:')[1]}</th>
                    // </tr>
                    // `
                    this.myScroll.scrollTo(0, 400)
                    // console.log(this.myScroll)
                   if (this.state.searchflag) {
                    this.refs.content.innerHTML = obj +  this.refs.content.innerHTML;
                   }
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
    onSCroll = ()=>{
        console.log('22222')
    }
    render () {
        return (
            <div style={{position: 'relative'}}>
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
                            this.refs.content.innerHTML = '';
                        }}
                    >清除</Button>
                    <div className="searwrap">
                        <Select
                            labelInValue
                            defaultValue={{ key: 'content' }}
                            style={{ width: 120 }}
                            onChange={this.handleChange}
                        >
                            <Option value="content">内容</Option>
                            <Option value="id">ID</Option>
                            <Option value="type">类型</Option>
                        </Select>
                        <Search
                            placeholder="input search text"
                            onSearch={(value)=>{
                                if (value) {
                                const newarr = this.state.data.filter(item=>item[this.state.searchtype].indexOf(value) !== -1);
                                let html = '';
                                newarr.map(item=>{
                                    html +=    `
                                        <tr>
                                            <th padding='10px'>${item.time}</th>
                                            <th>${item.type}</th>
                                            <th>${item.id}</th>
                                            <th>${item.content}</th>
                                        </tr>
                                        `
                                });
                                this.refs.content.innerHTML = html
                                this.setState({
                                    searchflag: false
                                })
                                } else {
                                let html = '';
                                this.state.data.map(item=>{
                                    html +=    `
                                        <tr>
                                            <th padding='10px'>${item.time}</th>
                                            <th>${item.type}</th>
                                            <th>${item.id}</th>
                                            <th>${item.content}</th>
                                        </tr>
                                        `
                                });
                                this.refs.content.innerHTML = html;
                                this.setState({
                                    searchflag: true
                                })
                                }
                            }}
                            enterButton
                        />
                    </div>
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
                <div
                    ref="table"
                    className="logview"
                >
                    {/* <table
                        style={{width: '100%', padding: '8px'}}
                        border="1"
                    >
                        <thead>
                            <tr>
                                <th style={{padding: '10px'}}>时间</th>
                                <th>类型</th>
                                <th>实例ID</th>
                                <th>内容</th>
                            </tr>
                        </thead>
                            <tbody ref="tbody">

                            </tbody>
                    </table> */}
                    <div style={{width: '100%'}}>
                        <div className="tableHeaders">
                            <div>时间</div>
                            <div>类型</div>
                            <div>实例ID</div>
                            <div>内容</div>
                        </div>
                            <div className="tableContent" id="tbody">
                                <div ref="content">

                                </div>
                            </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MyGatesLogviewer;