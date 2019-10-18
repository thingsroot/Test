import React, {Component} from 'react';
import {Button, Divider, Input, Modal, Popconfirm, Table} from 'antd';

class Editable extends Component {
    constructor (props) {
        super(props)
        this.state = {
            columnsUser: [
                {
                    title: 'ID',
                    dataIndex: 'id'
                },
                {
                    title: '名称',
                    dataIndex: 'name'
                },
                {
                    title: '备注',
                    dataIndex: 'remark',
                    width: '30%',
                    editable: true
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record, index) =>
                        this.state.dataSourceUser.length >= 1 ? (
                            <Popconfirm
                                title="Sure to delete?"
                                onConfirm={() => this.handleDeleteUser(record.key, index)}
                            >
                                <Button type="danger" >删除</Button>
                            </Popconfirm>
                        ) : null
                }
            ],
            dataSourceUser: [
                {
                    key: '0',
                    name: 'Edward King 0',
                    id: '32',
                    remark: 'London, Park Lane no. 0'
                }
            ],
            count: 0,
            columnsDevice: [
                {
                    title: 'ID',
                    dataIndex: 'id'
                },
                {
                    title: '名称',
                    dataIndex: 'name'
                },
                {
                    title: '备注',
                    dataIndex: 'remark',
                    width: '30%',
                    editable: true
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record) =>
                        this.state.dataSourceDevice.length >= 1 ? (
                            <Popconfirm
                                title="Sure to delete?"
                                onConfirm={() => this.handleDeleteDevice(record.key)}
                            >
                                <Button type="danger" >删除</Button>
                            </Popconfirm>
                        ) : null
                }
            ],
            dataSourceDevice: [
                {
                    key: '0',
                    name: 'Edward King 0',
                    id: '32',
                    remark: 'London, Park Lane no. 0'
                }
            ],
            showTemplateSelection: false,
            showTemplateSelectionDevice: false
        }
    }
    handleDeleteUser (key, index) {
        key;
        let list = [...this.state.dataSourceUser]
        list.splice(index, 1)
        this.setState({dataSourceUser: list})
    }
    handleDeleteDevice (key, index) {
        key;
        let list = [...this.state.dataSourceDevice]
        list.splice(index, 1)
        this.setState({dataSourceDevice: list})
    }
    handleCancelAddTempList = ()=>{
        this.setState({
            showTemplateSelection: false
        })
    };
    templateShow = ()=> {
        this.setState({
            showTemplateSelection: true
        })
    };
    templateShowDevice = ()=> {
        this.setState({
            showTemplateSelectionDevice: true
        })
    };
    handleCancelAddTempListDevice = ()=>{
        this.setState({
            showTemplateSelectionDevice: false
        })
    };
    render () {
        const {columnsUser, dataSourceUser, columnsDevice, dataSourceDevice} = this.state
        return (
            <div>
                <div>
                    <Divider orientation="left">共享组用户</Divider>
                    <Table
                        columns={columnsUser}
                        dataSource={dataSourceUser}
                        size="small"
                        pagination={false}
                    />
                    <Button
                        onClick={this.templateShow}
                        style={{margin: '10px 0'}}
                    >
                        添加成员
                    </Button>
                    <Modal
                        className="templateList"
                        title={<h3>查找成员</h3>}
                        maskClosable={false}
                        visible={this.state.showTemplateSelection}
                        onOk={this.handleCancelAddTempList}
                        onCancel={this.handleCancelAddTempList}
                        wrapClassName={'templatesModal'}
                        okText="确定"
                        cancelText="取消"
                    >
                        <div
                            style={{
                                display: 'flex',
                                position: 'absolute',
                                left: '110px',
                                top: 10,
                                zIndex: 999,
                                lineHeight: '30px'
                            }}
                        >
                            <span style={{padding: '0 20px'}}> </span>
                            <Input.Search
                                placeholder="ID，名称"
                                onSearch={(e)=>{
                                    console.log(e)
                                    // this.search(e.target.value.toLocaleLowerCase())
                                }}
                                style={{ width: 200 }}
                                enterButton
                            />
                            <span style={{padding: '0 2px'}}> </span>
                        </div>
                    </Modal>
                </div>
                <div>
                    <Divider orientation="left">共享组网关</Divider>
                    <Table
                        columns={columnsDevice}
                        dataSource={dataSourceDevice}
                        size="small"
                        pagination={false}
                    />
                    <Button
                        onClick={this.templateShowDevice}
                        style={{margin: '10px 0'}}
                    >
                        添加网关
                    </Button>
                    <Modal
                        className="templateList"
                        title={<h3>查找网关</h3>}
                        maskClosable={false}
                        visible={this.state.showTemplateSelectionDevice}
                        onOk={this.handleCancelAddTempListDevice}
                        onCancel={this.handleCancelAddTempListDevice}
                        wrapClassName={'templatesModal'}
                        okText="确定"
                        cancelText="取消"
                    >
                        <div
                            style={{
                                display: 'flex',
                                position: 'absolute',
                                left: '110px',
                                top: 10,
                                zIndex: 999,
                                lineHeight: '30px'
                            }}
                        >
                            <span style={{padding: '0 20px'}}> </span>
                            <Input.Search
                                placeholder="ID，名称"
                                onChange={(e)=>{
                                    this.search(e.target.value.toLocaleLowerCase())
                                }}
                                style={{ width: 200 }}
                            />
                            <span style={{padding: '0 2px'}}> </span>
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Editable;