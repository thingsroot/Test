import React, {Fragment} from 'react';
import {Table, Input, Popconfirm, Form, Icon, Modal, message, Empty} from 'antd';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';
import './index.scss'
const data = [];
const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        return <Input />;
    };


    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        index, inputType;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`
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
class Edituser extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data,
            editingKey: '',
            visible: false,
            groupValue: '',
            companies_list: []
        };
        this.columns = [
            {
                title: '',
                dataIndex: 'group_name',
                editable: true,
                width: '65%'
            },
            {
                title: '',
                dataIndex: 'operation',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable
                        ? (
              <span>
              <EditableContext.Consumer>
                {form => (
                    <a
                        type="primary"
                        onClick={() => this.save(form, record)}
                        style={{ marginRight: 8 }}
                    >
                        保存
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                  onClick={() => this.cancel(record.key)}
              >
                <a>取消</a>
              </Popconfirm>
            </span>
                    ) : (
                        <Fragment>
                            <a
                                disabled={editingKey !== ''}
                                onClick={() => {
                                    this.edit(record)
                                }}
                                style={{marginRight: '20px'}}
                            >
                                编辑
                            </a>
                            <Popconfirm
                                title="确定要删除此共享组吗?"
                                onConfirm={() => this.delete(record)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <a
                                    type="danger"
                                    disabled={editingKey !== ''}
                                >删除</a>
                            </Popconfirm>
                        </Fragment>
                    );
                }
            }
        ];
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        console.log(nextProps)
    }
    isEditing = record => {
        return record.name === this.state.editingKey
    };

    cancel = () => {
        this.setState({ editingKey: '' });
    };
    delete= (record) => {
        http.post('/api/companies_sharedgroups_remove', {name: record.name}).then(res=>{
            if (res.ok) {
                this.props.getdata()
                message.success('删除共享组成功！')
            } else {
                message.error('删除共享组失败！错误信息：' + res.error)
            }
        })
    };

    save (form, record) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const data = {
                name: record.name,
                company: record.company,
                group_name: row.group_name,
                role: 'Admin'
            }
            http.post('/api/companies_sharedgroups_update', data).then(res=>{
                if (res.ok) {
                    this.props.getdata()
                    message.success('更新共享组信息成功！')
                } else {
                    message.error('更新共享组信息失败！错误信息：' + res.error)
                }
            })
                this.setState({ editingKey: '' });
        });
    }
    edit (record) {
        this.setState({ editingKey: record.name });
    }
    addGroup=()=> {
        this.showModal()
    };
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
                name: this.state.groupValue,
                key: this.state.data.length + 1
            }
            const  data = {
                company: this.props.company,
                group_name: this.state.groupValue,
                enabled: 1,
                role: 'Admin'
            }
            http.post('/api/companies_sharedgroups_create', data).then(res=>{
                if (res.ok) {
                    message.success('创建共享组成功！')
                    this.props.getdata()
                    this.setState({
                        data: [...this.state.data, list],
                        visible: false,
                        groupValue: ''
                    });
                } else {
                    message.error('创建共享组失败！错误信息：' + res.error)
                    this.props.getdata()
                    this.setState({
                        visible: false,
                        groupValue: ''
                    });
                }
            })
        }
    };

    handleCancel = e => {
        e;
        this.setState({
            visible: false
        });
    };
    companyTitle=(title)=> {
        return (
            <div className="company-name">
                <span>{title}</span>
                <span
                    className="add-user"
                    onClick={this.addGroup}
                >
                    <Icon type="usergroup-add" />
                </span>
            </div>
        )
    }
    setRowClassName = (record) => {
        return record.name === this.props.activeKey ? 'clickRowStyl editable-row' : 'editable-row';
    }
    render () {
        const components = {
            body: {
                cell: EditableCell
            }
        };
        const { companies_list } = this.props;
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    // inputType: col.dataIndex === 'age' ? 'number' : 'text',
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record)
                })
            };
        });

        return (
            <div>
                <EditableContext.Provider value={this.props.form}>
                    {
                        companies_list && companies_list.length > 0
                        ? companies_list.map((item, key) => {
                            return (
                                <div key={key}>
                                    <Table
                                        rowKey="name"
                                        components={components}
                                        dataSource={this.props.group_list}
                                        columns={columns}
                                        rowClassName={this.setRowClassName}
                                        pagination={false}
                                        showHeader={false}
                                        title={()=>{
                                            return this.companyTitle(item.full_name)
                                        }}
                                        onRow={(record)=>{
                                            return {
                                                onClick: ()=>{
                                                    this.props.setActiveKey(record)
                                                    this.props.store.groups.setGroupsUserlist(record)
                                                }
                                            }
                                        }}
                                        size="small"
                                    />
                                </div>
                            )
                        })
                        : <Empty />
                    }
                </EditableContext.Provider>
                <Modal
                    title="新增共享组"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText="确定"
                    cancelText="取消"
                    maskClosable={false}
                >
                    <div> 共享组名：
                        <Input
                            style={{'width': '80%'}}
                            value={this.state.groupValue}
                            onChange={e=>this.setState({groupValue: e.target.value})}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}

const Editusers = Form.create()(Edituser);

export default Editusers