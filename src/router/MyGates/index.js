import React, { PureComponent } from 'react';
import http from '../../utils/Server';
import { Table, Divider, Tabs, Button, Popconfirm, message, Modal, Input, Icon, Menu, Dropdown } from 'antd';
import './style.scss';
import { inject } from 'mobx-react';
import { Link } from 'react-router-dom';
import { _getCookie } from '../../utils/Session';
const TabPane = Tabs.TabPane;
let timer;
function getDevicesList (status){
    http.get('/api/gateway_list?status=' + status).then(res=>{
        console.log(res)
        this.setState({
            [status]: res.message,
            loading: false,
            status
        })
    })
    // http.get('/api/gateways_list').then(res=>{
    //     const online = [];
    //     const offline = [];
    //     const data = [];
    //     res.message && res.message.length > 0 && res.message.map((v, i)=>{
    //         if (v.data) {
    //             v.data.last_updated = v.data.modified.slice(0, -7);
    //             if (res.message[i].app.data){
    //                 v.data.device_apps_num = Object.keys(res.message[i].app.data).length;
    //             } else {
    //                 v.data.device_apps_num = 0;
    //             }
    //             if (res.message[i].devices.data){
    //                 v.data.device_devs_num = Object.keys(res.message[i].devices.data).length;
    //             } else {
    //                 v.data.device_devs_num = 0;
    //             }
    //             if (v.data.device_status === 'ONLINE'){
    //                 v.data.disabled = false;
    //                 online.push(v.data)
    //             } else if (v.data.device_status === 'OFFLINE') {
    //                 offline.push(v.data)
    //                 v.data.disabled = true;
    //             } else {
    //                 v.data.disabled = true;
    //             }
    //             data.push(v.data)
    //         }
    //     })
    //     if (status === 'online'){
    //         this.props.store.appStore.setGatelist(res.message);
    //     }
        // this.setState({
        //     status,
        //     data,
        //     loading: false,
        //     online,
        //     offline
        // })
    // })
}
  function confirm (record) {
     if (record.device_status === 'ONLINE'){
        http.postToken('/api/gateways_remove', {
            name: record.name
          }).then(res=>{
              if (res.ok){
                message.success('移除网关成功')
            }
            this.getDevicesList(this.state.status)
          })
     }
//   http.postToken('/api/method/iot_ui.iot_api.remove_gate', {
//       sn: [record.device_sn]
//   }).then(res=>{
//         if (res.message){
//             message.success('移除网关成功')
//         }
//         this.getDevicesList(this.state.status)
//   })
//   this.getDevicesList(this.state.status)
}
// const menu = (
//         <Menu>
//         <Menu.Item key="0">
//           <a href="#" onClick={()=>{
//               console.log(this)
//           }}>更改名称</a>
//         </Menu.Item>
//         <Menu.Item key="1">
//           <a href="#">更改经纬度</a>
//         </Menu.Item>
//         <Menu.Item key="2">
//           <a href="#">查看和操作应用</a>
//         </Menu.Item>
//         <Menu.Item key="3">
//           <a href="#">浏览设备数据</a>
//         </Menu.Item>
//         <Menu.Divider />
//         <Menu.Item key="4">3rd menu item</Menu.Item>
//       </Menu>
// )
@inject('store')
class MyGates extends PureComponent {
    constructor (props){
        super(props)
        this.getDevicesList = getDevicesList.bind(this);
        this.confirm = confirm.bind(this);
        this.state = {
            online: [],
            offline: [],
            all: [],
            status: 'online',
            loading: true,
            visible: false,
            confirmLoading: false,
            sn: '',
            name: '',
            desc: '',
            setName: false,
            record: {},
            recordVisible: false,
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
                title: '操作',
                key: 'action',
                width: '23%',
                render: (text, record, props) => {
                    props;
                  return (
                      <span>
                        <Link to={{
                            pathname: `/MyGatesDevices/${record.sn}`,
                            state: record
                        }}
                        >
                            <Button key="1">设备</Button>
                        </Link>
                        <Divider type="vertical" />
                        <Link to={{
                            pathname: `/MyGatesDevices/${record.sn}/AppsList`,
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
                                        pathname: `/MyGatesDevices/${record.sn}/setgateway`,
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
                                        pathname: `/MyGatesDevices/${record.sn}/gatewayrecord`,
                                        state: record
                                    }}
                                        style={{color: 'rgba(0, 0, 0, 0.65)'}}
                                        disabled={record.disabled}
                                    >
                                        <span key="1"
                                            disabled={record.disabled}
                                        >网关在线记录</span>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="1">
                                <a
                                    disabled={record.device_status !== 'ONLINE'}
                                    onClick={()=>{
                                        console.log(record)
                                        this.setState({
                                            record
                                        }, ()=>{
                                            this.showModal('setName')
                                        })
                                    }}
                                >更改名称及经纬度</a>
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
              }]
        }
    }
    componentDidMount (){
        this.getDevicesList(this.state.status)
        timer = setInterval(() => {
            this.getDevicesList('online')
        }, 10000);
    }
    componentWillUnmount () {
        clearInterval(timer)
    }
    onChanges = (type) => {
        console.log(event.target.value)
        const value = event.target.value.trim()
        this.setState({
            [type]: value,
            record: {...this.state.record, [type]: value}
        })
        // switch (type){
        //     case 'sn':
        //         this.setState({
        //             sn: value
        //         })
        //         break;
        //     case 'name':
        //         this.setState({
        //             name: value
        //         })
        //         break;
        //     case 'desc':
        //         this.setState({
        //             desc: value
        //         })
        //         break;
        //     default: '';
        // }
    }
    showModal = (name) => {
        this.setState({
          [name]: true
        });
      }
      handleOk = (type) => {
          const { sn, name, desc} = this.state;
          const data = {
            'name': sn,
            'dev_name': name,
            'description': desc,
            'owner_type': 'User',
            'owner_id': unescape(_getCookie('user_id'))
          };
        this.setState({
            confirmLoading: true
          }, ()=>{
              if (type === 'create'){
                http.postToken('/api/gateways_create', data).then(res=>{
                    if (res.ok) {
                      message.success('绑定成功')
                      this.getDevicesList('online')
                    } else {
                      message.error(res.error)
                    }
                })
              } else {
                  const {record} = this.state;
                  http.postToken('/api/gateways_update', {
                        name: record.sn,
                        dev_name: record.dev_name,
                        description: record.description,
                        owner_type: 'User',
                        owner_id: unescape(_getCookie('user_id'))
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
    render (){
        let { all, online, offline, confirmLoading } = this.state;
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
                >添加ThingsLink</Button>
                <Button
                    type="primary"
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        zIndex: 999
                    }}
                    onClick={()=>{
                        this.props.history.push('/MyVirtualGates')
                    }}
                >添加虚拟网关</Button>
                <Modal
                    title="添加ThingsLink网关"
                    visible={this.state.visible}
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
                            onChange={()=>{
                                this.onChanges('sn')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>名称：</span>
                        <Input
                            onChange={()=>{
                                this.onChanges('name')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>描述：</span>
                        <Input
                            onChange={()=>{
                                this.onChanges('desc')
                            }}
                            placeholder="选填"
                        />
                    </div>
                </Modal>
                <Modal
                    title="更改名称"
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
                            onChange={()=>{
                                console.log(event)
                                this.onChanges('dev_name')
                            }}
                            placeholder="必填"
                        />
                    </div>
                    <div className="inputs">
                        <span>描述：</span>
                        <Input
                            value={this.state.record.description}
                            onChange={()=>{
                                this.onChanges('description')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>经度：</span>
                        <Input
                            value={this.state.record.longitude}
                            onChange={()=>{
                                this.onChanges('longitude')
                            }}
                            placeholder="选填"
                        />
                    </div>
                    <div className="inputs">
                        <span>纬度：</span>
                        <Input
                            value={this.state.record.latitude}
                            onChange={()=>{
                                this.onChanges('latitude')
                            }}
                            placeholder="选填"
                        />
                    </div>
                </Modal>
                <div style={{position: 'relative'}}>
                    <Button
                        style={{position: 'absolute', left: 200, top: 0, zIndex: 999}}
                        onClick={()=>{
                            this.getDevicesList(this.state.status)
                        }}
                    >
                        <Icon type="sync"/>
                    </Button>
                    {
                        <Tabs
                            type="card"
                            onChange={(value)=>{
                                this.setState({loading: true}, ()=>{
                                    if (value === '1') {
                                        this.getDevicesList('online')
                                    } else if (value === '2') {
                                        this.getDevicesList('offline')
                                    } else {
                                        this.getDevicesList('all')
                                    }
                                })
                            }}
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
                                                        >
                                                            <Table columns={this.state.columns}
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
                                                            />
                                                        </TabPane>
                                                        <TabPane tab="全部"
                                                            key="3"
                                                        >
                                                            <Table columns={this.state.columns}
                                                                dataSource={
                                                                    all && all.length > 0 ? all : []
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