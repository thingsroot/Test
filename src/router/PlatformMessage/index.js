import React, { Component } from 'react';
import { Table, Input, Select, Button, message, Icon } from 'antd'
import SonTable from './SonTable';
import './style.scss'
import http from '../../utils/Server';
import axios from 'axios';
import { _getCookie } from '../../utils/Session';
import {inject, observer} from 'mobx-react';
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
class PlatformMessage extends Component {
    state = {
        name: '',
        category: '',
        start: 0,
        length: 10,
        filters: {},
        dataSource: [],
        selectValue: 'title',
        text: '',
        platform: [],
        loading: false,
        selectedRowKeys: [],
        visible: false,
        columns: [
            {
                title: '标题',
                dataIndex: 'title',
                width: '30%',
                render: (text, record) => (
                    <span
                        className="cursor"
                        style={record.disposed === 0 ? disposed : posed}
                    >
                        {text}
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
                title: '消息类型',
                dataIndex: 'operation',
                width: '10%',
                render: (text, record) => (
                    <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
                )
            }
        ],
        unconfirmed: 0,
        messageCount: 0,
        flag: false,
        sync: false
    };
    componentDidMount (){
        let params = {
            category: 'user',
            name: unescape(_getCookie('user_id')),
            start: 0,
            limit: 100,
            filters: {}
        };
        this.setState({
            category: params.category,
            name: params.name,
            start: params.start,
            length: params.limit,
            filters: params.filters
        });
        this.getMessageList(params);
    }

    onChange = (pagination, filters, sorter)=>{
        console.log('params', pagination, filters, sorter)
    };

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
                activities: arr,
                disposed: 1
            };
            http.post('/api/activities_dispose', params).then(res=>{
                res;
                let platform = this.state.platform;
                platform && platform.length > 0 && platform.map((w, key)=>{
                    key;
                    arr.map((v, key1)=>{
                        key1;
                        if (w.name === v) {
                            w.disposed = 1;
                        }
                    });
                });
                this.props.store.codeStore.setPlatformData(platform);
                this.props.store.codeStore.setTableData(platform);
                this.setState({
                    selectedRowKeys: [],
                    loading: false,
                    platform: platform,
                    unconfirmed: this.state.unconfirmed - arr.length
                });
            }).catch(err=>{
                console.log(err)
            })
        }
    };
    //确认全部消息
    confAllMessage = ()=>{
        this.setState({
            loading: true
        });
        let data = [];
        let platform = this.state.platform;
        platform && platform.length > 0 && platform.map((v, key)=>{
            key;
            if (v.disposed === 0) {
                data.push(v.name)
            }
        });
        let params = {
            category: this.state.category,
            activities: data,
            disposed: 1
        };
        http.post('/api/activities_dispose', params).then(res=>{
            res;
            platform && platform.length > 0 && platform.map((v, key)=>{
                key;
                if (v.disposed === 0) {
                    v.disposed = 1;
                }
            });
            console.log(platform);
            this.props.store.codeStore.setPlatformData(platform);
            this.props.store.codeStore.setTableData(platform);
            this.setState({
                selectedRowKeys: [],
                loading: false,
                platform: platform,
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
            url: '/api/platform_activities_lists',
            method: 'GET',
            params: params
        }).then(res=>{
            if (res.data.ok === true) {
                let sourceData = res.data.data.list.data;
                let data = [];
                let source = [];
                let unconfirmed = 0;
                if (sourceData) {
                    sourceData.map((v)=>{
                        if (v.disposed === 0) {
                            unconfirmed++
                        }
                        let obj = JSON.parse(v.message);
                        let sub = '';
                        //设备状态
                        if (obj && obj.hasOwnProperty('device_status')) {
                            if (obj.device_status === 'ONLINE'){
                                sub = '设备上线'
                            } else if (obj.device_status === 'OFFLINE'){
                                sub = '设备离线'
                            }
                            //设备操作
                        } else if (obj && obj.hasOwnProperty('action')){
                            if (obj.channel === 'app') {
                                if (obj.action === 'option') {   //开机自启动
                                    if (obj.data.value === 1) {
                                        sub = '开启应用' + obj.data.inst + '开机自启动'
                                    } else if (obj.data.value === 0) {
                                        sub = '关闭应用' + obj.data.inst + '开机自启动'
                                    }
                                } else if (obj.action === 'restart') {
                                    sub = '重启应用' + obj.data.inst
                                } else if (obj.action === 'start') {
                                    sub = '启动应用' + obj.data.inst
                                } else if (obj.action === 'stop') {
                                    sub = '停止应用' + obj.data.inst
                                } else if (obj.action === 'conf') {
                                    sub = '更改应用' + obj.data.inst + '应用配置'
                                } else if (obj.action === 'upload_comm') {
                                    if (obj.data.sec === 0) {
                                        sub = '停止上传应用' + obj.data.inst + '报文'
                                    } else if (obj.data.sec === 120) {
                                        sub = '上传应用' + obj.data.inst + '报文'
                                    }
                                } else if (obj.action === 'install') {
                                    sub = '安装应用' + obj.data.name + '实例名' + obj.data.inst
                                } else if (obj.action === 'uninstall') {
                                    sub = '卸载应用' + obj.data.inst
                                } else if (obj.action === 'query_comm') {
                                    sub = '应用' + obj.data.inst + '查询报文'
                                } else if (obj.action === 'query_log') {
                                    sub = '应用' + obj.data.inst + '查询日志'
                                } else if (obj.action === 'list') {
                                    sub = '刷新应用列表'
                                } else if (obj.action === 'upgrade') {
                                    sub = '应用' + obj.data.inst + '升级到最新版本'
                                } else if (obj.action === 'rename') {
                                    sub = '应用' + obj.data.inst + '重命名为' + obj.data.new_name
                                }
                            } else if (obj.channel === 'sys') {
                                if (obj.action === 'enable/beta') {
                                    if (obj.data === 0) {
                                        sub = '网关关闭beta模式'
                                    } else if (obj.data === 1) {
                                        sub = '网关开启beta模式'
                                    }
                                } else if (obj.action === 'enable/data') {
                                    if (obj.data === 0) {
                                        sub = '网关关闭数据上传'
                                    } else if (obj.data === 1) {
                                        sub = '网关开启数据上传'
                                    }
                                } else if (obj.action === 'enable/log') {
                                    if (obj.data === '') {
                                        sub = '网关关闭日志上送'
                                    } else if (obj.data === 60) {
                                        sub = '网关开启日志上送'
                                    }
                                } else if (obj.action === 'enable/comm') {
                                    if (obj.data === 0) {
                                        sub = '网关停止报文上送'
                                    } else if (obj.data === 60) {
                                        sub = '网关开启报文上送'
                                    }
                                } else if (obj.action === 'restart') {
                                    sub = '网关IOT程序重启'
                                } else if (obj.action === 'reboot') {
                                    sub = '网关设备重启'
                                } else if (obj.action === 'cloud_conf') {
                                    sub = '网关云中心配置选项更新'
                                } else if (obj.action === 'enable/data_one_short') {
                                    if (obj.data === '') {
                                        sub = '网关关闭临时上传数据'
                                    } else if (obj.data === 60) {
                                        sub = '网关开启临时上传数据'
                                    }
                                } else if (obj.action === 'ext/upgrade') {
                                    sub = '网关更新扩展库' + obj.data.name
                                } else if (obj.action === 'ext/list') {
                                    sub = '网关上传扩展库列表'
                                } else if (obj.action === 'cfg/download') {
                                    sub = '网关IOT固件配置下载'
                                } else if (obj.action === 'cfg/upload') {
                                    sub = '网关IOT固件配置上传'
                                } else if (obj.action === 'upgrade') {
                                    sub = '网关升级到最新版本'
                                } else if (obj.action === 'enable/event') {
                                    sub = '网关更改事件上传等级'
                                } else if (obj.action === 'enable/stat') {
                                    sub = '网关开启统计数据上传'
                                } else if (obj.action === 'batch_script') {
                                    sub = '网关执行批量操作'
                                } else if (obj.action === 'upgrade/ack') {
                                    sub = '网关IOT固件升级确认'
                                } else if (obj.action === 'data/query') {
                                    sub = '网关请求立刻上传数据'
                                }
                            } else if (obj.channel === 'command') {
                                sub = '网关应用设备执行' + obj.data.cmd + '指令'
                            } else if (obj.channel === 'output') {
                                sub = '网关设备应用' + obj.data.output + '数据输出'
                            }  //output
                        }
                        data.push({
                            title: sub,
                            device: v.device,
                            creation: v.creation.split('.')[0],
                            operation: v.operation,
                            disposed: v.disposed,
                            name: v.name,
                            status: v.status,
                            message: v.message,
                            user: v.user
                        });
                        source.push(sub);
                    });
                }
                this.setState({
                    loading: false,
                    platform: data,
                    unconfirmed: unconfirmed,
                    sync: false,
                    messageCount: res.data.data.count
                });
                this.props.store.codeStore.setPlatformData(data);
                this.props.store.codeStore.setTableData(data);
            } else {
                message.error('获取消息列表失败！')
            }
        });
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
        })
    };

    tick = (text)=>{
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            this.setState({
                text: text
            })
        }, 1000);
    };

    search = (inpVal)=>{
        let text = event.target.value;
        this.tick(text);
        if (text) {
            let newData = [];
            let tableData = this.props.store.codeStore.tableData;
            tableData.map((v)=>{
                if (v[inpVal].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                    newData.push(v)
                }
            });
            this.setState({
                platform: newData
            });
            this.props.store.codeStore.setPlatformData(newData);
        } else {
            let data = this.props.store.codeStore.tableData;
            this.props.store.codeStore.setPlatformData(data);
        }
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
        if (`${value}`) {
            let data = [];
            let tableData = this.props.store.codeStore.tableData;
            tableData.map((v)=>{
                if (v.operation === `${value}`) {
                    data.push(v);
                }
            });
            let filters = this.state.filters;
            filters['operation'] = value;
            console.log(filters);
            this.setState({
                platform: data,
                filters: filters
            });
            this.props.store.codeStore.setPlatformData(data)
        } else {
            let data = this.props.store.codeStore.tableData;
            this.props.store.codeStore.setPlatformData(data);
            this.setState({
                platform: data
            });
        }
    };
    //时间
    messageTime = (value)=>{
        let hours = Date.parse(new Date()) - `${value}` * 60 * 60 * 1000;
        let time = this.timestampToTime(hours);
        let params = {
            category: this.state.category,
            name: this.state.name,
            start: this.state.start,
            limit: this.state.length,
            filters: {
                'creation': [
                    '>',
                    time
                ]
            }
        };
        this.setState({
            filters: params.filters
        });
        this.getMessageList(params);
    };
    //刷新
    refresh = ()=>{
        this.setState({
            sync: true
        });
        let params = {
            category: 'user',
            name: unescape(_getCookie('user_id')),
            start: 0,
            limit: this.state.length,
            filters: this.state.filters
        };
        console.log(params);
        this.getMessageList(params)
    };
    render () {
        let { selectValue, selectedRowKeys, columns, category, flag,
            unconfirmed, messageCount } = this.state;
        const { platformData } = this.props.store.codeStore;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <div className="platformMessage">
                <div className="searchBox">
                    <Button onClick={()=>{
                        this.confMessage(selectedRowKeys)
                    }}
                    >确认消息</Button>
                    <Button onClick={()=>{
                        this.confAllMessage()
                    }}
                    >确认所有消息</Button>
                    <Select defaultValue="消息类型：全部"
                        style={{ width: 180 }}
                        onChange={this.messageChange}
                    >
                        <Option value="">消息类型：全部</Option>
                        <Option value="Action">消息类型：设备操作</Option>
                        <Option value="Status">消息类型：设备消息</Option>
                    </Select>
                    <Select defaultValue="记录数：100"
                        style={{ width: 140 }}
                        onChange={this.messageTotal}
                    >
                        <Option value="100">记录数：100</Option>
                        <Option value="300">记录数：300</Option>
                        <Option value="500">记录数：500</Option>
                    </Select>
                    <Select defaultValue="时间：默认"
                        style={{ width: 140 }}
                        onChange={this.messageTime}
                    >
                        <Option value="1">时间：1小时</Option>
                        <Option value="6">时间：6小时</Option>
                        <Option value="24">时间：24小时</Option>
                        <Option value="72">时间：72小时</Option>
                    </Select>
                    <div style={{
                        width: '340px',
                        position: 'absolute',
                        right: '0',
                        top: '0'
                    }}
                    >
                        <InputGroup compact>
                            <Select defaultValue="标题"
                                onChange={this.getSelect}
                                style={{width: '100px'}}
                            >
                                <Option value="title">标题</Option>
                                <Option value="device">序列号</Option>
                            </Select>
                            <Input
                                style={{ width: '70%' }}
                                placeholder="请输入关键字"
                                onChange={
                                    ()=>{
                                        this.search(selectValue)
                                    }
                                }
                            />
                        </InputGroup>
                    </div>
                    <Icon
                        style={{fontSize: '18px', lineHeight: '35px', padding: '0 10px'}}
                        type="sync"
                        spin={this.state.sync}
                        onClick={this.refresh}
                    />
                </div>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={platformData}
                    loading={this.state.loading}
                    onChange={this.onChange}
                    rowKey="name"
                    expandRowByClick
                    expandedRowRender={record => {
                        return (
                            <SonTable
                                category={category}
                                data={record}
                            />
                        )
                    }}
                    footer={() => {
                        return (
                            <div className="none">
                                {'全部消息' + messageCount + '条，列表中为确认消息' + unconfirmed + '条，'}
                                <a
                                    onClick={this.toggleMessage}
                                >
                                    {flag ? '查看所有' : '查看未确认'}
                                </a>
                            </div>
                        )
                    }}
                />
            </div>
        );
    }
}
export default PlatformMessage;