import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import { Button, Alert, Input, Select } from 'antd';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
import './style.scss';
import ReactList from 'react-list';

const Search = Input.Search;
const Option = Select.Option;

@withRouter
@inject('store')
@observer
class CommViewer extends Component {
    constructor (props){
        super(props);
        this.mqtt_topic = '/comm'
        this.state = {
            type: '',
            title: '',
            gateway: ''
        }
    }
    componentDidMount (){
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('commviewer') !== -1){
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
        this.setState({ gateway: this.props.gateway })
        const { mqtt } = this.props;
        mqtt.comm_channel.setShow(true)
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.gateway !== this.props.gateway){
            this.stopChannel()
            this.setState({
                gateway: nextProps.gateway
            })
        }
    }
    componentWillUnmount (){
        const { mqtt } = this.props;
        clearInterval(this.t1)
        if (mqtt.comm_channel.Active) {
            this.tick(180)
            mqtt.comm_channel.setShow(false)
        }
    }
    tick (time){
        const { mqtt } = this.props;
        mqtt.tick(time)

        const data = {
            duration: time || 60,
            name: this.state.gateway,
            id: `sys_enable_comm/${this.state.gateway}/${new Date() * 1}`
        }
        http.post('/api/gateways_enable_comm', data)
    }
    handleChange = (value)=> {
        const { mqtt } = this.props;
        if (value !== undefined && value !== '') {
            mqtt.comm_channel.setSearchType(value)
        }
    }
    filter = (value)=>{
        const lvalue = value.toLowerCase();

        const { mqtt } = this.props;
        if (lvalue !== undefined && lvalue !== '') {
            mqtt.comm_channel.setFilter(lvalue)

        } else {
            mqtt.comm_channel.clearFilter()
        }
    }
    startChannel =()=>{
        const { mqtt } = this.props;
        this.tick(60)
        this.t1 = setInterval(()=>this.tick(60), 59000);
        mqtt.connect(this.state.gateway, this.mqtt_topic)
    }
    stopChannel =()=>{
        const { mqtt } = this.props;
        mqtt.unsubscribe(this.mqtt_topic)
        clearInterval(this.t1)

        const data = {
            duration: 0,
            name: this.state.gateway,
            id: `sys_enable_comm/${this.state.gateway}/${new Date() * 1}`
        }
        http.post('/api/gateways_enable_comm', data)
    }
    onClose = ()=>{
        this.setState({maxNum: false})
    }
    render () {
        const { mqtt } = this.props;
        const { gateway } = this.state;
        gateway;
        return (
            <div
                style={{position: 'relative'}}
                className="commView"
            >
                <div className="opwrap">
                    {
                        mqtt.comm_channel.Active
                        ? <Button type="danger"
                            onClick={this.stopChannel}
                          >取消订阅</Button>
                        : <Button type="primary"
                            onClick={this.startChannel}
                          >订阅{this.state.title}</Button>
                    }
                    <span style={{padding: '0 5px'}} />
                    <Button type="danger"
                        onClick={()=>{
                            mqtt.comm_channel.clearData()
                        }}
                    >清除</Button>
                    <span style={{padding: '0 10px'}} >当前报文数量：{mqtt.comm_channel.Data.length} / {mqtt.comm_channel.AllData.length}</span>
                </div>
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
                    <span style={{padding: '0 5px'}} />
                    <Search
                        placeholder="input search text"
                        onSearch={this.filter}
                        enterButton
                    />
                </div>
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
                                        length={mqtt.comm_channel.Data.length}
                                        itemRenderer={(key)=>{
                                            return (<div key={key}>
                                                <div className="tableHeaders">
                                                    <div>{mqtt.comm_channel.Data[key].time}</div>
                                                    <div>{mqtt.comm_channel.Data[key].id}</div>
                                                    <div>{mqtt.comm_channel.Data[key].direction}</div>
                                                    <div>{mqtt.comm_channel.Data[key].content}</div>
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

export default CommViewer;