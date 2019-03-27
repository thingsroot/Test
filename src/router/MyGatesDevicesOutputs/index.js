import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../utils/Server';
import { Table, Button, Modal, Input, message } from 'antd';
//import GatesStatus from '../../common/GatesStatus';
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
                    <Button onClick={()=>{
                        this.showModal(record)
                    }}
                    >下置</Button>
                )
            }
          }]
    }
    componentDidMount (){
        console.log(this.props)
        if (location.pathname.indexOf('undefined') !== -1){
            this.props.history.push('/')
        }
        http.get('/api/method/iot_ui.iot_api.gate_info?sn=' + this.props.match.params.sn).then(res=>{
            this.props.store.appStore.setStatus(res.message)
          })
        http.get(`/api/method/iot_ui.iot_api.gate_device_cfg?sn=${this.props.match.params.sn}&vsn=${this.props.vsn}&_=${new Date() * 1}`).then(res=>{
            console.log(res);
            let data = res.message.outputs;
            data.map((item)=>{
                if (!item.vt){
                    item.vt = 'float'
                }
            })
            this.setState({data})
        })
    }
    showModal = (record) => {
        this.setState({record})
        this.setState({
          visible: true
        });
      }
      inputChange = () => {
        const value = event.target.value
        this.setState({value})
      }
      handleOk = () => {
          console.log(this.props.match.params)
          const { sn, vsn} = this.props.match.params;
          const { record, value } = this.state;
          const id = `send_output/${sn}/ ${vsn}/ ${this.state.record.name}/${this.state.value}/${new Date * 1}`
          console.log(this.state.value)
        http.postToken('/api/method/iot.device_api.send_output', {
            data: {
                device: sn,
                output: record.name,
                props: 'value',
                value: value
            },
            device: sn,
            id: id
        }).then(res=>{
            if (res.message === id){
                setTimeout(() => {
                    http.get(`/api/method/iot.device_api.get_action_result?id=${encodeURIComponent(res.message)}`).then(res=>{
                        console.log(res)
                        if (res.message.result === true){
                            message.success('发送成功')
                        }
                    })
                }, 1000);
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
                    dataSource={data.length > 0 ? data : []}
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
                            defaultValue={this.state.record.name}
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