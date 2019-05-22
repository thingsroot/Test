import React, { Component } from 'react';
import {Table, Input, Select, Button, message, Icon} from 'antd'
import './style.scss'
import http from '../../utils/Server';
import {_getCookie} from '../../utils/Session';
import axios from 'axios/index';
import {inject, observer} from 'mobx-react';
import SonTables from './SonTables';
const InputGroup = Input.Group;
const Option = Select.Option;
const disposed = {
    color: '#367fa9',
    fontWeight: '600'
};
const posed = {
    color: 'rgba(0, 0, 0, 0.65)',
    fontWeight: 'normal'
};

@inject('store')
@observer
class DevicemMessage extends Component {
    state = {
        category: '',
        user: '',
        start: 0,
        length: 100,
        filters: {},
        tableData: [],
        deviceData: [],
        dataSource: [],
        selectValue: '',
        text: '',
        isgateway: false,
        loading: false,
        selectedRowKeys: [],
        columns: [
            {
                title: '标题',
                dataIndex: 'title',
                width: '25%',
                render: (text, record) => (
                    <span
                        className="cursor"
                        style={record.disposed === 0 ? disposed : posed}
                    >{text}
                    </span>
                )
            }, {
                title: '网关序列号',
                dataIndex: 'device',
                width: '35%',
                render: (text, record) => (
                    <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
                )
            }, {
                title: '发生时间',
                dataIndex: 'creation',
                width: '20%',
                render: (text, record) => (
                    <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
                )
            }, {
                title: '事件类型',
                dataIndex: 'operation',
                width: '10%',
                render: (text, record) => (
                    <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
                )
            }, {
                title: '事件等级',
                dataIndex: 'event_level',
                width: '10%',
                render: (text, record) => (
                    <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
                )
            }
        ],
        flag: false,
        messageCount: 0,
        unconfirmed: 0,
        sync: false
    };
    componentDidMount (){
        let hours = Date.parse(new Date()) - 24 * 60 * 60 * 1000;
        let time = this.timestampToTime(hours);
        let params = {
            category: 'user',
            name: unescape(_getCookie('user_id')),
            start: 0,
            limit: this.state.length,
            filters: {
                creation: ['>', time]
            }
        };
        if (this.props.match.params.sn && this.props.match.params.sn !== '1'){
            this.setState({
                isgateway: true
            }, ()=>{
                params.filters.device = this.props.match.params.sn
            })
        }
        this.setState({
            category: params.category,
            name: params.name,
            start: params.start,
            length: params.limit,
            filters: params.filters,
            selectValue: 'title'
        }, ()=>{
            this.getMessageList(params);
        });
        if (this.props.match.params.sn !== '1') {
            this.setState({
                selectValue: 'device'
            });
        } else {
            this.setState({
                selectValue: 'title'
            });
        }
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.match.params.sn !== this.props.match.params.sn){
            this.setState({
                filters: {...this.state.filters, device: nextProps.match.params.sn + ''}
            }, ()=>{
                this.getMessageList({
                    category: this.state.category,
                    name: this.state.name,
                    start: this.state.start,
                    length: this.state.length,
                    filters: this.state.filters
                })
            })
        }

    }
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    //确认消息
    confMessage = (arr)=>{
        if (arr.length === 0) {
            message.warning('请您先选择要确认的消息！');
        } else {
            this.setState({
                loading: true
            });
            let params = {
                category: this.state.category,
                events: arr,
                disposed: 1
            };
            http.post('/api/events_dispose', params).then(res=>{
                res;
                let deviceData = this.state.deviceData;
                deviceData && deviceData.length > 0 && deviceData.map((w, key)=>{
                    key;
                    arr.map((v, key1)=>{
                        key1;
                        if (w.name === v) {
                            w.disposed = 1
                        }
                    });
                });
                let newData = deviceData.splice(0, deviceData.length);
                this.props.store.codeStore.setDeviceData(newData);
                this.props.store.codeStore.setDeviceTableData(newData);
                this.setState({
                    selectedRowKeys: [],
                    loading: false,
                    deviceData: newData,
                    unconfirmed: this.state.unconfirmed - arr.length
                });
            }).catch(err=>{
                console.log(err)
            })
        }
    };
    //确认所有消息
    confAllMessage = ()=>{
        this.setState({
            loading: true
        });
        let data = [];
        let deviceData = this.state.deviceData;
        deviceData && deviceData.length > 0 && deviceData.map((v, key)=>{
            key;
            if (v.disposed === 0) {
                data.push(v.name)
            }
        });
        let params = {
            category: this.state.category,
            events: data,
            disposed: 1
        };

        http.post('/api/events_dispose', params).then(res=>{
            res;
            deviceData && deviceData.length > 0 && deviceData.map((v, key)=>{
                key;
                if (v.disposed === 0) {
                    v.disposed = 1;
                }
            });
            this.props.store.codeStore.setDeviceData(deviceData);
            this.props.store.codeStore.setDeviceTableData(deviceData);
            this.setState({
                selectedRowKeys: [],
                loading: false,
                platform: deviceData,
                unconfirmed: 0
            });
        }).catch(err=>{
            console.log(err)
        })
    };
    //获取消息列表
    getMessageList = (params)=>{
        this.setState({
            loading: true,
            unconfirmed: 0
        });
        axios({
            url: '/api/device_events_list',
            method: 'GET',
            params: params
        }).then(res=>{
            let sourceData = res.data.data.list.data;
            let data = [];
            let source = [];
            let unconfirmed = 0;
            if (res.data.ok === true) {
                sourceData.map((v)=>{
                    if (v.disposed === 0) {
                        unconfirmed++
                    }
                    let type = '';
                    let level = '';
                    if (v.event_type === 'EVENT') {
                        type = '设备'
                    } else {
                        type = v.event_type
                    }
                    if (v.event_level === 1) {
                        level = '常规'
                    } else if (v.event_level === 2) {
                        level = '错误'
                    } else if (v.event_level === 3) {
                        level = '警告'
                    } else if (v.event_level === 99) {
                        level = '致命'
                    }
                    data.push({
                        title: v.event_info,
                        device: v.event_source,
                        creation: v.creation.split('.')[0],
                        operation: type,
                        disposed: v.disposed,
                        name: v.name,
                        data: v.event_data,
                        event_level: level,
                        event_type: type,
                        event_time: v.creation.split('.')[0]
                    });
                    source.push(v.event_type);
                });
            } else {
                message.error('获取消息列表失败！')
            }
            this.setState({
                loading: false,
                deviceData: data,
                messageCount: res.data.data.count,
                unconfirmed: unconfirmed,
                sync: false
            });
            this.props.store.codeStore.setDeviceData(data);
            this.props.store.codeStore.setDeviceTableData(data);
            if (this.state.text !== '') {
                this.tick(this.state.text)
            }
            if (this.props.match.params.sn !== '1') {
                let newData = [];
                data.length > 0 && data.map((v)=>{
                    if (v['device'].toLowerCase().indexOf(this.props.match.params.sn.toLowerCase()) !== -1) {
                        newData.push(v)
                    }
                });
                this.props.store.codeStore.setDeviceData(newData)
            }
        })
    };
    //查看所有、查看未确认
    toggleMessage = ()=>{
        this.setState({
            flag: !this.state.flag
        }, ()=>{
            let params = {
                category: this.state.category,
                name: this.state.name,
                start: this.state.start,
                filters: this.state.filters,
                limit: this.state.length
            };
            if (this.state.flag) {
                this.getUnconfirmed()
            } else {
                this.getMessageList(params)
            }
        })
    };
    //获取未读消息
    getUnconfirmed = ()=>{
        let params = {
            category: this.state.category,
            name: this.state.name,
            start: this.state.start,
            limit: this.state.unconfirmed,
            filters: {
                disposed: 0
            }
        };
        this.getMessageList(params)
    };
    //时间戳转换
    timestampToTime = (timestamp)=>{
        let date = new Date(timestamp);
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
        let s = '00';
        return Y + M + D + h + m + s;
    };
    //搜索框改变值
    getSelect = (text)=>{
        this.setState({
            selectValue: text
        }, ()=>{
            if (this.state.text) {
                this.tick(this.state.text);
            }
        })
    };
    tick = (text)=>{
        this.setState({
            loading: true
        });
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            this.setState({
                text: text
            }, ()=>{
                if (text) {
                    let newData = [];
                    let deviceTableData = this.props.store.codeStore.deviceTableData;
                    deviceTableData.map((v)=>{
                        if (v[this.state.selectValue].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                            newData.push(v)
                        }
                    });
                    this.setState({
                        loading: false
                    });
                    this.props.store.codeStore.setDeviceData(newData)
                } else {
                    let data = this.props.store.codeStore.deviceTableData;
                    this.props.store.codeStore.setDeviceData(data);
                    this.setState({
                        loading: false
                    });
                }
            })
        }, 1000);
    };
    search = (e)=>{
        let text = e.target.value;
        this.tick(text);
    };
    //最大记录数
    messageTotal = (value)=>{
        let num = `${value}`;
        let params = {
            category: this.state.category,
            name: this.state.name,
            start: this.state.start,
            limit: num,
            filters: this.state.filters
        };
        this.setState({
            length: params.limit
        });
        this.getMessageList(params);
    };
    //筛选消息类型
    messageChange = (value)=>{
        if (value) {
            let filters = this.state.filters;
            filters['event_type'] = value;
            let params = {
                category: this.state.category,
                name: this.state.name,
                start: this.state.start,
                limit: this.state.length,
                filters: filters
            };
            this.setState({
                filters: params.filters
            });
            this.getMessageList(params)
        } else {
            let data = this.props.store.codeStore.deviceTableData;
            this.setState({
                deviceData: data
            });
            this.props.store.codeStore.setDeviceData(data);
        }
    };
    //等级筛选
    gradeChange = (value)=>{
        console.log(value);
        if (value !== '') {
            let filters = this.state.filters;
            filters['event_level'] = value;
            let params = {
                category: this.state.category,
                name: this.state.name,
                start: this.state.start,
                limit: this.state.length,
                filters: filters
            };
            this.setState({
                filters: params.filters
            });
            this.getMessageList(params)
        } else {
            let params = {
                category: this.state.category,
                name: this.state.name,
                start: this.state.start,
                limit: this.state.length,
                filters: this.state.filters
            };
            this.getMessageList(params)
        }
    };
    //时间
    messageTime = (value)=>{
        let hours = Date.parse(new Date()) - `${value}` * 60 * 60 * 1000;
        let time = this.timestampToTime(hours);
        let filters = this.state.filters;
        filters['creation'] = ['>', time];
        let params = {
            category: this.state.category,
            name: this.state.name,
            start: this.state.start,
            limit: this.state.length,
            filters: filters
        };
        this.setState({
            filters: params.filters
        });
        this.getMessageList(params);
    };
    //表格
    onChange = (pagination, filters, sorter)=>{
        console.log('params', pagination, filters, sorter)
    };

    refresh = ()=>{
        this.setState({
            sync: true
        });
        let filters = this.state.filters;
        let params = {
            category: 'user',
            name: unescape(_getCookie('user_id')),
            start: 0,
            limit: this.state.length
        };
        if (this.state.flag) {
            filters['disposed'] = 0;
            params['filters'] = filters;
            this.getMessageList(params)
        } else {
            params['filters'] = filters;
            this.getMessageList(params)
        }
    };

    render () {
        let { selectedRowKeys, columns, category, flag,
            messageCount, unconfirmed, isgateway } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <div className="deviceMessage">
                {
                    !isgateway
                    ? <div className="searchBox flex">
                    <div style={{minWidth: 280}}>
                        <Button onClick={()=>{
                            this.confMessage(selectedRowKeys)
                        }}
                        >确认消息</Button>
                        <Button onClick={()=>{
                            this.confAllMessage()
                        }}
                        >确认所有消息</Button>
                    </div>

                    <div
                        className="flex"
                    >
                        <Select
                            defaultValue="消息类型：全部"
                            style={{ width: 150 }}
                            onChange={this.messageChange}
                        >
                            <Option value="">消息类型：全部</Option>
                            <Option value="通讯">消息类型：通讯</Option>
                            <Option value="数据">消息类型：数据</Option>
                            <Option value="应用">消息类型：应用</Option>
                            <Option value="系统">消息类型：系统</Option>
                            <Option value="设备">消息类型：设备</Option>
                        </Select>
                        <Select
                            defaultValue="等级：全部"
                            style={{ width: 130 }}
                            onChange={this.gradeChange}
                        >
                            <Option value="">等级：全部</Option>
                            <Option value="1">等级：常规</Option>
                            <Option value="2">等级：错误</Option>
                            <Option value="3">等级：警告</Option>
                            <Option value="99">等级：致命</Option>
                        </Select>
                        <Select
                            defaultValue="记录数：100"
                            style={{ width: 130 }}
                            onChange={this.messageTotal}
                        >
                            <Option value="100">记录数：100</Option>
                            <Option value="300">记录数：300</Option>
                            <Option value="500">记录数：500</Option>
                        </Select>
                        <Select
                            defaultValue="时间：24小时"
                            style={{ width: 140 }}
                            onChange={this.messageTime}
                        >
                            <Option value="1">时间：1小时</Option>
                            <Option value="6">时间：6小时</Option>
                            <Option value="24">时间：24小时</Option>
                            <Option value="72">时间：72小时</Option>
                        </Select>
                        &nbsp; &nbsp;
                        <InputGroup compact>
                            <Select
                                defaultValue={this.props.match.params.sn !== '1' ? '序列号' : '标题'}
                                onChange={this.getSelect}
                                style={{width: '100px'}}
                            >
                                <Option value="title">标题</Option>
                                <Option value="device">序列号</Option>
                            </Select>
                            <Input
                                style={{ width: 200 }}
                                placeholder="请输入关键字"
                                defaultValue={this.props.match.params.sn !== '1' ? this.props.match.params.sn : ''}
                                onChange={this.search}
                            />
                        </InputGroup>
                        <Icon
                            style={{fontSize: '18px', lineHeight: '35px', padding: '0 10px'}}
                            type="sync"
                            spin={this.state.sync}
                            onClick={this.refresh}
                        />
                    </div>
                </div>
                : ''
                }
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={this.props.store.codeStore.deviceData}
                    loading={this.state.loading}
                    onChange={this.onChange}
                    expandedRowRender={record => {
                        return (
                            <SonTables
                                category={category}
                                data={record}
                            />
                        )
                    }}
                    expandRowByClick
                    rowClassName={this.setClassName} //表格行点击高亮
                    rowKey="name"
                    footer={() => {
                        return (
                            isgateway
                            ? ''
                            : <div className="none">
                            {'全部消息' + messageCount + '条，列表中未确认消息' + unconfirmed + '条，'}
                            <span
                                style={{color: 'blue', cursor: 'pointer'}}
                                onClick={this.toggleMessage}
                            >
                                {flag ? '查看所有' : '查看未确认'}
                            </span>
                        </div>
                        )
                    }}
                />
            </div>
        );
    }
}
export default DevicemMessage;