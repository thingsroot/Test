import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Table, message } from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import Collapses from './Collapses';
import PropTypes from 'prop-types';

const columns = [{
        title: '名称',
        dataIndex: 'meta.inst',
        key: 'meta.inst'
        // sorter: true
    }, {
        title: '描述',
        dataIndex: 'meta.description',
        key: 'meta.description'
        // sorter: true
    }, {
        title: 'I/O/C',
        dataIndex: 'meta.ioc',
        key: 'meta.ioc'
        // sorter: true
    }, {
        title: '设备SN',
        key: 'meta.sn',
        dataIndex: 'meta.sn',
        width: '30%'
        // sorter: true
    }, {
        title: '所属实例',
        key: 'meta.app_inst',
        dataIndex: 'meta.app_inst'
        // sorter: true
        }
    //   , {
    //   title: 'Action',
    //   key: 'action',
    //   render: (record) => {
    //     return (<span>
    //       <Link
    //           disabled={record.set_data ? false : true}
    //           to={`/MyGatesDevicesOutputs/${record.Gate_Sn}/${record.sn}`}
    //           key="1"
    //       >数据下置</Link>
    //     </span>)
    //   }
    // }
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
        loading: false,
        gateway: this.props.gateway
    }
    componentDidMount (){
        this.setState({gateway: this.props.gateway}, ()=>{
            this.timer = setInterval(()=>{
                this.getData();
            }, 3000)
            this.setData(this.props.store.gatewayInfo.devices)
            if (this.props.store.gatewayInfo.devices_count === 0) {
                this.setState({loading: true})
            }
            this.getData()
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (nextProps.gateway !== this.props.gateway){
            this.setState({
                gateway: nextProps.gateway,
                loading: true
            }, ()=>{
                this.getData();
            });
        }
    }
    componentWillUnmount (){
        clearInterval(this.timer)
    }
    getData (){
        http.get('/api/gateways_dev_list?gateway=' + this.state.gateway).then(res=>{
            if (res.ok) {
                this.props.store.gatewayInfo.setDevices(res.data);
                this.setData(res.data)
            } else {
                message.error(res.error)
            }
            this.setState({loading: false})
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
                item.meta.Gate_Sn = this.state.gateway;
                data.push(item);
            }))
        }
        this.setState({
            data: data
        })
    }
    render () {
        let { data, loading } = this.state;
        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={
                        data && data.length > 0 ? data : []
                    }
                    loading={loading}
                    rowKey="meta.sn"
                    rowClassName={(record, index) => {
                        let className = 'light-row';
                        if (index % 2 === 0) {
                            className = 'dark-row';
                        }
                        return className;
                    }}
                    expandedRowRender={Collapses}
                    expandRowByClick
                />
            </div>
        );
    }
}

export default DevicesList;