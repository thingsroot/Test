import React, { PureComponent } from 'react';
import './index.scss'
import { Row, Col, Icon, List, Modal, Input, message, Popconfirm, Divider, Table, Button } from 'antd'
class ShareGroup extends PureComponent {
    constructor (props) {
        super(props)
        this.state = {
            visible: false,
            showTemplateSelection: false,
            showTemplateSelectionDevice: false,
            groupValue: '',
            data: [],
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
                    render: (text, record) =>
                        this.state.dataSourceUser.length >= 1 ? (
                            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
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
                            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
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
            ]
        }
    }
    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = e => {
        e;
        if (this.state.groupValue === '') {
            message.info('请输入共享组名')
        } else {
            let list = {
                value: this.state.groupValue,
                disabled: true
            }
            this.setState({
                data: [...this.state.data, list],
                visible: false,
                groupValue: ''
            });
            console.log(this.state.data)
        }

    };

    handleCancel = e => {
        e;
        this.setState({
            visible: false
        });
    };

    addGroup=()=> {
        this.showModal()
    };
    editList=(e, item, index)=> {
        e.stopPropagation()
        console.log(item, index)
        // item.disabled = false
        // let obj = {
        //     value: item.value,
        //     disabled: false
        // }
        // this.setState({data: [obj]})
    };
    deleteList=( e, index)=> {
        e.stopPropagation()
        let data = [...this.state.data]
        data.splice(index, 1)
        this.setState({
            data
        })
    };
    row=(e, index)=>  {
        e.stopPropagation()
       console.log(index, '行')
    };
    templateShow = ()=> {
        this.setState({
            showTemplateSelection: true
        })
    };
    handleCancelAddTempList = ()=>{
        this.setState({
            showTemplateSelection: false
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
        const {columnsUser, dataSourceUser, columnsDevice, dataSourceDevice, visible} = this.state
        return (
            <div className="share-group">
                <Row>
                    <Col span={6}>
                        <List
                            header={
                                <div>xxx公司
                                    <span
                                        className="add"
                                        onClick={this.addGroup}>
                                <Icon type="usergroup-add" />
                            </span>
                                </div>}
                            bordered
                            dataSource={this.state.data}
                            renderItem={(item, index) => (
                                <List.Item
                                    key={index}
                                    list={item}
                                    actions={[<a key="list-edit" onClick={e=>this.editList(e, item, index)}>编辑</a>,
                                        <Popconfirm
                                            key="list-delete"
                                            title="确定要删除吗?"
                                            okText="确定"
                                            cancelText="取消"
                                            onConfirm={e=>this.deleteList(e, index)}
                                        >
                                            <a >删除</a></Popconfirm>
                                    ]}
                                >
                                   <input
                                       style={{width: '100%', display: 'inline-block'}}
                                       key={index}
                                       onClick={e=> this.row(e, index)}
                                       defaultValue={item.value}
                                       disabled={item.disabled}
                                   />


                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col span={1}/>
                    <Col span={17}>
                        <div>
                            <Divider orientation="left">共享组用户</Divider>
                            <Table
                                columns={columnsUser}
                                dataSource={dataSourceUser}
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
                    </Col>
                </Row>
                <Modal
                    title="新增共享组"
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    visible={visible}
                >
                   <div> 共享组名：
                       <Input
                           style={{'width': '80%'}}
                           value={this.state.groupValue}
                           onChange={e=>this.setState({groupValue: e.target.value})}/></div>
                </Modal>
            </div>
        )
    }
}
export default ShareGroup