import React, {Fragment} from 'react';
import {Table, Input, Popconfirm, Form, Button, Icon, Modal} from 'antd';

const data = [];
for (let i = 0; i < 2; i++) {
    data.push({
        key: i.toString(),
        name: `Edrward ${i}`,
        phone: '13213212312'
    });
}
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

class EditableTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data,
            editingKey: '',
            visibleMember: false,
            confirmDirty: false
        };
        this.columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                width: '25%',
                editable: true
            },
            {
                title: '手机号',
                dataIndex: 'phone',
                width: '40%',
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
                        type="primary"
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                    >
                        保存
                    </Button>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                  title="Sure to cancel?"
                  onConfirm={() => this.cancel(record.key)}
              >
                <Button>取消</Button>
              </Popconfirm>
            </span>
                    ) : (
                        <Fragment>
                            <Button
                                type="primary"
                                disabled={editingKey !== ''}
                                onClick={() => this.edit(record.key)}
                                style={{marginRight: '20px'}}
                            >
                                编辑
                            </Button>
                            <Popconfirm
                                title="Sure to delete?"
                                onConfirm={() => this.delete(record.key, index)}
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

    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };
    delete= (key, index) => {
        key;
        let list = [...this.state.data]
        list.splice(index, 1)
        this.setState({
            data: list
        })
    };

    save (form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row
                });
                this.setState({ data: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' });
            }
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
            visibleMember: false
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
        this.props.form.validateFieldsAndScroll((err, values) => {
            console.log(values)
            console.log(values.name, values.password)
            if (!err) {
                console.log('Received values of form: ', values);
            }
            if (values.name !== undefined &&
                values.phone !== undefined &&
                values.user !==  undefined &&
                values.password !== undefined &&
                values.confirm !== undefined &&
                this.errPassword ) {
                let arr = {
                    name: values.name,
                    phone: values.phone,
                    key: this.state.data.length + 1
                };
                this.setState({
                    visibleMember: false,
                    data: [...this.state.data, arr]})
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
                    // inputType: col.dataIndex === 'age' ? 'number' : 'text',
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
                <p style={{
                    float: 'right',
                    position: 'absolute',
                    right: 0,
                    top: '-40px'}}
                >
                    <Icon
                        type="user-add"
                        style={{fontSize: '30px'}}
                        onClick={this.addMember}
                    />
                </p>
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        components={components}
                        bordered
                        dataSource={this.state.data}
                        columns={columns}
                        rowClassName="editable-row"
                        pagination={false}
                        size="small"
                    />
                </EditableContext.Provider>
                <Modal
                    title="添加企业成员"
                    visible={this.state.visibleMember}
                    onOk={this.handleOkMember}
                    onCancel={this.handleCancelMember}
                    footer={null}
                >
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Item label="用户">
                            {getFieldDecorator('user', {
                                rules: [
                                    // {
                                    //     type: 'user',
                                    //     message: 'The input is not valid E-mail!'
                                    // },
                                    {
                                        required: true,
                                        message: '请输入用户'
                                    }
                                ]
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="姓名">
                            {getFieldDecorator('name', {
                                rules: [
                                    // {
                                    //     type: 'name',
                                    //     message: 'The input is not valid E-mail!'
                                    // },
                                    {
                                        required: true,
                                        message: '请输入姓名'
                                    }
                                ]
                            })(<Input />)}
                        </Form.Item>
                        <Form.Item label="手机号码">
                            {getFieldDecorator('phone', {
                                rules: [
                                    // {
                                    //     type: 'name',
                                    //     message: 'The input is not valid E-mail!'
                                    // },
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
                                        required: true,
                                        message: '请输入密码!'
                                    },
                                    {
                                        validator: this.validateToNextPassword
                                    }
                                ]
                            })(<Input.Password />)}
                        </Form.Item>
                        <Form.Item
                            label="确认新密码"
                            hasFeedback
                        >
                            {getFieldDecorator('confirm', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请确认输入的密码'
                                    },
                                    {
                                        validator: this.compareToFirstPassword
                                    }
                                ]
                            })(<Input.Password onBlur={this.handleConfirmBlur} />)}
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