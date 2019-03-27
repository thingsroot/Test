import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Table, Divider, Tabs, Button, Popconfirm, message } from 'antd';
import './style.scss';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
const TabPane = Tabs.TabPane;
function getDevicesList (){
    http.get('/api/gateways_list').then(res=>{
        console.log(res)
        const online = [];
        const offline = [];
        const data = [];
        res.message && res.message.length > 0 && res.message.map((v, i)=>{
            v.data.last_updated = v.data.modified.slice(0, -7);
            if (res.message[i].app.data){
                v.data.device_apps_num = Object.keys(res.message[i].app.data).length;
            } else {
                v.data.device_apps_num = 0;
            }
            if (res.message[i].devices.data){
                v.data.device_devs_num = Object.keys(res.message[i].devices.data).length;
            } else {
                v.data.device_devs_num = 0;
            }
            if (v.data.device_status === 'ONLINE'){
                v.data.disabled = false;
                online.push(v.data)
            } else if (v.data.device_status === 'OFFLINE') {
                offline.push(v.data)
                v.data.disabled = true;
            } else {
                v.data.disabled = true;
            }
            data.push(v.data)
        })
        if (status === 'online'){
            this.props.store.appStore.setGatelist(res.message);
        }
        this.setState({
            status,
            data,
            loading: false,
            online,
            offline
        })
    })
}
function callback (key){
    switch (key) {
        case '1':
                this.setState({loading: true})
                this.getDevicesList('online')
            break;
        case '2':
                this.setState({loading: true})
                this.getDevicesList('offline')
            break;
        case '3':
                this.setState({loading: true})
                this.getDevicesList('all')
            break;
        default:
            break;
    }
}
  function confirm (record) {
  http.postToken('/api/method/iot_ui.iot_api.remove_gate', {
      sn: [record.device_sn]
  }).then(res=>{
        if (res.message){
            message.success('移除网关成功')
        }
        this.getDevicesList(this.state.status)
  })
  this.getDevicesList(this.state.status)
}

@inject('store')
class MyGates extends PureComponent {
    constructor (props){
        super(props)
        this.callback = callback.bind(this);
        this.getDevicesList = getDevicesList.bind(this);
        this.confirm = confirm.bind(this);
        this.state = {
            online: [],
            offline: [],
            data: [],
            status: 'online',
            loading: true,
            columns: [{
                title: '名称',
                dataIndex: 'dev_name',
                key: 'dev_name'
              }, {
                title: '描述',
                dataIndex: 'description',
                key: 'description'
              }, {
                title: '上线时间',
                dataIndex: 'last_updated',
                key: 'last_updated',
                width: '180px'
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
                title: '应用数',
                key: 'device_apps_num',
                dataIndex: 'device_apps_num',
                width: '70px'
                }, {
                title: '设备数',
                key: 'device_devs_num',
                dataIndex: 'device_devs_num',
                width: '70px'
                }, {
                title: 'Action',
                key: 'action',
                width: '23%',
                render: (text, record, props) => {
                    props
                    console.log(record, '========================')
                  return (
                      <span>
                        <Link to={{
                            pathname: `/MyGatesDevices/${record.sn}`,
                            state: record
                        }}
                            disabled={record.disabled}
                        >
                            <Button key="1"
                                disabled={record.disabled}
                            >设备</Button>
                        </Link>
                        <Divider type="vertical" />
                        <Link to={{
                            pathname: `/MyGatesDevices/${record.sn}/AppsList`,
                            state: record
                        }}
                            disabled={record.disabled}
                        >
                            <Button key="2"
                                disabled={record.disabled}
                            >应用</Button>
                        </Link>
                        <Divider type="vertical" />
                        <Popconfirm
                            title="你确定要删除这个网关吗?"
                            onConfirm={()=>{
                              this.confirm(record)
                            }}
                            okText="确认"
                            cancelText="取消"
                        >
                        <Button key="3"
                            disabled={record.disabled}
                        >删除网关</Button>
                        <Divider type="vertical" />
                        </Popconfirm>
                      </span>
                    )
                }
              }]
        }
    }
    componentDidMount (){
        this.getDevicesList('online')
    }
    render (){
        let { data, online, offline } = this.state;
        return (
            <div>
                {
                    <Tabs onChange={this.callback}
                        type="card"
                    >
                                                    <TabPane tab="在线"
                                                        key="1"
                                                    >
                                                        <Table columns={
                                                                    this.state.columns
                                                                }
                                                            dataSource={
                                                                online && online.length > 0 ? online : []
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
                                                        key="2"
                                                    ><Table columns={this.state.columns}
                                                        dataSource={
                                                            offline && offline.length > 0 ? offline : []
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
                                                     /></TabPane>
                                                    <TabPane tab="全部"
                                                        key="3"
                                                    ><Table columns={this.state.columns}
                                                        dataSource={
                                                            data && data.length > 0 ? data : []
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
                                                     /></TabPane>
                                                </Tabs>
                }
            </div>
        );
    }
}
export default MyGates;