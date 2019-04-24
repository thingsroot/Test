import React, { Component } from 'react';
import http from '../../../utils/Server';
import { Button, message, Tabs, Divider, Modal } from 'antd';
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
            deleteName: ''
        }
    }

    copyContent = (conf, name, desc, version, publics, owner_type)=>{
        let data = {
            conf_name: name + '-copy',
            description: desc,
            public: publics,
            owner_type: owner_type,
            version: version
        };
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

    render () {
        const { templateList, app } = this.props;
        let myList = this.props.store.codeStore.templateList;
        const { templateContent } = this.state;
        return (
            <div className="templateList">
                <Button
                    type="primary"
                    onClick={this.showModal}
                >
                    上传新模板
                </Button>
                <MyTemplateForm
                    visible={this.props.store.codeStore.templateVisible}
                    onCancel={this.handleCancel}
                    app={app}
                    templateList={templateList}
                    myList={myList}
                />
                <CopyForm
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
                <Tabs>
                    <TabPane
                        tab="我的"
                        key="1"
                    >
                        <ul>
                            {
                                myList && myList.length > 0 && myList.map((v, key)=>{
                                    return <li key={key}>
                                        <div>
                                            <p>模板名称：<span className="fontColor">{v.conf_name}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p>描述：<span className="fontColor">{v.description}</span></p>
                                        </div>
                                        <div>
                                            <div>版本号：<span className="fontColor">{v.latest_version}</span>
                                                <div style={{float: 'right'}}>
                                                    <span
                                                        style={{height: '26px', cursor: 'pointer'}}
                                                    >
                                                        <Link
                                                            to={`/myTemplateDetails/${v.app}/${v.name}/${v.latest_version}`}
                                                        >
                                                            查看
                                                        </Link>
                                                    </span>
                                                    <Divider type="vertical" />
                                                    <span
                                                        style={{height: '26px', cursor: 'pointer'}}
                                                        onClick={
                                                            () => {
                                                                this.copyContent(v.name, v.conf_name, v.description, v.latest_version, v.public, v.owner_type)
                                                            }
                                                        }
                                                    >复制</span>
                                                    <Divider type="vertical" />
                                                    {/*<span*/}
                                                    {/*    style={{height: '26px', cursor: 'pointer'}}*/}
                                                    {/*>*/}
                                                    {/*    修改*/}
                                                    {/*</span>*/}
                                                    {/*<Divider type="vertical" />*/}
                                                    <span
                                                        style={{height: '26px', cursor: 'pointer'}}
                                                        onClick={()=>{
                                                            this.getName(v.name)
                                                        }}
                                                    >
                                                        删除
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                })
                            }
                        </ul>
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
                        <ul>
                            {
                                templateList && templateList.length > 0 && templateList.map((v, key)=>{
                                    return <li key={key}>
                                        <div>
                                            <p>模板名称：<span className="fontColor">{v.conf_name}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p>描述：<span className="fontColor">{v.description}</span></p>
                                        </div>
                                        <div>
                                            <div>版本号：<span className="fontColor">{v.latest_version}</span>
                                                <p style={{float: 'right'}}>
                                                    <Button
                                                        type="primary"
                                                        style={{height: '26px'}}
                                                    >
                                                        <Link
                                                            to={`/myTemplateDetails/${v.app}/${v.name}/${v.latest_version}`}
                                                        >
                                                            查看
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        style={{height: '26px'}}
                                                        onClick={
                                                            () => {
                                                                this.copyContent(v.app, v.name, v.latest_version)
                                                            }
                                                        }
                                                    >复制</Button>
                                                </p>
                                                <input
                                                    id="templateContent"
                                                    type="hidden"
                                                    value={templateContent}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                })
                            }
                        </ul>
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