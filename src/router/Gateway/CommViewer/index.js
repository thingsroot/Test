import React, { Component } from 'react';
import { withRouter} from 'react-router-dom';
import {Button, Alert, Input, Select, Empty, Switch } from 'antd';
import {inject, observer} from 'mobx-react';
import http from '../../../utils/Server';
import './style.scss';
import ReactList from 'react-list';
import intl from 'react-intl-universal';

const Search = Input.Search;
const Option = Select.Option;
const noData = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHZpZXdCb3' +
    'g9IjAgMCA2NCA0MSIgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb' +
    '3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxp' +
    'cHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWx' +
    'sLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC' +
    '44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3N' +
    'C0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAx' +
    'NS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzU' +
    'gNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLj' +
    'IyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuN' +
    'zUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAg' +
    'ICA8L2c+CiAgPC9nPgo8L3N2Zz4K'

@withRouter
@inject('store')
@observer
class CommViewer extends Component {
    constructor (props){
        super(props);
        this.mqtt_topic = '/comm'
        this.search_timer = null
        this.state = {
            type: '',
            title: '',
            gateway: '',
            filterText: '',
            hexPrint: true
        }
    }
    componentDidMount (){
        const pathname = this.props.location.pathname.toLowerCase();
        if (pathname.indexOf('comms') !== -1){
            this.setState({
                title: intl.get('gateway.message'),
                type: '/comm'
            })
        } else {
            this.setState({
                title: intl.get('gateway.log'),
                type: '/log'
            })
        }
        this.setState({ gateway: this.props.gateway })
        const { mqtt } = this.props;
        mqtt.comm_channel.setShow(true)
        this.setState({filterText: mqtt.comm_channel.filter})
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
        if (value !== undefined && value.key !== undefined && value.key !== '') {
            mqtt.comm_channel.setSearchType(value.key)
        }
    }
    filter = (e)=>{
        let text = e.target.value;
        this.setState({filterText: text})
        const value = text.toLowerCase();

        if (this.search_timer){
            clearTimeout(this.search_timer)
        }
        this.search_timer = setTimeout(() => {
            const { mqtt } = this.props;
            if (value !== undefined && value !== '') {
                mqtt.comm_channel.setFilter(value)
            } else {
                mqtt.comm_channel.clearFilter()
            }
        }, 200)
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
                <div className="toolbar">
                    <div>
                        {
                            mqtt.comm_channel.Active
                                ? <Button
                                    type="danger"
                                    onClick={this.stopChannel}
                                  >{intl.get('gateway.cancel_subscription')}</Button>
                                : <Button
                                    type="primary"
                                    onClick={this.startChannel}
                                  >{intl.get('gateway.subscription')}{this.state.title}</Button>
                        }
                        <span style={{padding: '0 5px'}} />
                        <Button
                            type="danger"
                            onClick={()=>{
                                mqtt.comm_channel.clearData()
                            }}
                        >{intl.get('gateway.eliminate')}</Button>
                        <span style={{padding: '0 5px'}} />
                        <span>{intl.get('gateway.current_quantity')}：{mqtt.comm_channel.Data.length} </span>
                        <span style={{padding: '0 5px'}} />
                        <span>{intl.get('gateway.total')}： {mqtt.comm_channel.AllData.length}</span>
                    </div>
                    <div className="searwrap">
                        <span>HEX：</span>
                        <Switch
                            checkedChildren="ON&nbsp;"
                            unCheckedChildren="OFF"
                            checked={this.state.hexPrint}
                            onChange={()=>{
                                this.setState({hexPrint: !this.state.hexPrint})
                            }}
                        />
                        <span style={{padding: '0 5px'}} />
                        <Select
                            labelInValue
                            defaultValue={{ key: 'all' }}
                            style={{ width: 140 }}
                            onChange={this.handleChange}
                        >
                            <Option value="all">{intl.get('common.all')}</Option>
                            <Option value="content">{intl.get('appitems.content')}</Option>
                            <Option value="direction">{intl.get('gateway.direction')}</Option>
                            <Option value="id">{intl.get('gateway.equipment_serial_number')}</Option>
                        </Select>
                        <span style={{padding: '0 5px'}} />
                        <Search
                            placeholder={intl.get('gateway.enter_search_content')}
                            value={this.state.filterText}
                            onChange={this.filter}
                            style={{ width: 300 }}
                        />
                    </div>
                </div>

                {
                    this.state.maxNum
                    ? <Alert
                        message={intl.get('gateway.maximum_quantity_exceeded')}
                        description={intl.get('gateway.the_maximum_number_of_logs_is_1000')}
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
                            <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('common.time')}</div>
                            <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('gateway.equipment_serial_number')}</div>
                            <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('gateway.direction')}</div>
                            <div style={{backgroundColor: '#f9f9f9', lineHeight: '30px'}}>{intl.get('gateway.message')}</div>
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
                                                    <div>{this.state.hexPrint ? mqtt.CharToHex(mqtt.comm_channel.Data[key].content) : mqtt.comm_channel.Data[key].content}</div>
                                                </div>
                                            </div>)
                                        }}
                                    />
                                    {
                                        mqtt.comm_channel.Data.length === 0
                                        ?  <div style={{padding: '50px', borderBottom: '1px solid #e8e8e8'}}>
                                            <Empty
                                                image={noData}
                                            />
                                        </div> : null
                                    }
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CommViewer;