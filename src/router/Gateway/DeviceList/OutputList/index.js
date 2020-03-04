import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { inject, observer} from 'mobx-react';
import http from '../../../../utils/Server';
import { Table, Button, Modal, Input, message, Tooltip } from 'antd';
import './style.scss';
import intl from 'react-intl-universal';

function formatTime (date, fmt) {
    const o = {
        'M+': date.getMonth() + 1,     //月份
        'd+': date.getDate(),     //日
        'h+': date.getHours(),     //小时
        'm+': date.getMinutes(),     //分
        's+': date.getSeconds(),     //秒
        'q+': Math.floor((date.getMonth() + 3) / 3), //季度
        'S': date.getMilliseconds()    //毫秒
    }
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
}

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
            title: intl.get('common.type'),
            dataIndex: 'vt',
            width: '100px'
        }, {
            title: intl.get('common.name'),
            render: (record)=>{
                return (
                    <Tooltip placement="topLeft"
                        title={record.name}
                    >
                        {record.name}
                    </Tooltip>
                )
            }
        }, {
            title: intl.get('common.desc'),
            render: (record)=>{
                return (
                    <Tooltip placement="topLeft"
                        title={record.desc}
                    >
                        {record.desc}
                    </Tooltip>
                )
            }
        }, {
            title: intl.get('gateway.lower_feedback'),
            render: (record)=>{
                return (
                    <Tooltip placement="topLeft"
                        title={record.result}
                    >
                        {record.result}
                    </Tooltip>
                )
            }
        }, {
            title: intl.get('gateway.feedback_time'),
            width: '130px',
            dataIndex: 'result_tm'
        }, {
            title: intl.get('gateway.trigger_time'),
            width: '130px',
            dataIndex: 'action_tm'
        }, {
            title: intl.get('common.operation'),
            width: '100px',
            render: (record)=>{
                return (
                    <Button
                        disabled={!this.props.store.gatewayInfo.actionEnable}
                        onClick={()=>{
                        this.showModal(record)
                    }}
                    >{intl.get('gateway.underneath')}</Button>
                )
            }
        }]
    }
    componentDidMount (){
        this.setState({data: this.props.outputs})

        const { regFilterChangeCB, filterText } = this.props;
        if (filterText) {
            this.applyFilter()
        }
        if (regFilterChangeCB) {
            regFilterChangeCB(()=>{
                this.applyFilter()
            })
        }
    }

    applyFilter = ()=>{
        const { filterText, outputs } = this.props;
        let newData = [];
        outputs && outputs.length > 0 && outputs.map((item)=>{
            if (item.name.toLowerCase().indexOf(filterText.toLowerCase()) !== -1 ||
                (item.desc && item.desc.toLowerCase().indexOf(filterText.toLowerCase()) !== -1) ) {
                newData.push(item)
            }
        });
        this.setState({data: newData})
    }

    showModal = (record) => {
        this.setState({
            record: record,
            visible: true
        });
    }
    inputChange = (e)=>{
        let value = e.target.value;
        this.setState({value})
    }
    handleOk = () => {
        const { sn, vsn } = this.props;
        const { record, value } = this.state;
        const id = `send_output/${vsn}/${record.name}/${new Date() * 1}`
        let params = {
            gateway: sn,
            name: vsn,
            output: record.name,
            prop: 'value',
            value: value,
            id: id
        }
        let output_record = record;
        http.post('/api/gateways_dev_outputs', params).then(res=>{
            if (res.ok){
                output_record.action_tm = formatTime(new Date(), 'hh:mm:ss S')
                this.props.store.action.pushAction(res.data, intl.get('gateway.equipment_data_download_execution'), '', params, 10000, (result, data)=>{
                    if (result) {
                        output_record.result = intl.get('gateway.successful_placement')
                        output_record.result_tm = formatTime(new Date(data.timestamp * 1000), 'hh:mm:ss S')
                    } else {
                        output_record.result = data.message
                        output_record.result_tm = formatTime(new Date(data.timestamp * 1000), 'hh:mm:ss S')
                    }
                })
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
                    title={intl.get('devece_list.The_data_set')}
                    visible={visible}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p className="flex">{intl.get('gateway.roll_call')}：
                        <Input
                            disabled
                            value={record.name}
                        />
                    </p>
                    <br/>
                    <p className="flex">{intl.get('common.number')}：
                        <Input
                            onChange={this.inputChange}
                        />
                    </p>
                </Modal>
            </div>
        );
    }
}

export default OutputList;