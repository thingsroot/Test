import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Button, message, Tabs, Modal, Table, Divider } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import MyTemplateForm from '../myForm';
import CopyForm from '../CopyForm';
import {inject, observer} from 'mobx-react';
const TabPane = Tabs.TabPane;
const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

@withRouter
@inject('store')
@observer
class TemplateList extends Component {
    constructor () {
        super();
        this.state = {
            deleteName: '',
            type: '',
            conf: '',
            key: '1',
            columns: [
                {
                    title: '模板名称',
                    dataIndex: 'conf_name',
                    key: 'conf_name'
                },
                {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description'
                },
                {
                    title: '访问权限',
                    dataIndex: 'public',
                    key: 'public',
                    render: (record) => {
                        return (
                            <span>{record.public === 0 ? '个人' : '公开'}</span>
                        )
                    }
                },
                {
                    title: '版本',
                    dataIndex: 'latest_version',
                    key: 'latest_version'
                },
                {
                    title: '修改时间',
                    key: 'modified',
                    dataIndex: 'modified',
                    render: text => {
                        return (
                            <span>{text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: '26%',
                    render: (record) => (
                        <span>
                            <Link
                                className="mybutton"
                                to={`/myTemplateDetails/${record.app}/${record.name}/${record.latest_version}`}
                            >查看</Link>
                            <Divider type="vertical" />
                            <a
                                className="mybutton"
                                onClick={() => {
                                        this.copyContent(record.name, record.conf_name, record.description, record.latest_version, record.public, record.owner_type, 2)
                                    }}
                            >编辑</a>
                            <Divider type="vertical" />
                            <a
                                className="mybutton"
                                onClick={(record) => {
                                        this.copyContent(record.name, record.conf_name, record.description, record.latest_version, record.public, record.owner_type, 1)
                                    }}
                            >复制</a>
                            <Divider type="vertical" />
                            <a
                                className="mybutton"
                                onClick={(record)=>{
                                    this.getName(record.name)
                                }}
                            >删除</a>
                        </span>
                    )
                }
            ],
            columns2: [
                {
                    title: '模板名称',
                    dataIndex: 'conf_name',
                    key: 'conf_name'
                },
                {
                    title: '描述',
                    dataIndex: 'description',
                    key: 'description'
                },
                {
                    title: '访问权限',
                    dataIndex: 'public',
                    key: 'public',
                    render: (record) => {
                        return (
                            <span>{record.public === 0 ? '个人' : '公开'}</span>
                        )
                    }
                },
                {
                    title: '版本',
                    dataIndex: 'latest_version',
                    key: 'latest_version'
                },
                {
                    title: '修改时间',
                    key: 'modified',
                    dataIndex: 'modified',
                    render: text => {
                        return (
                            <span>{text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: '20%',
                    render: (record) => (
                        <span>
                            <Link
                                className="mybutton"
                                to={`/myTemplateDetails/${record.app}/${record.name}/${record.latest_version}`}
                            >查看</Link>
                            <Divider type="vertical" />
                            <a
                                className="mybutton"
                                onClick={(record) => {
                                        this.copyContent(record.name, record.conf_name, record.description, record.latest_version, record.public, record.owner_type, 1)
                                    }}
                            >复制</a>
                        </span>
                    )
                }
            ]
        }
    }

    copyContent = (conf, name, desc, version, publics, owner_type, type)=>{
        let data = {
            conf_name: name + '-copy',
            description: desc,
            public: publics,
            owner_type: owner_type,
            version: version
        };
        this.setState({
            type: type === 1 ? '复制' : '编辑',
            conf: conf
        });
        if (version !== 0) {
            http.get('/api/configurations_version_read?conf=' + conf + '&version=' + version)
                .then(res=>{
                    data['data'] = res.message[0].data;
                    this.props.store.codeStore.setCopyData(data);
                })
        } else {
            this.props.store.codeStore.setCopyData(data);
        }

        this.props.store.codeStore.setCopyVisible(true);
    };

    CancelCopy = ()=>{
        this.props.store.codeStore.setCopyVisible(false)
    };

    showModal = () => {
        this.props.store.codeStore.setTemplateVisible(true)
    };

    handleCancel = () => {
        this.props.store.codeStore.setTemplateVisible(false)
    };

    getName = (name)=>{
        this.setState({
            visible: true,
            deleteName: name
        })
    };
    //取消删除
    cancelDelete = ()=>{
        this.setState({
            visible: false,
            deleteName: ''
        })
    };

    handleDelete = ()=>{
        http.post('/api/configurations_remove', {name: this.state.deleteName})
            .then(res=>{
                if (res.ok === false) {
                    message.error('删除失败，请联系管理员！')
                } else {
                    message.error('删除成功！')
                }
                this.setState({
                    visible: false,
                    deleteName: ''
                })
            });
    };

    callback = (key)=>{
        this.setState({
            key: key
        })
    };

    render () {
        const { templateList, app } = this.props;
        let myList = this.props.store.codeStore.templateList;
        const { type, conf, key, columns, columns2 } = this.state;
        return (
            <div className="templateList">
                <Button
                    type="primary"
                    onClick={this.showModal}
                    style={key === '2' ? none : block}
                >
                    上传新模板
                </Button>
                <MyTemplateForm
                    type={type}
                    conf={conf}
                    visible={this.props.store.codeStore.templateVisible}
                    onCancel={this.handleCancel}
                    app={app}
                    templateList={templateList}
                    myList={myList}
                />
                <CopyForm
                    type={type}
                    conf={conf}
                    visible={this.props.store.codeStore.copyVisible}
                    onCancel={this.CancelCopy}
                    app={app}
                    copyData={this.props.store.codeStore.copyData}
                />
                <Modal
                    title="提示信息"
                    okText="确定"
                    cancelText="取消"
                    visible={this.state.visible}
                    onOk={this.handleDelete}
                    onCancel={this.cancelDelete}
                >
                    <p>确认删除此模板？</p>
                </Modal>
                <Tabs
                    defaultActiveKey="1"
                    onChange={this.callback}
                >
                    <TabPane
                        tab="我的"
                        key="1"
                    >
                        {console.log(myList)}
                        <Table
                            style={myList === undefined || myList.length === 0 ? none : block}
                            columns={columns}
                            dataSource={myList}
                        >

                        </Table>
                        <p
                            className="empty"
                            style={myList.length > 0 ? none : block}
                        >
                            暂时没有上传模板！
                        </p>
                    </TabPane>
                    <TabPane
                        tab="所有"
                        key="2"
                    >
                        <Table
                            style={templateList === undefined || templateList.length === 0 ? none : block}
                            columns={columns2}
                            dataSource={templateList}
                        >

                        </Table>
                        <p
                            className="empty"
                            style={templateList && templateList.length > 0 ? none : block}
                        >
                            暂时没有模板！
                        </p>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
export default TemplateList;