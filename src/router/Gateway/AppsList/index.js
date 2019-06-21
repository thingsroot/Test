import React, { Component } from 'react';
import { Table, Button, Icon, message, Tooltip } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Action from './Action';
import app from '../../../assets/images/app.png'
import AppConfig from '../../AppsInstall/AppConfig';
import {ConfigStore} from '../../../utils/ConfigUI';
import './style.scss';
// const openNotification = () => {
//   notification.open({
//     message: 'Notification Title',
//     description:
//       'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
//     onClick: () => {
//       console.log('Notification Clicked!');
//     }
//   });
// };
@withRouter
@inject('store')
@observer
class AppsList extends Component {
    constructor (props){
        super(props)
        this.timer = undefined
        this.state = {
            data: [],
            pagination: {},
            loading: true,
            forceRefreshEnable: true,
            configStore: new ConfigStore(),
            edit_app_info: {},
            edit_app_inst: '',
            show_app_config: false,
            gateway_sn: '',
            url: window.location.pathname,
            sign: false,
            columns: [{
                title: '',
                dataIndex: 'data.icon_image',
                key: 'img',
                width: '100px',
                className: 'cursor',
                render: (record)=>{
                    if (record) {
                        return (
                            <img
                                src={record}
                                alt=""
                                style={{width: 50, height: 50}}
                            />
                        )
                    } else {
                        return (
                            <img
                                src={app}
                                alt=""
                                style={{width: 50, height: 50}}
                            />
                        )
                    }
                }
            }, {
                title: '实例名',
                dataIndex: 'inst_name',
                sorter: (a, b) => a.inst_name.length - b.inst_name.length,
                width: '20%',
                className: 'cursor'
            }, {
                title: '版本',
                dataIndex: 'version',
                key: 'version',
                className: 'cursor',
                render: (props, record)=>{
                    if (record.data){
                        if (record.latestVersion > props) {
                            return (
                                <span style={{color: 'blue'}}>
                                  {props} <Icon type="arrow-up"/>
                                </span>
                            )
                        } else if (record.islocal === 1) {
                            return (
                                <span style={{color: 'orange'}}>
                                  {props} <Icon type="edit"/>
                                </span>
                            )
                        } else {
                            return <span>{props}</span>
                        }
                    } else {
                        return (
                            <span style={{color: 'orange'}}>本地</span>
                        )
                    }
                }
            }, {
                title: '设备数',
                dataIndex: 'devs_len',
                key: 'devs_len',
                className: 'cursor'
            }, {
                title: '状态',
                dataIndex: 'status',
                className: 'cursor',
                render: record=>{
                    if (record === 'running'){
                        return (
                          <span style={{background: '#00a65a', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                        )
                    } else {
                        return (
                            <span style={{background: '#f39c12', display: 'inline-block', padding: '1px 5px', borderRadius: '2px', color: '#fff'}}>{record}</span>
                        )
                    }
                }
            }, {
              title: '启动时间',
              dataIndex: 'running',
              className: 'cursor'
            }
          ]
        }
    }
    componentDidMount () {
        const { gatewayInfo } = this.props.store;
        this.setState({gateway_sn: this.props.gateway}, () =>{
            this.setData(gatewayInfo.apps)
            gatewayInfo.setAppsIsShow(true)
            if (gatewayInfo.apps_count !== 0) {
                this.setState({loading: false})
            }
            this.fetch();
            this.timer = setInterval(() => {
                this.fetch()
            }, 3000);
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway_sn){
            this.setState({
                loading: true,
                gateway_sn: nextProps.gateway
            }, ()=>{
                this.fetch();
            })
        }
    }
    componentWillUnmount (){
        const { gatewayInfo } = this.props.store;
        clearInterval(this.timer)
        gatewayInfo.setAppsIsShow(false)
    }
    // handleTableChange = (pagination, filters) => {
    //   const pager = { ...this.state.pagination };
    //   pager.current = pagination.current;
    //   this.setState({
    //     pagination: pager
    //   });
    //   this.fetch({
    //     results: pagination.pageSize,
    //     page: pagination.current,
    //     // sortField: sorter.field,
    //     // sortOrder: sorter.order,
    //     ...filters
    //   });
    // }
    fetch = () => {
        const {gatewayInfo} = this.props.store
        let enable_beta = gatewayInfo.data.enable_beta
        if (enable_beta === undefined) {
            enable_beta = 0
        }
        http.get('/api/gateways_app_list?gateway=' + this.state.gateway_sn + '&beta=' + enable_beta).then(res=>{
            if (res.ok){
                this.props.store.gatewayInfo.setApps(res.data)
                this.setData(res.data)
            } else {
                message.error(res.error)
            }
            this.setState({
                loading: false,
                sign: false
            })
        })
    }
    setData = (apps)=> {
        const pagination = { ...this.state.pagination };
        this.setState({
            data: apps,
            pagination
        })
    }

    onSubmitAppConfig = (app_inst, app_info, configuration)=>{
        app_info, configuration;
        let gateway_sn = this.state.gateway_sn
        const { edit_app_inst } = this.state;
        if (edit_app_inst !== app_inst) {
            message.error('应用实例不存在！');
            return false;
        }
        const data = {
            gateway: gateway_sn,
            inst: edit_app_inst,
            conf: configuration,
            id: `/gateways/${gateway_sn}/config/${edit_app_inst}/${new Date() * 1}`
        };
        http.post('/api/gateways_applications_conf', data).then(res=>{
            if (res.ok) {
            message.success('应用配置请求发送成功')
            this.props.store.action.pushAction(res.data, '更改应用' + edit_app_inst + '配置',  '网关:' + gateway_sn, data, 10000,  ()=> {
                this.setState({show_app_config: true})
            })
            } else {
            message.error('应用配置请求发送失败' + res.error)
            }
        }).catch(err => {
            message.error('应用配置请求发送失败' + err)
        })
    };
    showAppConfig = (app_inst, app_conf, app_info) => {
        this.setState({
            edit_app_info: app_info,
            edit_app_inst: app_inst,
            edit_app_conf: app_conf,
            show_app_config: true
        })
    }
    forceRefreshAppList = () => {
        http.post('/api/gateways_applications_refresh', {gateway: this.state.gateway_sn}).then(res => {
            if (res.ok) {
                message.success('请求刷新列表成功')
            } else {
                message.error('请求刷新列表失败:' + res.error)
            }
        }).catch( err => {
            message.error('请求刷新列表失败:' + err)
        })
    }
    render () {
        const { loading, gateway_sn, data, pagination } = this.state
        const { show_app_config, edit_app_inst, edit_app_conf, edit_app_info, configStore } = this.state;
        return (
            <div>
                <div className={show_app_config ? 'hide' : 'show'}>
                    {/*console.log(data)*/}
                    <div className="toolbar">
                        <span> </span>
                        <div>
                            <Tooltip
                                placement="topLeft"
                                title="请求网关上送其最新的应用列表数据"
                            >
                                <Button
                                    type="primary"
                                    disabled={!this.state.forceRefreshEnable}
                                    onClick={()=>{
                                        this.setState({forceRefreshEnable: false})
                                        this.forceRefreshAppList()
                                        setTimeout(()=>{
                                            this.setState({forceRefreshEnable: true})
                                        }, 5000)
                                    }}
                                >
                                    <Icon type="sync"/>请求网关应用列表
                                </Button>
                            </Tooltip>
                            <Tooltip
                                placement="topLeft"
                                title="手动刷新列表"
                            >
                                <Icon
                                    style={{fontSize: 20, margin: '0 0 0 15px'}}
                                    type="redo"
                                    onClick={()=>{
                                        this.setState({
                                            loading: true,
                                            sign: true
                                        });
                                        this.fetch()
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>
                <Table
                    rowKey="sn"
                    columns={this.state.columns}
                    dataSource={data && data.length > 0 ? data : []}
                    pagination={pagination}
                    loading={loading}
                    onChange={this.handleTableChange}
                    expandRowByClick
                    expandedRowRender={(record) => {
                        return (
                        <Action
                            record={record}
                            getconfig={this.getConfig}
                            update_app_list={this.fetch.bind(this)}
                            show_app_config={this.showAppConfig}
                        />
                        )
                    }}
                />

                </div>
                <div
                    className={show_app_config ? 'show' : 'hide'}
                    style={{position: 'relative'}}
                >
                <Button
                    style={{position: 'absolute', right: 10, top: 5, zIndex: 999}}
                    onClick={()=>{
                        this.setState({show_app_config: false})
                    }}
                >
                    X
                </Button>
                <AppConfig
                    gateway_sn={gateway_sn}
                    configStore={configStore}
                    app_info={edit_app_info}
                    app_inst={edit_app_inst}
                    inst_editable={false}
                    pre_configuration={edit_app_conf}
                    disabled={!this.props.store.gatewayInfo.actionEnable}
                    onSubmit={this.onSubmitAppConfig}
                />
                </div>
            </div>
        );
    }
}

export default AppsList;