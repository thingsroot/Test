import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../../../utils/Server';
import { Table, Button, Modal, Input, message } from 'antd';
import './style.scss';

@withRouter
@inject('store')
@observer
class OutputList extends Component {
    state = {
        data: [],
        visible: false,
        record: {},
        value: '',
        columns: [{
            title: '类型',
            dataIndex: 'vt',
            width: '100px'
        }, {
            title: '名称',
            dataIndex: 'name'
        }, {
            title: '描述',
            dataIndex: 'desc'
        }, {
            title: '单位',
            dataIndex: 'unit'
        }, {
            title: '数值',
            dataIndex: 'pv'
        }, {
            title: '时间',
            dataIndex: 'tm'
        }, {
            title: '操作',
            width: '150px',
            render: (record)=>{
                return (
                    <Button
                        disabled={this.props.store.appStore.actionSwi}
                        onClick={()=>{
                        this.showModal(record)
                    }}
                    >下置</Button>
                )
            }
        }]
    }
    componentDidMount (){
        this.setState({data: this.props.outputs})
    }
    showModal = (record) => {
        this.setState({
            record: record,
            visible: true
        });
    }
    inputChange = () => {
        const value = event.target.value
        this.setState({value})
    }
    handleOk = () => {
        const { sn, vsn } = this.props;
        const { record, value } = this.state;
        const id = `send_output/${sn}/${vsn}/${record.name}/${value}/${new Date() * 1}`
        let params = {
            gateway: sn,
            name: vsn,
            output: record.name,
            prop: 'value',
            value: value,
            id: id
        }
        http.post('/api/gateways_dev_outputs', params).then(res=>{
            if (res.ok){
                this.props.store.action.pushAction(res.data, '设备指令执行', '', params, 10000)
            } else {
                message.error(res.error)
            }
        })
        this.setState({
            visible: false
        });
    }
    handleCancel = () => {
        this.setState({
        visible: false
        });
    }
    render () {
        const { data, record, columns, visible } = this.state;
        return (
            <div>
                <Table
                    bordered
                    rowKey="name"
                    rowClassName={(record, index) => {
                        let className = 'light-row';
                        if (index % 2 === 0) {
                            className = 'dark-row';
                        }
                        return className;
                    }}
                    columns={columns}
                    dataSource={data ? data : []}
                />
                <Modal
                    title="数据下置"
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">点名：
                        <Input
                            disabled
                            value={record.name}
                        />
                    </p>
                    <p className="flex">数值：
                        <Input
                            onChange={(value)=>{
                                this.inputChange(value)
                            }}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

export default OutputList;