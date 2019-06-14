import React, { Component } from 'react';
import http from '../../utils/Server';
import { Table, Divider, Tabs, Button, Popconfirm, message, Modal, Input, Icon, Menu, Dropdown, Select, Tag } from 'antd';
import './style.scss';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
const Search = Input.Search;
const TabPane = Tabs.TabPane;
let timer;

@inject('store')
@observer
class MyGates extends Component {
    constructor (props){
        super(props)
        this.state = {
            onlinedata: [],
            offlinedata: [],
            alldata: [],
            status: 'online',
            filter_text: '',
            loading: true,
            visible: false,
            confirmLoading: false,
            refreshing: false,
            sn: '',
            role: {},
            name: '',
            desc: '',
            setName: false,
            record: {},
            index: 2,
            recordVisible: false,
            columns: [
                {
                title: '名称',
                dataIndex: 'dev_name',
                key: 'dev_name',
                sorter: (a, b) => a.dev_name.length - b.dev_name.length,
                render: (props, record)=>{
                    return (
                        <div>
                            {record.owner_type !== 'Cloud Company Group'
                                ? <Tag
                                    color="lime"
                                  >个人</Tag>
                                : <Tag
                                    color="cyan"
                                  >公司</Tag>
                            }
                            {record.dev_name}
                        </div>
                    )
                }
              }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description',
                sorter: (a, b) => a.description && b.description && a.description.length - b.description.length
              }, {
                title: '上线时间',
                dataIndex: 'last_updated',
                key: 'last_updated',
                width: '160px',
                sorter: (a, b) => a.last_updated && b.last_updated && new Date(a.last_updated) - new Date(b.last_updated)
              }, {
                title: '状态',
                key: 'device_status',
                dataIndex: 'device_status',
                width: '80px',
                render: (record)=>{
                    if (record === 'ONLINE'){
                        return <span className="online"><b></b>&nbsp;&nbsp;在线</span>
                    } else if (record === 'OFFLINE') {
                        return <span className="offline"><b></b>&nbsp;&nbsp;离线</span>
                    } else {
                        return <span className="notline"><b></b>&nbsp;&nbsp;未连接</span>
                    }
                }
              }, {
                title: '设备数',
                key: 'device_devs_num',
                dataIndex: 'device_devs_num',
                width: '65px'
                }, {
                title: '应用数',
                key: 'device_apps_num',
                dataIndex: 'device_apps_num',
                width: '65px'
                }, {
                title: '操作',
                key: 'action',
                width: '240px',
                render: (text, record, props) => {
                    props;
                  return (
                      <span>
                        <Link to={{
                            pathname: `/gateway/${record.sn}/devices`,
                            state: record
                        }}
                        >
                            <Button key="1">设备</Button>
                        </Link>
                        <Divider type="vertical" />
                        <Link to={{
                            pathname: `/gateway/${record.sn}/apps`,
                            state: record
                        }}
                        >
                            <Button key="2">应用</Button>
                        </Link>
                        <Divider type="vertical" />
                        <Dropdown
                            disabled={record.disabled}
                            overlay={(
                                <Menu>
                                <Menu.Item key="0">
                                    <Link to={{
                                        pathname: `/gateway/${record.sn}/settings`,
                                        state: record
                                    }}
                                        style={{color: 'rgba(0, 0, 0, 0.65)'}}
                                        disabled={record.disabled}
                                    >
                                        <span key="1"
                                            disabled={record.disabled}
                                        >网关设置</span>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="2">
                                    <Link to={{
                                        pathname: `/gateway/${record.sn}/onlinerecord`,
                                        state: record
                                    }}
                                        style={{color: 'rgba(0, 0, 0, 0.65)'}}
                                        disabled={record.disabled}
                                    >
                                        <span key="1"
                                            disabled={record.disabled}
                                        >在线记录</span>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="1">
                                <span
                                    disabled={record.device_status !== 'ONLINE'}
                                    onClick={()=>{
                                        this.setState({
                                            record
                                        }, ()=>{
                                            this.setState({index: record.owner_type === 'User' ? 2 : 1})
                                            this.showModal('setName')
                                        })
                                    }}
                                >网关属性</span>
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item key="4">
                                    <Popconfirm
                                        title="你确定要删除这个网关吗?"
                                        onConfirm={()=>{
                                        this.confirm(record)
                                        }}
                                        okText="确认"
                                        cancelText="取消"
                                    >
                                        <Button key="3"
                                            disabled={record.device_status !== 'ONLINE'}
                                            style={{border: 'none'}}
                                            type="danger"
                                        >删除网关</Button>
                                    </Popconfirm>
                                </Menu.Item>
                            </Menu>
                            )}
                            trigger={['click']}
                        >
                            <Button>
                                更多<Icon type="down" />
                            </Button>
                        </Dropdown>
                      </span>
                    )
                }
              }
              ]
        }
    }
    componentDidMount (){
        http.get('/api/user_groups_list').then(res=>{
            if (res.ok && res.data[0]){
                this.setState({
                    role: res.data[0]
                })
            }
        });
        let {all, online, offline} = this.props.store.gatewayList;
        let loading = online.length !== 0 ? false : true
        this.setState({
            loading: loading,
            alldata: all,
            onlinedata: online,
            offlinedata: offline
        })

        this.refreshDevicesList();
        timer = setInterval(() => {
            this.refreshDevicesList()
        }, 10000);
    }
    componentWillUnmount () {
        clearInterval(timer)
    }

    refreshDevicesList (){
        let status = this.state.status;
        http.get('/api/gateways_list?status=' + status).then(res=>{
            if (res.ok) {
                const data = status + 'data';
                if (status === 'online') {
                    this.props.store.gatewayList.setOnline(res.data)
                }
                if (status === 'offline') {
                    this.props.store.gatewayList.setOffline(res.data)
                }
                if (status === 'all') {
                    this.props.store.gatewayList.setAll(res.data)
                }
                let arr = this.filterGatewayList(res.data, this.state.filter_text)
                this.setState({
                    loading: false,
                    [data]: arr
                });
            }
        })
    }
    confirm (record) {
        if (record.device_status === 'ONLINE'){
            http.post('/api/gateways_remove', {
                name: record.name
            }).then(res=>{
                if (res.ok){
                    message.success('移除网关成功')
                }
                this.refreshDevicesList()
            })
        }
    }

    onChanges = (e, type) => {
        const events = e || event;
        const value = events.target.value.trim()
        this.setState({
            [type]: value,
            record: {...this.state.record, [type]: value}
        })
    }
    showModal = (name) => {
        this.setState({
            [name]: true
        }, ()=>{
            if (name === 'visible') {
                http.get('/api/user_groups_list').then(res=>{
                    if (res.data && res.data[0]) {
                        this.setState({role: res.data[0]})
                    }
                })
            }
        });
    };
    handleOk = (type) => {
        const { sn, name, desc, index} = this.state;
        const owner_id = index === 1 ? this.state.role.name : this.props.store.session.user_id;
        const owner_type = index === 1 ? 'Cloud Company Group' : 'User';
        const data = {
        'name': sn,
        'dev_name': name,
        'description': desc,
        'owner_type': owner_type,
        'owner_id': owner_id
        };
        this.setState({
            confirmLoading: true
        }, ()=>{
            if (type === 'create'){
            http.post('/api/gateways_create', data).then(res=>{
                if (res.ok) {
                    message.success('绑定成功')
                    this.refreshDevicesList()
                } else {
                    message.error(res.error)
                }
            })
            } else {
                const {record} = this.state;
                http.post('/api/gateways_update', {
                    name: record.sn,
                    dev_name: record.dev_name,
                    description: record.description,
                    owner_type: owner_type,
                    owner_id: owner_id
                }).then(res=>{
                    if (res.ok) {
                        message.success('更改成功')
                        this.setState({
                            setName: false
                        })
                    }
                })
            }
        });
        setTimeout(() => {
            this.setState({
                visible: false,
                confirmLoading: false
            });
        }, 2000);
    }
    handleCancel = (name) => {
        this.setState({
            [name]: false
        });
    }
    filterGatewayList = (data, filter_text) => {
        if (filter_text === undefined || filter_text === '' || data === undefined) {
            return data
        }
        let text = filter_text.toLowerCase()
        let arr = [];
        data.map(item=>{
            if (item.dev_name.toLowerCase().indexOf(text) !== -1 ||
                item.sn.toLowerCase().indexOf(text) !== -1 ||
                ( item.description && item.description.toLowerCase().indexOf(text) !== -1)){
                arr.push(item)
            }
        });
        return arr;
    }
    changeFilter = (text)=>{
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.setState({
            filter_text: text
        }, () => {
            this.timer = setTimeout(() => {
                const name = this.state.status + 'data';
                let data = [];
                const {all, online, offline} = this.props.store.gatewayList;
                if (this.state.status === 'all') {
                    data = all
                }
                if (this.state.status === 'online') {
                    data = online
                }
                if (this.state.status === 'offline') {
                    data = offline
                }
                let arr = this.filterGatewayList(data, this.state.filter_text)
                this.setState({
                    [name]: arr
                })
            }, 200);
        });
    }
    search = (e)=>{
        let text = e.target.value;
        this.changeFilter(text)
    }
    render (){
        let { alldata, onlinedata, offlinedata, confirmLoading } = this.state;
        return (
            <div
                style={{
                    position: 'relative'
                }}
            >
                <Button
                    type="primary"
                    onClick={()=>{
                        this.showModal('visible')
                    }}
                    style={{
                        position: 'absolute',
                        right: 130,
                        top: 0,
                        zIndex: 999
                    }}
                >添加网关</Button>
                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        zIndex: 999
                    }}
                    onClick={()=>{
                        this.props.history.push('/virtualgateways')
                    }}
                >添加虚拟网关</Button>
                <div
                    style={{
                        display: 'flex',
                        position: 'absolute',
                        right: 240,
                        top: 0,
                        zIndex: 999,
                        lineHeight: '30px'
                    }}
                >
                    <Search
                        placeholder="网关名称、描述、序列号"
                        onChange={this.search}
                        style={{ width: 200 }}
                    />
                </div>
                <Modal
                    title="添加网关"
                    visible={this.state.visible}
                    okText="确定"
                    cancelText="取消"
                    onOk={()=>{
                        this.handleOk('create')
                    }}
                    onCancel={()=>{
                        this.handleCancel('visible')
                    }}
                    confirmLoading={confirmLoading}
                >
                    <div className="inputs">
                        <span>序号：</span>
                        <Input
                            onChange={(e)=>{
                                this.onChanges(e, 'sn')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>名称：</span>
                        <Input
                            onChange={(e)=>{
                                this.onChanges(e, 'name')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>描述：</span>
                        <Input
                            onChange={(e)=>{
                                this.onChanges(e, 'desc')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>所属：</span>
                        <div>
                            <Button
                                type={this.state.index === 1 ? 'primary' : ''}
                                onClick={()=>{
                                    this.setState({
                                        index: 1
                                    })
                                }}
                                disabled={this.state.role === {}}
                            >公司</Button>
                            <Button
                                type={this.state.index === 2 ? 'primary' : ''}
                                disabled={this.state.role === {}}
                                onClick={()=>{
                                    this.setState({
                                        index: 2
                                    })
                                }}
                            >个人</Button>
                        </div>
                    </div>
                    <div className="inputs">
                        <span>组名：</span>
                        <Select
                            style={{width: '100%'}}
                            disabled
                        >

                        </Select>
                    </div>
                </Modal>
                <Modal
                    title="网关属性"
                    visible={this.state.setName}
                    onOk={()=>{
                        this.handleOk('setName')
                    }}
                    onCancel={()=>{
                        this.handleCancel('setName')
                    }}
                    confirmLoading={confirmLoading}
                >
                    <div className="inputs">
                        <span>序号：</span>
                        <Input
                            value={this.state.record.sn}
                            disabled
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>名称：</span>
                        <Input
                            value={this.state.record.dev_name}
                            onChange={(e)=>{
                                this.onChanges(e, 'dev_name')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>描述：</span>
                        <Input
                            value={this.state.record.description}
                            onChange={(e)=>{
                                this.onChanges(e, 'description')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>经度：</span>
                        <Input
                            value={this.state.record.longitude}
                            onChange={(e)=>{
                                this.onChanges(e, 'longitude')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>纬度：</span>
                        <Input
                            value={this.state.record.latitude}
                            onChange={(e)=>{
                                this.onChanges(e, 'latitude')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>所属：</span>
                        <div>
                            <Button
                                type={this.state.index === 1 ? 'primary' : ''}
                                onClick={()=>{
                                    this.setState({
                                        index: 1
                                    })
                                }}
                                disabled={this.state.role === {}}
                            >公司</Button>
                            <Button
                                type={this.state.index === 2 ? 'primary' : ''}
                                disabled={this.state.role === {}}
                                onClick={()=>{
                                    this.setState({
                                        index: 2
                                    })
                                }}
                            >个人</Button>
                        </div>
                    </div>
                    <div className="inputs">
                        <span>组名：</span>
                        <Select
                            style={{width: '100%'}}
                            disabled
                        >

                        </Select>
                    </div>
                </Modal>
                <div style={{position: 'relative'}}>
                    <Button
                        disabled={this.state.refreshing}
                        style={{position: 'absolute', left: 200, top: 0, zIndex: 999}}
                        onClick={()=>{
                            this.setState({refreshing: true})
                            this.refreshDevicesList()
                            setTimeout(()=> {
                                this.setState({refreshing: false})
                            }, 2000)
                        }}
                    >
                        <Icon type="sync"/>
                    </Button>
                    {
                        <Tabs
                            type="card"
                            activeKey={this.state.status}
                            onChange={(value)=>{
                                let status = value
                                let data = this.state[status + 'data']
                                let loading = data && data.length > 0 ? false : true
                                this.setState({loading: loading, status: status}, ()=>{
                                    this.refreshDevicesList()
                                })
                            }}
                        >
                        <TabPane tab="在线"
                            key="online"
                        >
                            <Table columns={
                                        this.state.columns
                                    }
                                dataSource={
                                    onlinedata && onlinedata.length > 0 ? onlinedata : []
                                }
                                bordered
                                loading={this.state.loading}
                                rowKey="sn"
                                size="small"
                                rowClassName={(record, index) => {
                                    let className = 'light-row';
                                    if (index % 2 === 1) {
                                        className = 'dark-row';
                                    }
                                    return className;
                                }}
                            /></TabPane>
                        <TabPane tab="离线"
                            key="offline"
                        >
                            <Table columns={this.state.columns}
                                dataSource={
                                    offlinedata && offlinedata.length > 0 ? offlinedata : []
                                }
                                rowKey="sn"
                                rowClassName={(record, index) => {
                                    let className = 'light-row';
                                    if (index % 2 === 1) {
                                        className = 'dark-row';
                                    }
                                    return className;
                                }}
                                bordered
                                loading={this.state.loading}
                                size="small "
                            />
                        </TabPane>
                        <TabPane tab="全部"
                            key="all"
                        >
                            <Table columns={this.state.columns}
                                dataSource={
                                    alldata && alldata.length > 0 ? alldata : []
                                }
                                rowClassName={(record, index) => {
                                    let className = 'light-row';
                                    if (index % 2 === 1) {
                                        className = 'dark-row';
                                    }
                                    return className;
                                }}
                                rowKey="sn"
                                bordered
                                loading={this.state.loading}
                                size="small "
                            />
                        </TabPane>
                    </Tabs>
                    }
                </div>
            </div>
        );
    }
}
export default MyGates;