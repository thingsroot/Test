import React, { PureComponent } from 'react';
import { Table, Input, Select, Button, message } from 'antd'
import { Link } from 'react-router-dom'
import './style.scss'
import http from '../../utils/Server';
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

const columns = [{
    title: '标题',
    dataIndex: 'title',
    width: '25%',
    render: (text, record) => (
        <Link to={`/platformDetails/${record.name}`}
            style={record.disposed === 0 ? disposed : posed}
        >{text}
        </Link>
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
}, {
    title: '消息类型',
    dataIndex: 'event_level',
    width: '10%',
    render: (text, record) => (
        <span style={record.disposed === 0 ? disposed : posed}>{text}</span>
    )
}];

//表格onChange
const onChange = (pagination, filters, sorter)=>{
    console.log('params', pagination, filters, sorter)
};


class DevicemMessage extends PureComponent {
    state = {
        length: 100,
        time: '2019-02-22 15:52:00',
        tableData: [],
        platformData: [],
        dataSource: [],
        selectValue: 'title',
        text: '',
        loading: false,
        selectRow: []
    };
    componentDidMount (){
        this.getMessageList(this.state.length, this.state.time);
    }
    rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(selectedRows);
            this.setState({
                selectRow: selectedRows
            })
        },
        getCheckboxProps: record => ({
            disabled: record.name === 'Disabled User', // Column configuration not to be checked
            name: record.name
        })
    };
    //确认消息
    confMessage = (arr)=>{
        if (arr.length === 0) {
            message.warning('请您先选择要确认的消息！');
        } else {
            let params = {
                disposed: 1,
                activities: arr
            };
            http.postToken('/api/method/iot.user_api.device_event', params).then(res=>{
                console.log(res);
            });
        }
    };
    //确认消息
    confAllMessage = ()=>{
        message.warning('请您先选择要确认的消息！');
    };
    //获取消息列表
    getMessageList = (num, time)=>{
        this.setState({
            loading: true
        });
        console.log(time);
        http.postToken('/api/method/iot.user_api.device_event?limit=' + num).then(res=>{
            console.log(res.message)
            this.setState({
                loading: true
            });
            let data = [];
            let source = [];
            if (res.message) {
                res.message.map((v)=>{
                    data.push({
                        title: v.event_info,
                        device: v.event_source,
                        creation: v.creation.split('.')[0],
                        operation: v.event_type,
                        disposed: v.disposed,
                        name: v.name,
                        event_level: v.event_level
                    });
                    source.push(v.event_type);
                });
            }
            this.setState({
                platformData: data,
                tableData: data,
                loading: false
            })
        });
    };
    //时间戳转换
    timestampToTime = (timestamp)=>{
        var date = new Date(timestamp);
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
        var h = date.getHours() + ':';
        var m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()) + ':';
        var s = '00';
        return Y + M + D + h + m + s;
    };
    //搜索框改变值
    getSelect = (text)=>{
        console.log(text);
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
            }, ()=>{
                console.log(this.state.text)
            })
        }, 1000);
    };
    search = (inpVal)=>{
        let text = event.target.value;
        this.tick(text);
        let newData = [];
        this.state.tableData.map((v)=>{
            if (v[inpVal].indexOf(text) !== -1) {
                newData.push(v)
            }
        });
        if (text) {
            this.setState({
                platformData: newData
            });
        }
    };
    //最大记录数
    messageTotal = (value)=>{
        let num = `${value}`;
        let time = this.state.time;
        this.setState({
            length: num
        });
        this.getMessageList(num, time);
    };
    //筛选消息类型
    messageChange = (value)=>{
        let data = [];
        if (`${value}`) {
            this.state.tableData.map((v)=>{
                if (v.operation === `${value}`) {
                    data.push(v);
                }
            });
            this.setState({
                platformData: data
            })
        }
    };
    //时间
    messageTime = (value)=>{
        console.log(`${value}`);
        // let hours = Date.parse(new Date()) - `${value}` * 60 * 60 * 1000;
        // let time = this.timestampToTime(hours);
    };

    render () {
        let selectValue = this.state.selectValue;
        let selectRow = this.state.selectRow;
        return (
            <div className="platformMessage">
                <div className="searchBox">
                    <Select defaultValue="消息类型"
                        style={{ width: 120 }}
                        onChange={this.messageChange}
                    >
                        <Option value="">全部消息类型</Option>
                        <Option value="Action">设备操作</Option>
                        <Option value="Status">设备消息</Option>
                    </Select>
                    <Select defaultValue="记录数"
                        style={{ width: 120 }}
                        onChange={this.messageTotal}
                    >
                        <Option value="100">100</Option>
                        <Option value="300">300</Option>
                        <Option value="500">500</Option>
                    </Select>
                    <Select defaultValue="时间"
                        style={{ width: 120 }}
                        onChange={this.messageTime}
                    >
                        <Option value="1">1小时</Option>
                        <Option value="6">6小时</Option>
                        <Option value="24">24小时</Option>
                        <Option value="72">72小时</Option>
                    </Select>
                    <Button onClick={()=>{
                        this.confMessage(selectRow)
                    }}
                    >确认消息</Button>
                    <Button onClick={()=>{
                        this.confAllMessage()
                    }}
                    >确认所有消息</Button>
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
                </div>
                <Table
                    rowSelection={this.rowSelection}
                    columns={columns}
                    dataSource={this.state.platformData}
                    loading={this.state.loading}
                    onChange={onChange}
                    rowKey="name"
                />
            </div>
        );
    }
}
export default DevicemMessage;