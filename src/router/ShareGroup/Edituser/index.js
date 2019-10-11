import React, {Fragment} from 'react';
import {Table, Input, Popconfirm, Form, Icon, Modal, message} from 'antd';
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

class Edituser extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data,
            editingKey: '',
            visible: false,
            groupValue: ''
        };
        this.columns = [
            {
                title: '',
                dataIndex: 'name',
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
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                    >
                        保存
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
                <a>取消</a>
              </Popconfirm>
            </span>
                    ) : (
                        <Fragment>
                            <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)} style={{marginRight: '20px'}}>
                                编辑
                            </a>
                            <Popconfirm title="Sure to delete?" onConfirm={() => this.delete(record.key)}>
                                <a type="danger" disabled={editingKey !== ''} >删除</a>
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
    delete= (record) => {
        console.log(record)
        let list = [...this.state.data]
        list.splice(record - 1, 1)
        this.setState({data: list})
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
    addGroup=()=> {
        console.log(1)
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
    companyTitle=()=> {
        return (
            <div className="company-name">
                <span>xxx公司</span>
                <span className="add-user" onClick={this.addGroup}>
                    <Icon type="usergroup-add" />
                </span>
            </div>
        )
    }
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

        return (
            <div>
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        components={components}
                        dataSource={this.state.data}
                        columns={columns}
                        rowClassName="editable-row"
                        pagination={false}
                        showHeader={false}
                        title={this.companyTitle}
                        size="small"
                    />
                </EditableContext.Provider>
                <Modal
                    title="新增共享组"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <div> 共享组名：
                        <Input
                            style={{'width': '80%'}}
                            value={this.state.groupValue}
                            onChange={e=>this.setState({groupValue: e.target.value})}/>
                    </div>
                </Modal>
            </div>
        );
    }
}

const Editusers = Form.create()(Edituser);

export default Editusers