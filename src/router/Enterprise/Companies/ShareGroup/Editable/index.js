import React, {Component} from 'react';
import {Button, Divider, Input, Modal, Popconfirm, Table, Form, message} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../../../../utils/Server';
import { _getCookie } from '../../../../../utils/Session';

const EditableContext = React.createContext();

const EditableRow = ({ form, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

// const EditableContext = React.createContext();

class EditableCell extends React.Component {
  getInput = () => {
    // if (this.props.inputype === 'number') {
    //   return <Input />;
    // }
    return <Input />;
  };

  renderCell = ({ getFieldDecorator }) => {
    const {
      editing,
      dataIndex,
      title,
    //   inputType,
      record,
    //   index,
      children,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{ margin: 0 }}>
            {getFieldDecorator(dataIndex, {
              rules: [
                {
                  required: true,
                  message: `请输入${title}!`
                }
              ],
              initialValue: record[dataIndex]
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render () {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

@withRouter
@inject('store')
@observer
class Editable extends Component {
    constructor (props) {
        super(props)
        this.state = {
            gatewayList: [],
            filterGatewayList: [],
            editingKey: '',
            loading: true,
            columnsGateway: [
                {
                    title: '网关序列号',
                    dataIndex: 'sn'
                }, {
                    title: '网关名称',
                    dataIndex: 'dev_name'
                }, {
                    title: '描述',
                    dataIndex: 'description'
                }, {
                    title: '状态',
                    dataIndex: 'device_status',
                    width: '10%',
                    render: (record)=>{
                        if (record === 'ONLINE'){
                            return <span className="online"><b></b>&nbsp;&nbsp;在线</span>
                        } else if (record === 'OFFLINE') {
                            return <span className="offline"><b></b>&nbsp;&nbsp;离线</span>
                        } else {
                            return <span className="notline"><b></b>&nbsp;&nbsp;全部}</span>
                        }
                    }
                }, {
                    title: '操作',
                    render: (record)=>{
                        return (
                            <Button
                                type="primary"
                                onClick={()=>{
                                    this.addGateway(record)
                                }}
                                disabled={this.props.store.groups.GroupsGatewaylist.filter(item=>item.device === record.sn).length > 0}
                            >
                                添加
                            </Button>
                        )
                    }
                }
            ],
            columnsUser: [
                // {
                //     title: '序号',
                //     dataIndex: 'idx',
                //     width: '100px'
                // },
                {
                    title: '用户ID',
                    dataIndex: 'user',
                    editable: true
                },
                {
                    title: '备注',
                    dataIndex: 'comment',
                    width: '30%',
                    editable: true
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record, index) => {
                        const { editingKey } = this.state;
                        const editable = this.isEditing(record);
                        return editable ? (
                            <span>
                            <EditableContext.Consumer>
                                {form => (
                                <Button
                                    onClick={() => this.save(record, form)}
                                    style={{ marginRight: 8 }}
                                    type="primary"
                                >
                                    保存
                                </Button>
                                )}
                            </EditableContext.Consumer>
                            <Popconfirm
                                title="确定要放弃修改吗?"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => this.cancel(record)}
                            >
                                <Button>取消</Button>
                            </Popconfirm>
                            </span>
                        ) : (
                            <div>
                                <Button
                                    disabled={editingKey !== ''}
                                    onClick={() => this.edit(record.idx)}
                                    style={{marginRight: '15px'}}
                                >
                                    编辑
                                </Button>
                            <Popconfirm
                                title="确定要删除此用户吗?"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => {
                                    this.props.store.groups.handleDeleteUser(record.user, index, this.props.activeKey).then(()=>{
                                        this.props.getdata()
                                    })
                                }}
                            >
                                <Button type="danger" >删除</Button>
                            </Popconfirm>
                            </div>
                        );
                    }
                }
            ],
            count: 0,
            columnsDevice: [
                // {
                //     title: '序号',
                //     dataIndex: 'idx',
                //     width: '100px'
                // },
                {
                    title: '网关序列号',
                    dataIndex: 'device',
                    editable: true
                },
                {
                    title: '名称',
                    dataIndex: 'dev_name',
                    width: '30%',
                    editable: true
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record) =>
                        this.props.store.groups.GroupsGatewaylist.length >= 1 ? (
                            <Popconfirm
                                title="确定要删除此网关吗?"
                                okText="确定"
                                cancelText="取消"
                                onConfirm={() => this.props.store.groups.handleDeleteDevice(record.idx, this.props.activeKey)}
                            >
                                <Button type="danger" >删除</Button>
                            </Popconfirm>
                        ) : null
                }
            ],
            showTemplateSelectionDevice: false
        }
    }
    isEditing = record => record.idx === this.state.editingKey;
    save (record, form) {
        form.validateFields((error, row) => {
            if (error){
                return false;
            }
            const newData = this.props.store.groups.GroupsUserlist;
            const index = newData.findIndex(item => record.idx === item.idx);
            const item = newData[index];
            newData.splice(index, 1, {
            ...item,
            ...row
            });
            this.props.store.groups.GroupsUserlist = [...newData]
            this.setState({
                editingKey: ''
            })
            if (!record.creation){
                const data = {
                    name: this.props.activeKey,
                    user: row.user,
                    comment: row.comment
                }
                http.post('/api/companies_sharedgroups_add_user', data).then(res=>{
                    if (res.ok) {
                        message.success('添加成员成功！')
                        this.props.getdata()
                    } else {
                        message.error('添加成员失败！错误信息：' + res.error)
                        this.props.store.groups.handleDeleteUser(record.user, index, this.props.activeKey, true)
                    }
                })
            } else {
                const data = {
                    name: this.props.activeKey,
                    company: this.props.company,
                    users: this.props.store.groups.GroupsUserlist,
                    group_name: this.props.group_name,
                    role: 'Admin',
                    description: ''
                }
                http.post('/api/companies_sharedgroups_update', data).then(res=>{
                    if (res.ok) {
                        message.success('更改成员信息成功！')
                        this.props.getdata()
                    } else {
                        message.error('更改成员信息失败！错误信息：' + res.error)
                    }
                })
            }
        });
      }
    handlesave = (row) =>{
        const newData = this.props.store.groups.GroupsUserlist;
        const index = newData.findIndex(item => row.idx === item.idx);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row
        });
        this.props.store.groups.GroupsUserlist = [...newData]
    }
    edit (key) {
        this.setState({ editingKey: key });
    }
    cancel = (record) => {
        this.setState({ editingKey: '' });
        if (!record.creation) {
            this.props.store.groups.GroupsUserlist = this.props.store.groups.GroupsUserlist.filter(item=> item.creation)
        }
    };
    addGateway = (record) => {
        const data = {
            name: this.props.activeKey,
            device: record.sn
        }
        http.post('/api/companies_sharedgroups_add_device', data).then(res=>{
            if (res.ok) {
                const num = this.props.store.groups.GroupsGatewaylist.length + 1;
                const obj = {
                    device: record.sn,
                    creation: record.creation,
                    idx: num,
                    modified: record.modified,
                    description: '',
                    dev_name: record.dev_name
                }
                this.props.store.groups.pushGroupsGatewaylist(obj)
                message.success('添加设备成功')
            } else {
                message.error('添加设备失败！错误信息：' + res.error)
            }
        })
    }
    filterGateway = (val)=> {
        const list = this.state.filterGatewayList.filter(item=>{
            return item.sn.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1 || item.dev_name.toLocaleLowerCase().indexOf(val.toLocaleLowerCase()) !== -1
        })
        this.setState({
            gatewayList: list
        })
    }
    addUser = ()=> {
        const obj = {
            idx: this.props.store.groups.GroupsUserlist.length + 1,
            user: '',
            comment: ''
        }
        this.props.store.groups.pushGroupsUserlist(obj)
        this.setState({
            editingKey: this.props.store.groups.GroupsUserlist.length
        })
    };
    templateShowDevice = ()=> {
        this.setState({
            showTemplateSelectionDevice: true,
            loading: true
        }, ()=>{
            http.get('/api/gateways_list').then(res=>{
                if (res.ok) {
                    const data = res.data;
                    const gatewayList = [];
                    if (data.length > 0) {
                        data.map(item=>{
                            if (item.owner_type === 'Cloud Company Group' && item.company === _getCookie('companies')) {
                                gatewayList.push(item)
                            }
                        })
                    }
                    gatewayList.sort((a, b)=>{
                        return a.device_status - b. device_status
                    })
                    this.setState({
                        gatewayList,
                        filterGatewayList: gatewayList,
                        loading: false
                    })
                }
            })
        })
    };
    handleCancelAddTempListDevice = ()=>{
        this.setState({
            showTemplateSelectionDevice: false
        })
    };
    render () {
        const {columnsUser, columnsDevice} = this.state;
        const components = {
            body: {
              cell: EditableCell,
              row: EditableFormRow
            }
          };
          const columns = columnsUser.map(col => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                dataIndex: col.dataIndex,
                title: col.title,
                editing: this.isEditing(record),
                handlesave: this.handleSave
              })
            };
          });
        return (
            <div>
                <div>
                    <Divider orientation="left">共享组用户</Divider>
                    <Table
                        columns={columns}
                        dataSource={this.props.store.groups.GroupsUserlist}
                        size="small"
                        components={components}
                        rowClassName={() => 'editable-row'}
                        rowKey="idx"
                        pagination={false}
                    />
                    <Button
                        onClick={this.addUser}
                        style={{margin: '10px 0'}}
                        disabled={this.props.activeKey === ''}
                    >
                        添加成员
                    </Button>
                </div>
                <div>
                    <Divider orientation="left">共享组网关</Divider>
                    <Table
                        columns={columnsDevice}
                        components={components}
                        loading={this.props.store.groups.loading}
                        dataSource={this.props.store.groups.GroupsGatewaylist}
                        size="small"
                        pagination={false}
                        rowKey="device"
                    />
                    <Button
                        onClick={this.templateShowDevice}
                        style={{margin: '10px 0'}}
                        disabled={this.props.activeKey === ''}
                    >
                        添加网关
                    </Button>
                    <Modal
                        className="templateList"
                        title={<h3>查找网关</h3>}
                        maskClosable={false}
                        footer={
                            <Button
                                type="primary"
                                onClick={this.handleCancelAddTempListDevice}
                            >关闭</Button>
                        }
                        onCancel={()=>{
                            this.setState({
                                showTemplateSelectionDevice: false
                            })
                        }}
                        visible={this.state.showTemplateSelectionDevice}
                        wrapClassName={'templatesModal'}
                        okText="确定"
                        cancelText="取消"
                        width="60vw"
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
                                placeholder="请输入序列号、网关名称"
                                onChange={(e)=>{
                                    this.filterGateway(e.target.value.toLocaleLowerCase())
                                }}
                                style={{ width: 200 }}
                            />
                            <span style={{padding: '0 2px'}}> </span>
                        </div>
                        <div>
                            <Table
                                columns={this.state.columnsGateway}
                                dataSource={this.state.gatewayList}
                                pagination={false}
                                scroll={{y: 400}}
                                loading={this.state.loading}
                            />
                        </div>
                    </Modal>
                </div>
            </div>
        );
    }
}

export default Editable;