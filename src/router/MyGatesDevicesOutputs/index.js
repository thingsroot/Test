import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../utils/Server';
import { Table, Button, Modal, Input, message } from 'antd';
import './style.scss';
@withRouter
@inject('store') @observer
class MyGatesDevicesOutputs extends PureComponent {
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
            render: ()=>{
                return (
                    <span>--</span>
                )
            }
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
        const data = this.props.outputs;
        data.map((item)=>{
            if (!item.vt){
                item.vt = 'float'
            }
        })
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
          const id = `send_output/${sn}/${vsn}/${this.state.record.name}/${this.state.value}/${new Date() * 1}`
        http.postToken('/api/gateways_dev_outputs', {
            gateway: sn,
            name: vsn,
            output: record.name,
            prop: 'value',
            value: value,
            id: id
        }).then(res=>{
            if (res.data === id){
                this.timer = setInterval(() => {
                    http.get('/api/gateways_exec_result?id=' + id).then(result=>{
                      if (result.ok && result.data){
                        if (result.data.result){
                          message.success('应用配置成功')
                          clearInterval(this.timer)
                        } else {
                          message.error('应用配置失败')
                          clearInterval(this.timer)
                        }
                      }
                    })
                  }, 3000);
            } else {
                message.error('提交错误')
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
        const { data } = this.state;
        return (
            <div>
                {/* <GatesStatus /> */}
                <Table
                    bordered
                    columns={this.state.columns}
                    dataSource={data ? data : []}
                />
                <Modal
                    title="数据下置"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">点名：
                        <Input
                            disabled
                            value={this.state.record.name}
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

export default MyGatesDevicesOutputs;