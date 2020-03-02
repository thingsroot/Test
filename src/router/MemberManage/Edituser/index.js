import React, {Fragment} from 'react';
import {Table, Input,
    Popconfirm,
    Form,
    // Icon,
    Modal,
    message,
    Empty
} from 'antd';
import {inject, observer} from 'mobx-react';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import './index.scss'
import intl from 'react-intl-universal';

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
            groupValue: ''
        };
        this.columns = [
            {
                title: '',
                dataIndex: 'group_name',
                editable: true,
                width: '65%',
                render: (record)=>{
                    if (record === 'root') {
                        return <span>{intl.get('login.all_members_of_the_company')}</span>
                    } else {
                        return <span>{record}</span>
                    }
                }
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
                        {intl.get('appsinstall.save')}
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm
                  onClick={() => this.cancel(record.key)}
              >
                <a>{intl.get('common.cancel')}</a>
              </Popconfirm>
            </span>
                    ) : (
                        record.group_name !== 'root'
                        ? <Fragment>
                        <a
                            disabled={editingKey !== ''}
                            onClick={() => this.edit(record.name)}
                            style={{marginRight: '20px'}}
                        >
                            {intl.get('appdetails.edit')}
                        </a>
                        <Popconfirm
                            title={`${intl.get('login.are_you_sure_you_want_to_delete_this_member_group')}?`}
                            okText={intl.get('common.sure')}
                            cancelText={intl.get('common.cancel')}
                            onConfirm={() => this.delete(record)}
                        >
                            <a
                                type="danger"
                                disabled={editingKey !== ''}
                            >{intl.get('appdetails.delete')}</a>
                        </Popconfirm>
                    </Fragment>
                    : ''
                    );
                }
            }
        ];
    }

    isEditing = record => record.name === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };
    delete = (record) => {
        http.post('/api/companies_groups_remove', {name: record.name}).then(res=>{
            if (res.ok) {
                this.props.getdata()
                message.success(intl.get('login.delete_company_group_succeeded'))
            } else {
                message.error(`${intl.get('login.delete_company_group_failed')}: ` + res.error)
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
                role: 'Admin',
                description: ''
            }
            http.post('/api/companies_groups_update', data).then(res=>{
                if (res.ok) {
                    this.props.getdata()
                    message.success(intl.get('login.update_group_information_succeeded'))
                } else {
                    message.error(`${intl.get('login.failed_to_update_group_information')}: ` + res.error)
                }
            })
                this.setState({ editingKey: '' });
        });
    }

    edit (key) {
        this.setState({ editingKey: key });
    }
    addGroup=()=> {
        this.showModal()
    };
    showModal = () => {
        this.setState({
            visible: true
        });
    };
    handleOk = () => {
        if (this.state.groupValue === '') {
            message.info(intl.get('login.please_enter_share_group_name'))
        } else {
            const data = {
                company: this.props.companies_list[0].name,
                group_name: this.state.groupValue
            }
            http.post('/api/companies_groups_create', data).then(res=>{
                if (res.ok) {
                    this.props.getdata()
                    message.success(intl.get('login.create_company_group_successfully'))
                    this.setState({
                        visible: false,
                        groupValue: ''
                    })
                } else {
                    message.error(`${intl.get('login.failed_to_create_company_group')}: ` + res.error)
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
                {/* <span
                    className="add-user"
                    onClick={this.addGroup}
                >
                    <Icon type="usergroup-add" />
                </span> */}
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
        const {companies_list} = this.props;
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
                                        dataSource={item.groups_list}
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
                                                    this.props.store.groups.setUserlist(record)
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
                    title={intl.get('login.new_company_group')}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    maskClosable={false}
                >
                    <div> {intl.get('login.member_group_name')}：
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