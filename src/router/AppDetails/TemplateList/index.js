import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Button, message, Tabs, Modal, Table, Divider } from 'antd';
import { withRouter } from 'react-router-dom';
import TemplateForm from '../TemplateForm';
import CopyForm from '../CopyForm';
import { _getCookie } from '../../../utils/Session';
const TabPane = Tabs.TabPane;
const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

@withRouter
class TemplateList extends Component {
    constructor () {
        super();
        this.state = {
            deleteName: '',
            type: '',
            conf: '',
            myList: [],
            templateList: [],
            showNew: false,
            showCopy: false,
            defaultActiveKey: 'private',
            copyData: {},
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
                    title: '所有者类型',
                    dataIndex: 'company',
                    key: 'company',
                    render: (val) => {
                        return (
                            <span>{!val ? '个人' : '公司'}</span>
                        )
                    }
                },
                {
                    title: '访问权限',
                    dataIndex: 'public',
                    key: 'public',
                    render: (val) => {
                        return (
                            <span>{val === 0 ? '个人' : '公开'}</span>
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
                            <span>{text && text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: '26%',
                    render: (record) => (
                        <span>
                            <Button
                                type="link"
                                className="mybutton"
                                style={{color: '#000'}}
                                onClick={()=>{
                                    window.open(`/template/${record.app}/${record.name}`, '_blank')
                                }}
                            >查看</Button>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'edit')
                                    }}
                            >设置</a>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'copy')
                                    }}
                            >复制</a>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={()=>{
                                    this.deleteTemplate(record.name)
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
                    title: '所有者',
                    dataIndex: 'owner_id',
                    key: 'owner_id'
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
                            <span>{text && text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: '操作',
                    key: 'action',
                    width: '20%',
                    render: (record) => (
                        <span>
                            <Button
                                type="link"
                                className="mybutton"
                                style={{color: '#000'}}
                                onClick={()=>{
                                    window.open(`/template/${record.app}/${record.name}`, '_blank')
                                }}
                            >查看</Button>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'copy')
                                    }}
                            >复制</a>
                        </span>
                    )
                }
            ]
        }
    }

    componentDidMount (){
        const { app, newTemplateVisiable } = this.props;
        if (newTemplateVisiable) {
            this.setState({showNew: newTemplateVisiable})
        }
        http.get('/api/store_configurations_list?app=' + app + '&conf_type=Template')
            .then(res=>{
                if (res.ok) {
                    this.setState({
                        templateList: res.data
                    });
                }
            });
        this.refreshMyList()
    }

    editContent = (record, type)=>{
        let new_name = record.conf_name;
        if (type === 'copy') {
            new_name = record.conf_name
        }
        let data = {
            conf_name: new_name,
            description: record.description,
            public: record.public,
            developer: record.developer,
            company: _getCookie('companies') !== undefined ? record.company : null,
            version: record.latest_version
        };
        this.setState({
            type: type === 'copy' ? '复制' : '编辑',
            conf: record.name
        });
        if (record.latest_version !== 0) {
            http.get('/api/configurations_version_read?conf=' + record.name + '&version=' + record.latest_version)
                .then(res=>{
                    if (res.ok) {
                        data.data = res.data;
                        this.setState({copyData: data, showCopy: true})
                    } else {
                        message.error(res.error);
                    }
                })
        } else {
            this.setState({copyData: data, showCopy: true})
        }
    };

    handleCreateSuccess = () => {
        this.refreshMyList()
        // let newList = [...this.state.myList, newData]
        // this.setState({
        //     myList: newList
        // })
        //list.unshift(res.data);
    }

    refreshMyList = ()=> {
        const { app } = this.props;
        if (app === undefined) {
            return
        }
        http.get('/api/user_configurations_list?app=' + app).then(res=>{
            this.setState({myList: res.data})
        });
    }

    deleteTemplate = (name)=>{
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
                    message.success('删除成功！')
                    this.refreshMyList()
                }
                this.setState({
                    visible: false,
                    deleteName: ''
                })
            });
    };

    callback = (value)=>{
        this.setState({
            defaultActiveKey: value
        })
    }

    render () {
        const { app } = this.props;
        const { myList, type, conf, templateList, columns, columns2, showNew, showCopy, copyData, defaultActiveKey } = this.state;
        return (
            <div className="templateList">
                <Button
                    type="primary"
                    onClick={() => {
                        this.setState({showNew: true})
                    }}
                >
                    新建模板
                </Button>
                <TemplateForm
                    type={type}
                    conf={conf}
                    visible={showNew}
                    onCancel={() => {
                        this.setState({showNew: false})
                    }}
                    onOK={() => {
                        this.setState({showNew: false})
                    }}
                    onSuccess={this.handleCreateSuccess}
                    app={app}
                />
                <CopyForm
                    type={type}
                    conf={conf}
                    visible={showCopy}
                    onCancel={() => {
                        this.setState({showCopy: false})
                    }}
                    onOK={() => {
                        this.setState({showCopy: false}, ()=>{
                            this.refreshMyList()
                        })
                    }}
                    onSuccess={this.handleCreateSuccess}
                    app={app}
                    copyData={copyData}
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
                    defaultActiveKey={defaultActiveKey}
                    onChange={this.callback}
                >
                    <TabPane
                        tab="我的"
                        key="private"
                    >
                        <Table
                            style={myList === undefined || myList.length === 0 ? none : block}
                            columns={columns}
                            rowKey="name"
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
                        key="store"
                    >
                        <Table
                            style={templateList === undefined || templateList.length === 0 ? none : block}
                            columns={columns2}
                            rowKey="name"
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