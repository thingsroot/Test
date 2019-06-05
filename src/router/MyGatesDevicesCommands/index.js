import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../utils/Server';
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
class MyGatesDevicesCommands extends Component {
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
        const data = this.props.commands;
        this.setState({data})
    }
    showModal = (record) => {
      this.setState({
          record,
          visible: true
      });
    }
    inputChange = () => {
      const value = event.target.value
      this.setState({value})
    }
    handleOk = () => {
        console.log(this.props.match.params)
        const { sn } = this.props.match.params;
        const { vsn } = this.props;
        const { record, value } = this.state;
        const id = `send_command/${sn}/${vsn}/${this.state.record.name}/${new Date() * 1}`
      http.postToken('/api/gateways_dev_commands', {
        gateway: sn,
        name: vsn,
        command: record.name,
        param: value, //JSON.parse(value),
        id: id
      }).then(res=>{
        if (res.ok && res.data === id){
          openNotification('提交设备指令成功', '网关:' + sn + '\n设备:' + vsn + '\n参数:' + value);
          this.timer = setInterval(() => {
              http.get('/api/gateways_exec_result?id=' + id).then(result=>{
                if (result.ok && result.data){
                  if (result.data.result){
                    openNotification('设备执行指令成功', '网关:' + sn + '\n设备:' + vsn + '\n参数:' + value);
                    message.success('设备执行指令成功')
                    clearInterval(this.timer)
                  } else {
                    openNotification('设备执行指令失败', '网关:' + sn + '\n设备:' + vsn + '\n参数:' + value);
                    message.error('设备执行指令失败')
                    clearInterval(this.timer)
                  }
                }
              })
            }, 3000);
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
        const { data } = this.state;
        return (
            <div>
                <Table
                    bordered
                    rowKey="name"
                    columns={this.state.columns}
                    dataSource={data ? data : []}
                />
                <Modal
                    title="设备指令"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">指令名：
                        <Input
                            disabled
                            value={this.state.record.name}
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

export default MyGatesDevicesCommands;