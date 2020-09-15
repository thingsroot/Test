import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Table, message, Tooltip, Button, Icon } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Collapses from './Collapses';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';
import './style.scss';

import {IconIOT} from '../../../utils/iconfont';

const columns = [{
        title: intl.get('common.name'),
        dataIndex: 'meta.inst',
        key: 'meta.inst',
        className: 'cursor'
    }, {
        title: intl.get('common.desc'),
        dataIndex: 'meta.description',
        key: 'meta.description',
        className: 'cursor'
    }, {
        title: 'I/O/C',
        dataIndex: 'meta.ioc',
        key: 'meta.ioc',
        className: 'cursor'
    }, {
        title: intl.get('gateway.equipment_serial_number'),
        key: 'meta.sn',
        dataIndex: 'meta.sn',
        width: '30%',
        className: 'cursor'
    }, {
        title: intl.get('gateway.examples'),
        key: 'meta.app_inst',
        dataIndex: 'meta.app_inst',
        className: 'cursor'
    }
];

@withRouter
@inject('store')
@observer
class DevicesList extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }

    state = {
        data: [],
        loading: true,
        uploadOneShort: false,
        dataSanpshotEnable: true,
        dataFlushEnable: true,
        sign: false,
        gateway: this.props.gateway
    }
    componentDidMount (){
        const { gatewayInfo } = this.props.store;
        this.setState({gateway: this.props.gateway}, ()=>{
            this.setData(gatewayInfo.devices)
            gatewayInfo.setDevicesIsShow(true)
            if (gatewayInfo.devices_count !== 0) {
                this.setState({loading: false})
            }
            this.getData()
            this.timer = setInterval(()=>{
                this.getData();
            }, 3000)

            if (!gatewayInfo.data.data_upload) {
                //message.info('网关未开启数据上送，如需查看数据请手工开启临时数据上传!')
            }
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.state.gateway){
            this.setState({
                gateway: nextProps.gateway,
                loading: true
            }, ()=>{
                this.getData();
                const { gatewayInfo } = this.props.store;
                if (!gatewayInfo.data.data_upload && this.state.uploadOneShort) {
                    message.info(intl.get('gateway.gateway_is_not_open_for_data_delivery'))
                    this.enableDataUploadOneShort(60)
                }
            });
        }
    }
    componentWillUnmount (){
        const { gatewayInfo } = this.props.store;
        clearInterval(this.timer)
        clearInterval(this.one_short_timer)
        gatewayInfo.setDevicesIsShow(false)
    }
    getData (){
        http.get('/api/gateways_dev_list?gateway=' + this.state.gateway).then(res=>{
            if (res.ok) {
                this.props.store.gatewayInfo.setDevices(res.data);
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
    setData (devices) {
        let data = [];
        if (devices && devices.length > 0){
            devices.map((item=>{
                item.meta.ioc = '' + (item.inputs ? item.inputs.length : '0') + '/' + (item.outputs ? Object.keys(item.outputs).length : '0') + '/' + (item.commands ? item.commands.length : '0');
                if (item.meta.outputs > 0){
                    item.meta.set_data = true
                }
                item.meta.gateway = this.state.gateway;
                data.push(item);
            }))
        }
        this.setState({
            data: data
        })
    }
    enableDataUploadOneShort (duration) {
        const { gatewayInfo } = this.props.store;
        const { gateway } = this.state;
        if (!gatewayInfo.data.data_upload) {
            let params = {
                name: this.state.gateway,
                duration: duration,
                id: `enable_data_one_short/${gateway}/${new Date() * 1}`
            }
            http.post('/api/gateways_enable_data_one_short', params).then(res => {
                if (!res.ok) {
                    message.error(`${intl.get('gateway.temporary_data_delivery_instruction_failed')}: ` + res.error)
                }
            }).catch( err => {
                message.error(`${intl.get('gateway.temporary_data_delivery_instruction_failed')}: ` + err)
            })
        }
    }
    dataSnapshot () {
        http.post('/api/gateways_data_snapshot', {name: this.state.gateway}).then(res => {
            if (res.ok) {
                message.success(intl.get('gateway.request_gateway_data_snapshot_succeeded'))
            } else {
                message.error(`${intl.get('gateway.failed_to_request_gateway_data_snapshot')}: ` + res.error)
            }
        }).catch( err => {
            message.error(`${intl.get('gateway.failed_to_request_gateway_data_snapshot')}: ` + err)
        })
    }
    dataFlush () {
        http.post('/api/gateways_data_flush', {name: this.state.gateway}).then(res => {
            if (res.ok) {
                message.success(intl.get('gateway.request_gateway_to_send_data_in_the_cycle_successfully'))
            } else {
                message.error(`${intl.get('gateway.failed_to_request_gateway_to_send_data_within_the_period')}: ` + res.error)
            }
        }).catch( err => {
            message.error(`${intl.get('gateway.failed_to_request_gateway_to_send_data_within_the_period')}: ` + err)
        })
    }
    render () {
        let { data, loading } = this.state;
        const { gatewayInfo } = this.props.store;
        return (
            <div>
                <div className="toolbar">
                    <p style={{color: '#ccc'}}>
                        {intl.get('devece_list.Data_feed_cycle') + ': ' + gatewayInfo.data.data_upload_period + intl.get('common.ms')}
                        <span style={{padding: '0 5px'}}></span>
                        {intl.get('devece_list.Full_data_feed_cycle') + ': ' + gatewayInfo.data.data_upload_cov_ttl + '' + intl.get('common.seconds')}
                    </p>
                    <p>
                        {
                            gatewayInfo.data.data_upload
                            ? null
                            : <Button
                                type={this.state.uploadOneShort ? 'default' : 'primary'}
                                onClick={
                                    ()=>{
                                        this.setState({uploadOneShort: !this.state.uploadOneShort}, ()=>{
                                            if (!this.state.uploadOneShort){
                                                clearInterval(this.one_short_timer);
                                                this.enableDataUploadOneShort(0)
                                            } else {
                                                this.enableDataUploadOneShort(60)
                                                this.one_short_timer = setInterval(()=>{
                                                    this.enableDataUploadOneShort(60)
                                                }, 55000)
                                            }
                                        })
                                    }
                                }
                              >
                                    <Icon
                                        type={this.state.uploadOneShort ? 'close-circle' : 'play-circle'}
                                        theme="filled"
                                    />{this.state.uploadOneShort ? intl.get('gateway.stop_temporary_data_upload') : intl.get('gateway.enable_temporary_data_upload')}
                                </Button>
                        }
                        <Tooltip
                            placement="bottom"
                            title={intl.get('gateway.force_the_gateway_to_send_the_latest_data')}
                        >
                            <Button
                                disabled={!this.state.dataFlushEnable}
                                onClick={()=>{
                                    this.setState({dataFlushEnable: false})
                                    this.dataFlush()
                                    setTimeout(()=>{
                                        this.setState({dataFlushEnable: true})
                                    }, 1000)
                                }}
                            >
                                <IconIOT type="icon-APIshuchu"/>{intl.get('devece_list.Forced_to_refresh')}
                            </Button>
                        </Tooltip>
                    </p>
                </div>
                <Table
                    columns={columns}
                    dataSource={
                        data && data.length > 0 ? data : []
                    }
                    loading={loading}
                    rowKey={(record, index) => {
                        index;
                        return record.meta.sn
                    }}
                    rowClassName={(record, index) => {
                        let className = 'light-row';
                        if (index % 2 === 0) {
                            className = 'dark-row';
                        }
                        return className;
                    }}
                    expandedRowRender={Collapses}
                    expandRowByClick
                    pagination={false}
                />

            </div>
        );
    }
}

export default DevicesList;