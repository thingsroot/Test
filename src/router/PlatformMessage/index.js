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
        isgateway: false,
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
                        className="cursor overflow"
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
        let hours = Date.parse(new Date()) - 72 * 60 * 60 * 1000;
        let time = this.timestampToTime(hours);
        let params = {
            category: 'user',
            name: unescape(_getCookie('user_id')),
            start: 0,
            limit: 100,
            filters: {
                creation: ['>', time]
            }
        };
        if (this.props.match.params.sn) {
            this.setState({
                isgateway: true
                // selectValue: 'device'
            }, ()=>{
                params.filters.device = this.props.match.params.sn
                // this.tick(this.props.match.params.sn)
            })
        }
        this.setState({
            category: params.category,
            name: params.name,
            start: params.start,
            length: params.limit,
            filters: params.filters
        }, ()=>{
            this.getMessageList(params);
        });
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
                                    if (obj.data.value === 1 || obj.data.value === '1') {
                                        sub = v.full_name + '  开启应用' + obj.data.inst + '开机自启动'
                                    } else if (obj.data.value === 0 || obj.data.value === '0') {
                                        sub = v.full_name + '  关闭应用' + obj.data.inst + '开机自启动'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'restart') {
                                    sub = v.full_name + '    重启应用' + obj.data.inst
                                } else if (obj.action === 'start') {
                                    sub = v.full_name + '    启动应用' + obj.data.inst
                                } else if (obj.action === 'stop') {
                                    sub = v.full_name + '   停止应用' + obj.data.inst
                                } else if (obj.action === 'conf') {
                                    sub = v.full_name + '   更改应用' + obj.data.inst + '应用配置'
                                } else if (obj.action === 'upload_comm') {
                                    if (obj.data.sec === 0 || obj.data.sec === '0') {
                                        sub = v.full_name + '   停止上传应用' + obj.data.inst + '报文'
                                    } else if (obj.data.sec !== 0 || obj.data.sec !== '0') {
                                        sub = v.full_name + '   上传应用' + obj.data.inst + '报文'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'install') {
                                    sub = v.full_name + '   安装应用' + obj.data.name + '实例名' + obj.data.inst
                                } else if (obj.action === 'uninstall') {
                                    sub = v.full_name + '   卸载应用' + obj.data.inst
                                } else if (obj.action === 'query_comm') {
                                    sub = v.full_name + '   查询应用' + obj.data.inst + '报文'
                                } else if (obj.action === 'query_log') {
                                    sub = v.full_name + '   应用查询' + obj.data.inst + '日志'
                                } else if (obj.action === 'list') {
                                    sub = v.full_name + '   刷新应用列表'
                                } else if (obj.action === 'upgrade') {
                                    sub = v.full_name + '   升级应用' + obj.data.inst + '到最新版本'
                                } else if (obj.action === 'rename') {
                                    sub = v.full_name + '   重命名应用' + obj.data.inst + '为' + obj.data.new_name
                                } else {
                                    sub = JSON.stringify(obj)
                                }
                            } else if (obj.channel === 'sys') {
                                if (obj.action === 'enable/beta') {
                                    if (obj.data === 0 || obj.data === '0') {
                                        sub = v.full_name + '    关闭网关beta模式'
                                    } else if (obj.data !== 0 || obj.data !== '0') {
                                        sub = v.full_name + '    开启网关beta模式'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'enable/data') {
                                    if (obj.data === 0 || obj.data === '0') {
                                        sub = v.full_name + '    关闭网关数据上传'
                                    } else if (obj.data !== 0 || obj.data === '0') {
                                        sub = v.full_name + '    开启网关数据上传'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'enable/log') {
                                    if (obj.data === 0 || obj.data === '0') {
                                        sub = v.full_name + '    关闭网关日志上送'
                                    } else if (obj.data !== 0 || obj.data !== '0') {
                                        sub = v.full_name + '    开启网关日志上送'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'enable/comm') {
                                    if (obj.data === 0 || obj.data === '0') {
                                        sub = v.full_name + '    停止网关报文上送'
                                    } else if (obj.data !== 0 || obj.data !== '0') {
                                        sub = v.full_name + '    开启网关报文上送'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'restart') {
                                    sub = v.full_name + '    重启网关IOT程序'
                                } else if (obj.action === 'reboot') {
                                    sub = v.full_name + '    重启网关设备'
                                } else if (obj.action === 'cloud_conf') {
                                    sub = v.full_name + '    更新网关云中心配置选项'
                                } else if (obj.action === 'enable/data_one_short') {
                                    if (obj.data === 0  || obj.data === '0') {
                                        sub = v.full_name + '    关闭网关临时上传数据'
                                    } else if (obj.data !== 0 || obj.data !== '0') {
                                        sub = v.full_name + '    开启网关临时上传数据'
                                    } else {
                                        sub = JSON.stringify(obj)
                                    }
                                } else if (obj.action === 'ext/upgrade') {
                                    sub = v.full_name + '    更新网关扩展库' + obj.data.name
                                } else if (obj.action === 'ext/list') {
                                    sub = v.full_name + '    上传网关扩展库列表'
                                } else if (obj.action === 'cfg/download') {
                                    sub = v.full_name + '    下载网关IOT固件配置'
                                } else if (obj.action === 'cfg/upload') {
                                    sub = v.full_name + '    上传网关IOT固件配置'
                                } else if (obj.action === 'upgrade') {
                                    sub = v.full_name + '    升级网关到最新版本'
                                } else if (obj.action === 'enable/event') {
                                    sub = v.full_name + '    更改网关事件上传等级'
                                } else if (obj.action === 'enable/stat') {
                                    sub = v.full_name + '    开启网关统计数据上传'
                                } else if (obj.action === 'batch_script') {
                                    sub = v.full_name + '    执行网关批量操作'
                                } else if (obj.action === 'upgrade/ack') {
                                    sub = v.full_name + '    确认升级网关IOT固件'
                                } else if (obj.action === 'data/query') {
                                    sub = v.full_name + '    请求立刻上传网关数据'
                                } else {
                                    sub = JSON.stringify(obj)
                                }
                            } else if (obj.channel === 'command') {
                                sub = v.full_name + '    执行网关应用设备' + obj.data.cmd + '指令'
                            } else if (obj.channel === 'output') {
                                sub = v.full_name + '    操作网关设备应用' + obj.data.output + '数据输出'
                            } else if (obj.action === 'Delete') {
                                sub = v.full_name + '    删除了一台网关'
                            } else if (obj.action === 'Add') {
                                sub = v.full_name + '    增加了一台网关'
                            } else {
                                sub = JSON.stringify(obj)
                            } //output
                        } else {
                            sub = JSON.stringify(obj)
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
                            user: v.user,
                            fullName: v.full_name,
                            disposed_by: v.disposed_by

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
                if (this.state.text !== '') {
                    this.tick(this.state.text)
                }
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
                    let tableData = this.props.store.codeStore.tableData;
                    tableData.map((v)=>{
                        if (v[this.state.selectValue].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                            newData.push(v)
                        }
                    });
                    this.setState({
                        platform: newData,
                        loading: false
                    });
                    this.props.store.codeStore.setPlatformData(newData);
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
            filters['operation'] = value;
            let params = {
                category: this.state.category,
                name: this.state.name,
                start: this.state.start,
                limit: this.state.length
            };
            params['filters'] = filters;
            this.setState({
                filters: params.filters
            });
            this.getMessageList(params);
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
        let filters = this.state.filters;
        filters['creation'] = ['>', time];
        let params = {
            category: this.state.category,
            name: this.state.name,
            start: this.state.start,
            limit: this.state.length
        };
        params['filters'] = filters;
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
        this.getMessageList(params)
    };
    render () {
        let { selectedRowKeys, columns, category, flag,
            unconfirmed, messageCount, isgateway } = this.state;
        const { platformData } = this.props.store.codeStore;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };
        return (
            <div className="platformMessage">
                {
                    !isgateway
                    ? <div className="searchBox flex">
                    <div style={{minWidth: 250}}>
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
                        style={{
                        minWidth: 810
                    }}
                    >
                        <Select
                            defaultValue="消息类型：全部"
                            style={{ width: 180 }}
                            onChange={this.messageChange}
                        >
                            <Option value="">消息类型：全部</Option>
                            <Option value="Action">消息类型：设备操作</Option>
                            <Option value="Status">消息类型：设备消息</Option>
                        </Select>
                        <Select
                            defaultValue="记录数：100"
                            style={{ width: 140 }}
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
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <InputGroup
                            compact
                        >
                            <Select
                                defaultValue="标题"
                                onChange={this.getSelect}
                                style={{width: '100px'}}
                            >
                                <Option value="title">标题</Option>
                                <Option value="device">序列号</Option>
                            </Select>
                            <Input
                                style={{ width: 200 }}
                                placeholder="请输入关键字"
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
                                {!isgateway ? '全部消息' + messageCount + '条，列表中为确认消息' + unconfirmed + '条，' : ''}
                                <span
                                    onClick={this.toggleMessage}
                                    style={{color: 'blue', cursor: 'pointer'}}
                                >
                                    {!isgateway ? flag ? '查看所有' : '查看未确认' : ''}
                                </span>
                            </div>
                        )
                    }}
                />
            </div>
        );
    }
}
export default PlatformMessage;