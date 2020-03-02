import React, {Component} from 'react';
import {Button, Divider, Input, Modal, Popconfirm, Table, Form, message} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import intl from 'react-intl-universal';

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
                  message: `${intl.get('gatewayappinstall.please_input')}${title}!`
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
                    title: intl.get('sharegroup.gateway_serial_number'),
                    dataIndex: 'sn'
                }, {
                    title: intl.get('sharegroup.gateway_name'),
                    dataIndex: 'dev_name'
                }, {
                    title: intl.get('common.name'),
                    dataIndex: 'description'
                }, {
                    title: intl.get('common.operation'),
                    render: (record)=>{
                        return (
                            <Button
                                type="primary"
                                onClick={()=>{
                                    this.addGateway(record)
                                }}
                                disabled={this.props.store.groups.GroupsGatewaylist.filter(item=>item.device === record.dev_name).length > 0}
                            >
                                {intl.get('appsinstall_add')}
                            </Button>
                        )
                    }
                }
            ],
            columnsUser: [
                {
                    title: intl.get('dashboard.the_serial_number'),
                    dataIndex: 'idx'
                },
                {
                    title: intl.get('sharegroup.user_ID'),
                    dataIndex: 'user',
                    editable: true
                },
                {
                    title: intl.get('sharegroup.remarks'),
                    dataIndex: 'comment',
                    width: '30%',
                    editable: true
                },
                {
                    title: intl.get('common.operation'),
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
                                    {intl.get('appsinstall.save')}
                                </Button>
                                )}
                            </EditableContext.Consumer>
                            <Popconfirm
                                title={`${intl.get('sharegroup.are_you_sure_you_want_to_discard_the_changes')}?`}
                                okText={intl.get('common.sure')}
                                cancelText={intl.get('common.cancel')}
                                onConfirm={() => this.cancel(record)}
                            >
                                <Button>{intl.get('common.cancel')}</Button>
                            </Popconfirm>
                            </span>
                        ) : (
                            <div>
                                <Button
                                    disabled={editingKey !== ''}
                                    onClick={() => this.edit(record.idx)}
                                    style={{marginRight: '15px'}}
                                >
                                    {intl.get('appdetails.edit')}
                                </Button>
                            <Popconfirm
                                title={`${intl.get('sharegroup.are_you_sure_you_want_to_delete_this_user')}?`}
                                okText={intl.get('common.sure')}
                                cancelText={intl.get('common.cancel')}
                                onConfirm={() => this.props.store.groups.handleDeleteUser(record.user, index, this.props.activeKey)}
                            >
                                <Button type="danger" >{intl.get('appdetails.delete')}</Button>
                            </Popconfirm>
                            </div>
                        );
                    }
                }
            ],
            count: 0,
            columnsDevice: [
                {
                    title: intl.get('dashboard.the_serial_number'),
                    dataIndex: 'idx'
                },
                {
                    title: intl.get('sharegroup.gateway_serial_number'),
                    dataIndex: 'device',
                    editable: true
                },
                {
                    title: intl.get('sharegroup.remarks'),
                    dataIndex: 'comment',
                    width: '30%',
                    editable: true
                },
                {
                    title: intl.get('common.operation'),
                    dataIndex: 'operation',
                    render: (text, record) =>
                        this.props.store.groups.GroupsGatewaylist.length >= 1 ? (
                            <Popconfirm
                                title={`${intl.get('sharegroup.are_you_sure_you_want_to_delete_this_gateway')}?`}
                                okText={intl.get('common.sure')}
                                cancelText={intl.get('common.cancel')}
                                onConfirm={() => this.props.store.groups.handleDeleteDevice(record.idx, this.props.activeKey)}
                            >
                                <Button type="danger" >{intl.get('appdetails.delete')}</Button>
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
                console.log(error)
                return;
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
                        message.success(intl.get('sharegroup.member_added_successfully'))
                        this.props.getdata()
                    } else {
                        message.error(`${intl.get('sharegroup.failed_to_add_member')}: ` + res.error)
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
                        message.success(intl.get('sharegroup.change_member_information_succeeded'))
                        this.props.getdata()
                    } else {
                        message.error(`${intl.get('sharegroup.failed_to_change_member_information')}: ` + res.error)
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
                    device: record.dev_name,
                    creation: record.creation,
                    idx: num,
                    modified: record.modified,
                    description: ''
                }
                this.props.store.groups.pushGroupsGatewaylist(obj)
                message.success(intl.get('sharegroup.device_added_successfully'))
            } else {
                message.error(`${intl.get('sharegroup.failed_to_add_device')}: ` + res.error)
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
                    this.setState({
                        gatewayList: res.data,
                        filterGatewayList: res.data,
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
                    <Divider orientation="left">{intl.get('sharegroup.shared_group_users')}</Divider>
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
                        {intl.get('sharegroup.add_member')}
                    </Button>
                </div>
                <div>
                    <Divider orientation="left">{intl.get('sharegroup.shared_group_gateway')}</Divider>
                    <Table
                        columns={columnsDevice}
                        components={components}
                        dataSource={this.props.store.groups.GroupsGatewaylist}
                        size="small"
                        pagination={false}
                        rowKey="idx"
                    />
                    <Button
                        onClick={this.templateShowDevice}
                        style={{margin: '10px 0'}}
                        disabled={this.props.activeKey === ''}
                    >
                        {intl.get('gateway.add_the_gateway')}
                    </Button>
                    <Modal
                        className="templateList"
                        title={<h3>{intl.get('sharegroup.search_gateway')}</h3>}
                        maskClosable={false}
                        visible={this.state.showTemplateSelectionDevice}
                        onOk={this.handleCancelAddTempListDevice}
                        onCancel={this.handleCancelAddTempListDevice}
                        wrapClassName={'templatesModal'}
                        okText={intl.get('common.sure')}
                        cancelText={intl.get('common.cancel')}
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
                                placeholder={intl.get('sharegroup.ID_name')}
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