import React, {Fragment} from 'react';
import {Table, Input, Popconfirm, Form, Button, Modal, message} from 'antd';
import {inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        const {dataIndex} = this.props;
        if (dataIndex === 'phone') {
            return <Input type="number"/>;
        }
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
class EditableTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data: [],
            user_list: [],
            record: {},
            loading: true,
            editingKey: '',
            visibleMember: false,
            confirmDirty: false,
            type: 'text'
        };
        this.columns = [
            {
                title: '姓名',
                dataIndex: 'full_name',
                width: '12%',
                editable: true
            }, {
                title: '用户名',
                dataIndex: 'name',
                width: '25%',
                editable: true
            }, {
                title: '手机号',
                dataIndex: 'mobile_no',
                width: '28%',
                editable: true
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    const { editingKey } = this.state;
                    const editable = this.isEditing(record);
                    return editable ? (
                        <span>
              <EditableContext.Consumer>
                {form => (
                    <Button
                        type="primary"
                        onClick={() => this.save(form, record.idx, record)}
                        style={{ marginRight: 8 }}
                    >
                        保存
                    </Button>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                  title="Sure to cancel?"
                  onClick={() => this.cancel(record.key)}
              >
                <Button>取消</Button>
              </Popconfirm>
            </span>
                    ) : (
                        <Fragment>
                            <Button
                                type="primary"
                                disabled={editingKey !== ''}
                                onClick={() => {
                                    this.EditUser(record)
                                }}
                                style={{marginRight: '20px'}}
                            >
                                编辑
                            </Button>
                            <Popconfirm
                                title="确定要删除此成员吗?"
                                onConfirm={() => this.delete(record)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button
                                    type="danger"
                                    disabled={editingKey !== ''}
                                >删除</Button>
                            </Popconfirm>
                        </Fragment>
                    );
                }
            }
        ];
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        if (nextProps.empty && this.state.loading) {
            this.setState({
                loading: false
            })
        }
        if (nextProps.user_list !== this.props.user_list) {
            this.setState({
                loading: true
            })
            if (nextProps.user_list.length > 0) {
                this.mapGetUserinfo(nextProps.user_list, 0)
            } else {
                this.mapGetUserinfo([])
            }
        }
    }
    EditUser = (record) =>{
        this.setState({
            visibleMember: true,
            status: 'updateUser',
            record: record
        }, ()=>{
            this.props.form.setFieldsValue({
                name: undefined
            })
        })
    }
    mapGetUserinfo = (arr, index) => {
        let list = []
        if (index !== 0) {
            list = this.state.user_list
        }
        if (arr.length > 0) {
            if (index !== undefined && index < arr.length) {
                http.get('/api/companies_users_read?name=' + arr[index].user).then(res=>{
                    if (res.ok) {
                        list.push(res.data)
                        this.setState({
                            user_list: list
                        }, ()=>{
                            this.mapGetUserinfo(arr, index + 1)
                        })
                    }
                })
            } else {
                this.setState({
                    data: this.state.user_list,
                    loading: false
                })
            }
        } else {
            this.setState({
                data: [],
                loading: false
            })
        }
    }
    isEditing = record => record.name === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };
    delete = (record) => {
        http.post('/api/companies_groups_remove_user', {
            name: this.props.activeKey,
            user: record.name
        }).then(res=>{
            if (res.ok) {
                this.props.getdata()
                message.success('删除用户成功！')
            }
        })
    };

    save (form, key, record) {
        form.validateFields((error, row) => {
            // if (error) {
            //     return;
            // }
            const data = {
                name: record.name,
                company: record.company,
                group_name: row.group_name,
                role: 'Admin',
                description: ''
            }
            console.log(data, record)
        });
    }

    edit (key) {
        this.setState({ editingKey: key });
    }
    handleOkMember = e => {
        e;
        this.setState({
            visibleMember: true
        });
    };
    handleCancelMember = e => {
        e;
        this.setState({
            visibleMember: false,
            status: '',
            type: 'text'
        }, ()=>{
            this.props.form.setFieldsValue({
                name: undefined
            })
        });
    };
    addMember=()=> {
        this.setState({
            visibleMember: true
        });
    };
    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    };
    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次输入不一致!');
            this.errPassword = false
        } else {
            this.errPassword = true
            callback();
        }
    };
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.setFieldsValue({
            name: ''
        })
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
            if (this.state.status === 'updateUser') {
                const datas = {
                    name: values.user,
                    first_name: values.firstname,
                    last_name: values.lastname,
                    mobile_no: values.phone,
                    new_password: values.password
                }
                http.post('/api/companies_users_update', datas).then(res=>{
                    this.setState({
                        visibleMember: false,
                        status: '',
                        type: 'text'
                    })
                    if (res.ok) {
                        message.success('修改用户信息成功！')
                        this.props.getdata()
                    } else {
                        message.error(res.error)
                    }
                })
            } else {
                if (values.firstname !== undefined &&
                    values.lastname !== undefined &&
                    values.phone !== undefined &&
                    values.user !==  undefined &&
                    values.password !== undefined &&
                    values.confirm !== undefined &&
                    this.errPassword ) {
                    if (!this.props.activeKey) {
                        return false;
                    }
                    const data = {
                        user: values.user,
                        email: values.user,
                        mobile_no: values.phone,
                        first_name: values.firstname,
                        last_name: values.lastname,
                        new_password: values.password,
                        company: this.props.company
                    }
                    http.post('/api/companies_users_create', data).then(res=>{
                        if (res.ok) {
                            http.post('/api/companies_groups_add_user', {name: this.props.activeKey, user: res.data}).then(result=>{
                                if (result.ok) {
                                    message.success('创建用户成功！')
                                    this.props.getdata()
                                }
                            })
                        } else {
                            message.error(res.error)
                        }
                    })
                    this.setState({
                        visibleMember: false,
                        status: '',
                        type: 'text'
                    })
                }
            }

        });
    };

    render () {
        const components = {
            body: {
                cell: EditableCell
            }
        };

        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record)
                })
            };
        });
        const { getFieldDecorator } = this.props.form;

        return (
            <div>
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        components={components}
                        bordered
                        loading={this.state.loading}
                        dataSource={this.state.data}
                        columns={columns}
                        rowClassName="editable-row"
                        rowKey="email"
                        // pagination={false}
                        size="small"
                    />
                    <Button
                        onClick={()=>{
                            this.setState({visibleMember: true})
                        }}
                        type="primary"
                        // style={{
                        //     marginTop: '20px'
                        // }}
                        disabled={this.props.activeKey === ''}
                    >
                        添加企业成员
                    </Button>
                </EditableContext.Provider>
                <Modal
                    title={(this.state.status === 'updateUser' ? '修改' : '添加') + '企业成员'}
                    visible={this.state.visibleMember}
                    onOk={this.handleOkMember}
                    onCancel={this.handleCancelMember}
                    footer={null}
                    maskClosable={false}
                    destroyOnClose
                >
                    <Form onSubmit={this.handleSubmit} >
                        <Form.Item label="用户">
                            {getFieldDecorator('user', {
                                initialValue: this.state.status === 'updateUser' ? this.state.record.name : '',
                                rules: [
                                    {
                                        required: this.state.status === 'updateUser' ? false : true,
                                        message: '请输入用户'
                                    }
                                ]
                            })(<Input disabled={this.state.status === 'updateUser'} />)}
                        </Form.Item>
                        <Form.Item label="姓">
                            {getFieldDecorator('firstname', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入姓'
                                    }
                                ]
                            })(<Input type="text"/>)}
                        </Form.Item>
                        <Form.Item label="名">
                            {getFieldDecorator('lastname', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入名'
                                    }
                                ]
                            })(<Input type="text"/>)}
                        </Form.Item>
                        <Form.Item label="手机号码">
                            {getFieldDecorator('phone', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入手机号码'
                                    }
                                ]
                            })(<Input type="number"/>)}
                        </Form.Item>
                        <Form.Item
                            label="新密码"
                            hasFeedback
                        >
                            {getFieldDecorator('password', {
                                rules: [
                                    {
                                        required: this.state.status === 'updateUser' ? false : true,
                                        message: '请输入密码!'
                                    },
                                    {
                                        validator: this.validateToNextPassword
                                    }
                                ]
                            })(
                            <Input
                                type={this.state.type}
                                onClick={()=>{
                                    this.setState({
                                        type: 'password'
                                    })
                                }}
                            />
                                )}
                        </Form.Item>
                        <Form.Item
                            label="确认新密码"
                            hasFeedback
                        >
                            {getFieldDecorator('confirm', {
                                rules: [
                                    {
                                        required: this.state.status === 'updateUser' ? false : true,
                                        message: '请确认输入的密码'
                                    },
                                    {
                                        validator: this.compareToFirstPassword
                                    }
                                ]
                            })(
                            <Input
                                onBlur={this.handleConfirmBlur}
                                type={this.state.type}
                                onClick={()=>{
                                    this.setState({
                                        type: 'password'
                                    })
                                }}
                            />
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{marginRight: '20px'}}
                            >
                                确认
                            </Button>
                            <Button onClick={this.handleCancelMember}>取消</Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

        );
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable