import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../../../utils/Server';
import { Table, Button, Modal, Input, message, notification } from 'antd';
import './style.scss';


const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};
const { TextArea } = Input;

@withRouter
@inject('store')
@observer
class CommandList extends Component {
    state = {
        data: [],
        visible: false,
        record: {},
        value: '',
        columns: [{
            title: '名称',
            dataIndex: 'name'
        }, {
            title: '描述',
            dataIndex: 'desc'
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
                    >发送</Button>
                )
            }
        }]
    }
    componentDidMount (){
        this.setState({data: this.props.commands})
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
        const id = `send_command/${sn}/${vsn}/${record.name}/${new Date() * 1}`
        let params = {
            gateway: sn,
            name: vsn,
            command: record.name,
            param: value, //JSON.parse(value),
            id: id
        }
        http.post('/api/gateways_dev_commands', params).then(res=>{
            if (res.ok && res.data === id){
                openNotification('提交设备指令成功', '网关:' + sn + '\n设备:' + vsn + '\n参数:' + value);
                if (res.ok && res.data === id){
                    openNotification('提交设备指令成功', '网关:' + sn + '\n设备:' + vsn + '\n参数:' + value);
                    this.props.store.action.pushAction(res.data, '设备指令执行', '', params, 10000)
                } else {
                    message.error(res.error)
                }
            } else {
                message.error(res.error)
            }
        }).catch(req=>{
            req;
            message.error('发送请求失败')
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
                    title="设备指令"
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">指令名：
                        <Input
                            readOnly
                            value={record.name}
                        />
                    </p>
                    <p className="flex">参数：
                        <TextArea
                            rows={4}
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

export default CommandList;