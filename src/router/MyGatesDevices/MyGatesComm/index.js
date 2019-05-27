import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import { Button, Alert, Input, Select } from 'antd';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
import './style.scss';
import ReactList from 'react-list';
// import App from './action';
let data_len = 0;
const Search = Input.Search;
const Option = Select.Option;
@withRouter
@inject('store')
@observer
class MyGatesLogviewer extends Component {
    state = {
        data: [],
        flag: true,
        searchflag: true,
        maxNum: false,
        value: '',
        connected: false,
        searchtype: 'content',
        type: '',
        title: ''
    }
    componentDidMount (){
        this.t1 = setInterval(()=>this.tick(), 59000);
        this.props.store.messageStore.messageisleave = false;
        this.props.store.messageStore.commnum = 0;
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('message') !== -1){
            this.setState({
                title: '报文',
                type: '/comm'
            })
        } else {
            this.setState({
                title: '日志',
                type: '/log'
            })
        }
        if (this.props.match.params.sn !== this.props.store.messageStore.mqttSN && this.props.store.messageStore.mqttSN !== ''){
            this.props.store.messageStore.client.end();
            this.props.store.messageStore.flag =  true;
            this.props.store.messageStore.data =  [];
            this.props.store.messageStore.connected =  false;
            this.props.store.messageStore.client = null;
            clearInterval(this.t1)
        }
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.location.pathname !== this.props.location.pathname){
            if (this.props.store.messageStore.client) {
                this.props.store.messageStore.client.end();
                this.props.store.messageStore.messageflag =  true;
                this.props.store.messageStore.data =  [];
                this.props.store.messageStore.messagedata =  [];
                this.props.store.messageStore.connected =  false;
                this.props.store.messageStore.client = null;
                clearInterval(this.t1)
                this.tick('0')
            }
        }
    }
    componentDidUpdate () {
        if (data_len !== this.props.store.messageStore.data.length) {
            data_len = this.props.store.messageStore.data.length;
        }
    }
    componentWillUnmount (){
        clearInterval(this.t1)
        this.tick(180)
        this.props.store.messageStore.messageisleave = true;
    }
    tick (time){
            const data = {
                duration: time || 60,
                name: this.props.match.params.sn,
                id: `sys_enable_comm/${this.props.match.params.sn}/${new Date() * 1}`
            }
            http.postToken('/api/gateways_enable_comm', data)
    }
    handleChange = (value)=> {
        this.props.store.messageStore.searchtype =  value.key
      }
    filter = (valu)=>{
        const value = valu.toLowerCase();
        if (value) {
            this.props.store.messageStore.value = value;
            this.props.store.messageStore.data = this.props.store.messageStore.newdata.filter(item=>item[this.props.store.messageStore.searchtype].toLowerCase().indexOf(value) !== -1)
        } else {
            this.props.store.messageStore.value = '';
            this.props.store.messageStore.data = this.props.store.messageStore.newdata;
        }
    }
    closeEnableLog =()=>{
        const data = {
            duration: 0,
            name: this.props.match.params.sn,
            id: `sys_enable_comm/${this.props.match.params.sn}/${new Date() * 1}`
        }
        http.postToken('/api/gateways_enable_comm', data)
    }
    onClose = ()=>{
        this.setState({maxNum: false})
    }
    render () {
        const  data  = this.props.store.messageStore.messagedata;
        return (
            <div
                style={{position: 'relative'}}
                className="messagewrap"
            >
                    {
                        this.props.store.messageStore.messageflag
                        ? <Button
                            onClick={()=>{
                                this.tick()
                                this.t1;
                                this.props.store.messageStore.connect(this.props.match.params.sn, this.state.type)
                            }}
                          >订阅{this.state.title}</Button>
                    : <Button
                        onClick={()=>{
                                this.closeEnableLog()
                                clearInterval(this.t1)
                                this.props.store.messageStore.messageflag = true;
                                this.props.store.messageStore.client.end()
                                this.props.store.messageStore.connected = false;
                                // this.refs.content.innerHTML = '';
                        }}
                      >取消订阅</Button>
                    }
                    <Button
                        onClick={()=>{
                            this.props.store.messageStore.messagedata = [];
                            this.props.store.messageStore.arr = [];
                            // this.props.store.messageStore.data = [];
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
                            onSearch={this.filter}
                            enterButton
                        />
                    </div>
                    <div>当前报文数量：{data.length}</div>
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
                >
                    <div style={{width: '100%'}}>
                        <div className="tableHeaders">
                            <div>时间</div>
                            <div>设备ID</div>
                            <div>方向</div>
                            <div>报文</div>
                        </div>
                            <div
                                className="tableContent"
                                id="tbody"
                            >
                                <div
                                    style={{height: 600, overflowY: 'auto', width: '100%'}}
                                >
                                    <ReactList
                                        pageSize={1}
                                        ref="content"
                                        axis="y"
                                        type="simple"
                                        length={data.length}
                                        itemRenderer={(key)=>{
                                            return (<div key={key}>
                                                <div className="tableHeaders">
                                                    <div>{data[key].time}</div>
                                                    <div>{data[key].id}</div>
                                                    <div>{data[key].direction}</div>
                                                    <div>{data[key].content}</div>
                                                </div>
                                            </div>)
                                        }}
                                    />
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MyGatesLogviewer;