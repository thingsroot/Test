import React, { Component } from 'react';
import { Table, Button, Icon, message, Tooltip } from 'antd';
import http from '../../../utils/Server';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Action from './Action';
import app from '../../../assets/images/app.png'
import AppConfig from '../../AppsInstall/AppConfig';
import {ConfigStore} from '../../../utils/ConfigUI';
import {formatTime} from '../../../utils/time';
import './style.scss';

import {IconIOT, IconCloud} from '../../../utils/iconfont';
import intl from 'react-intl-universal';


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
            close_after_submit: false,
            apply_app_config: false,
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
                                src={`/store_assets${record}`}
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
                title: intl.get('appsinstall.instance_name'),
                dataIndex: 'inst_name',
                sorter: (a, b) => a.inst_name.length - b.inst_name.length,
                width: '20%',
                className: 'cursor'
            }, {
                title: intl.get('appdetails.version'),
                dataIndex: 'version',
                key: 'version',
                className: 'cursor',
                render: (props, record)=>{
                    if (record.data){
                        if (record.latestVersion > props) {
                            return (
                                <span style={{color: 'blue'}}>
                                    {props} <Icon type="arrow-up"/>
                                    {
                                        record.beta === 1
                                        ? <IconCloud style={{fontSize: 22, color: 'orange'}}
                                            type="icon-beta1"
                                          /> : null
                                    }
                                </span>
                            )
                        } else if (record.islocal === 1) {
                            return (
                                <span style={{color: 'orange'}}>
                                  {props} <Icon type="edit"/>
                                </span>
                            )
                        } else if (record.beta === 1) {
                            return (
                                <span style={{color: 'orange'}}>
                                    {props}
                                    <IconCloud style={{fontSize: 22}}
                                        type="icon-beta1"
                                    />
                                </span>
                            )
                        } else {
                            return <span>{props}</span>
                        }
                    } else {
                        return (
                            <span style={{color: 'orange'}}>{intl.get('gateway.local')}</span>
                        )
                    }
                }
            }, {
                title: intl.get('slider.number_of_equipment'),
                dataIndex: 'devs_len',
                key: 'devs_len',
                className: 'cursor'
            }, {
                title: intl.get('common.state'),
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
                title: intl.get('gateway.startup_time'),
                dataIndex: 'running',
                className: 'cursor',
                render: (props, record)=>{
                    const start = record.start || record.running;
                    const start_tm = start ? formatTime(new Date(parseInt(start) * 1000), 'yyyy-MM-dd hh:mm:ss') : null
                    return (
                        <span>{start_tm}</span>
                    )
                }
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
                show_app_config: false,
                apply_app_config: false,
                close_after_submit: false,
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
        app_inst, app_info, configuration;
        let gateway_sn = this.state.gateway_sn
        const { edit_app_inst } = this.state;
        if (edit_app_inst !== app_inst) {
            message.error(intl.get('gateway.application_instance_does_not_exist'));
            return false;
        }
        const data = {
            gateway: gateway_sn,
            inst: edit_app_inst,
            conf: configuration,
            id: `/config/${gateway_sn}/${edit_app_inst}/${new Date() * 1}`
        };
        this.setState({apply_app_config: true})
        http.post('/api/gateways_applications_conf', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('gateway.app_configuration_request_sent_successfully'))
                this.props.store.action.pushAction(res.data, intl.get('gateway.change_application') + edit_app_inst + intl.get('gateway.configure'),  `${intl.get('appsinstall.gateway')}:` + gateway_sn, data, 10000,  (result)=> {
                    if (result && edit_app_inst === app_inst && this.state.close_after_submit) {
                        this.setState({show_app_config: false, apply_app_config: false})
                    } else {
                        this.setState({apply_app_config: false})
                    }
                })
            } else {
                message.error(intl.get('gateway.failed_to_send_application_configuration_request') + res.error)
                this.setState({apply_app_config: false})
            }
        }).catch(err => {
            message.error(intl.get('gateway.failed_to_send_application_configuration_request') + err)
            this.setState({apply_app_config: false})
        })
    };
    showAppConfig = (app_inst, app_conf, app_info) => {
        this.setState({
            edit_app_info: app_info,
            edit_app_inst: app_inst,
            edit_app_conf: app_conf,
            show_app_config: true,
            close_after_submit: false
        })
    }
    forceRefreshAppList = () => {
        http.post('/api/gateways_applications_refresh', {gateway: this.state.gateway_sn}).then(res => {
            if (res.ok) {
                message.success(intl.get('gateway.request_to_refresh_list_succeeded'))
            } else {
                message.error(`${intl.get('gateway.request_to_refresh_list_failed')}:` + res.error)
            }
        }).catch( err => {
            message.error(`${intl.get('gateway.request_to_refresh_list_failed')}:` + err)
        })
    }
    render () {
        const { loading, gateway_sn, data } = this.state
        const { show_app_config, edit_app_inst, edit_app_conf, edit_app_info, configStore } = this.state;
        return (
            <div>
                <div className={show_app_config ? 'hide' : 'show'}>
                    <div className="toolbar">
                        <span> </span>
                        <div>
                            <Tooltip
                                placement="bottom"
                                title={intl.get('gateway.force_the_gateway_to_send_the_latest_application_data')}
                            >
                                <Button
                                    disabled={!this.state.forceRefreshEnable}
                                    onClick={()=>{
                                        this.setState({forceRefreshEnable: false})
                                        this.forceRefreshAppList()
                                        setTimeout(()=>{
                                            this.setState({forceRefreshEnable: true})
                                        }, 5000)
                                    }}
                                >
                                    <IconIOT type="icon-APIshuchu"/>{intl.get('devece_list.Forced_to_refresh')}
                                </Button>
                            </Tooltip>
                            {/* <Tooltip
                                placement="topLeft"
                                title="手动刷新列表"
                            >
                                <Icon
                                    style={{fontSize: 18, margin: '0 0 0 15px'}}
                                    type="reload"
                                    onClick={()=>{
                                        this.setState({
                                            loading: true,
                                            sign: true
                                        });
                                        this.fetch()
                                    }}
                                />
                            </Tooltip> */}
                        </div>
                    </div>
                <Table
                    rowKey="sn"
                    columns={this.state.columns}
                    dataSource={data && data.length > 0 ? data : []}
                    pagination={false}
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
                        this.setState({close_after_submit: false, show_app_config: false})
                    }}
                >
                    X
                </Button>
                {
                    show_app_config
                    ? <AppConfig
                        gateway_sn={gateway_sn}
                        configStore={configStore}
                        app_info={edit_app_info}
                        app_inst={edit_app_inst}
                        inst_editable={false}
                        update_config
                        pre_configuration={edit_app_conf}
                        disabled={!this.props.store.gatewayInfo.actionEnable || this.state.apply_app_config}
                        onSubmit={this.onSubmitAppConfig}
                        onCancel={()=>{
                            this.setState({close_after_submit: false, show_app_config: false})
                        }}
                        closeOnSubmit={()=>{
                            this.setState({close_after_submit: true})
                        }}
                      />
                    : ''
                    }
                </div>
            </div>
        );
    }
}

export default AppsList;