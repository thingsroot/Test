import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Button, message, Tabs, Modal, Table, Divider } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import TemplateForm from '../TemplateForm';
import CopyForm from '../CopyForm';
import intl from 'react-intl-universal';

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
                    title: intl.get('appdetails.template_name'),
                    dataIndex: 'conf_name',
                    key: 'conf_name'
                },
                {
                    title: intl.get('common.desc'),
                    dataIndex: 'description',
                    key: 'description'
                },
                {
                    title: intl.get('appdetails.owner_type'),
                    dataIndex: 'company',
                    key: 'company',
                    render: (val) => {
                        return (
                            <span>{!val ? intl.get('gateway.individual') : intl.get('gateway.company')}</span>
                        )
                    }
                },
                {
                    title: intl.get('appdetails.access_right'),
                    dataIndex: 'public',
                    key: 'public',
                    render: (val) => {
                        return (
                            <span>{val === 0 ? intl.get('gateway.individual') : intl.get('appdetails.public')}</span>
                        )
                    }
                },
                {
                    title: intl.get('appdetails.version'),
                    dataIndex: 'latest_version',
                    key: 'latest_version'
                },
                {
                    title: intl.get('appdetails.modification_time'),
                    key: 'modified',
                    dataIndex: 'modified',
                    render: text => {
                        return (
                            <span>{text && text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: intl.get('common.operation'),
                    key: 'action',
                    width: '26%',
                    render: (record) => (
                        <span>
                            <Link
                                className="mybutton"
                                to={`/template/${record.app}/${record.name}/${record.latest_version}`}
                            >{intl.get('appdetails.see')}</Link>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'edit')
                                    }}
                            >{intl.get('appdetails.edit')}</a>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'copy')
                                    }}
                            >{intl.get('appdetails.copy')}</a>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={()=>{
                                    this.deleteTemplate(record.name)
                                }}
                            >{intl.get('appdetails.delete')}</a>
                        </span>
                    )
                }
            ],
            columns2: [
                {
                    title: intl.get('appdetails.template_name'),
                    dataIndex: 'conf_name',
                    key: 'conf_name'
                },
                {
                    title: intl.get('common.desc'),
                    dataIndex: 'description',
                    key: 'description'
                },
                {
                    title: intl.get('appdetails.owner'),
                    dataIndex: 'owner_id',
                    key: 'owner_id'
                },
                {
                    title: intl.get('appdetails.version'),
                    dataIndex: 'latest_version',
                    key: 'latest_version'
                },
                {
                    title: intl.get('appdetails.modification_time'),
                    key: 'modified',
                    dataIndex: 'modified',
                    render: text => {
                        return (
                            <span>{text && text.substr(0, 19)}</span>
                        )
                    }
                },
                {
                    title: intl.get('common.operation'),
                    key: 'action',
                    width: '20%',
                    render: (record) => (
                        <span>
                            <Link
                                className="mybutton"
                                to={`/template/${record.app}/${record.name}/${record.latest_version}`}
                            >{intl.get('appdetails.see')}</Link>
                            <Divider type="vertical" />
                            <a
                                style={{cursor: 'pointer'}}
                                className="mybutton"
                                onClick={() => {
                                        this.editContent(record, 'copy')
                                    }}
                            >{intl.get('appdetails.copy')}</a>
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
            new_name = record.conf_name + '-copy'
        }
        let data = {
            conf_name: new_name,
            description: record.description,
            public: record.public,
            developer: record.developer,
            company: record.company,
            version: record.latest_version
        };
        this.setState({
            type: type === 'copy' ? intl.get('appdetails.copy') : intl.get('appdetails.edit'),
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
                    message.error(`${intl.get('appdetails.failed_to_delete')}!`)
                } else {
                    message.success(`${intl.get('appdetails.delete_successful')}!`)
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
                    {intl.get('appdetails.new_template')}
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
                    title={intl.get('appdetails.prompt_information')}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    visible={this.state.visible}
                    onOk={this.handleDelete}
                    onCancel={this.cancelDelete}
                >
                    <p>{`${intl.get('appdetails.confirm_to_delete_this_template')}?`}</p>
                </Modal>
                <Tabs
                    defaultActiveKey={defaultActiveKey}
                    onChange={this.callback}
                >
                    <TabPane
                        tab={intl.get('appdetails.my')}
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
                            {intl.get('appdetails.no_template_has_been_uploaded_yet')}
                        </p>
                    </TabPane>
                    <TabPane
                        tab={intl.get('appdetails.all')}
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
                            {intl.get('appdetails.no_template_for_now')}
                        </p>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}
export default TemplateList;