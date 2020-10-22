import React, { PureComponent } from 'react';
import { Button, Timeline, message } from 'antd';
// import http from '../../../utils/Server';
import UploadForm from '../UploadForm';
import http from '../../../utils/Server';

const block = {
    display: 'block',
    cursor: 'pointer'
};
const none = {
    display: 'none',
    cursor: 'pointer'
};
class VersionList extends PureComponent {
    state = {
        user: '',
        name: '',
        visible: false
    };

    showModal = () => {
        this.setState({visible: true})
    };

    handleCancel = () => {
        this.setState({visible: false})
    };
    handleSuccess = () => {
        this.setState({visible: false})
        this.props.onUpdate()
    };
    beta_upgrade = (item) => {
        http.post('/api/applications_release', {
            app: item.app,
            version: item.version
        }).then(res=>{
            if (res.ok) {
                message.success('发布为正式版本成功！')
                this.props.onUpdate()
            }
        })
    }
    render () {
        let { app, dataSource, onUpdate, initialVersion } = this.props;
        onUpdate;
        return (
            <div className="versionList">
                <div>
                    <Button
                        type="primary"
                        onClick={this.showModal}
                    >
                        上传新版本
                    </Button>
                    <UploadForm
                        visible={this.state.visible}
                        initialValue={initialVersion}
                        onCancel={this.handleCancel}
                        onSuccess={this.handleSuccess}
                        app={app}
                    />
                </div>
                <div className="version_list_detail">
                    <Timeline mode="left">
                        {
                            dataSource && dataSource.length > 0 && dataSource.map((v, key)=>{
                                return (
                                    <Timeline.Item
                                        dot={v.modified.substr(0, 19)}
                                        key={key}
                                        position="left"
                                    >
                                        {
                                            v.update && this.props.user
                                            ? <Button
                                                className="versionList_update_button"
                                                type="primary"
                                                onClick={()=>{
                                                    this.beta_upgrade(v)
                                                    }
                                                }
                                              >
                                                升级为正式版
                                            </Button>
                                            : ''
                                        }
                                        <p>

                                            版本号:<span className="fontColor">{v.version}</span>
                                        </p>
                                        <p>
                                            更新日志：<span className="fontColor">{v.comment}</span>
                                        </p>
                                        <span className={v.beta === 1 ? 'version_list_detail_icon_red' : 'version_list_detail_icon'}></span>
                                    </Timeline.Item>
                                )
                            })
                        }
                    </Timeline>
                </div>
                <p
                    className="empty"
                    style={dataSource.length > 0 ? none : block}
                >请先上传版本！</p>
            </div>
        );
    }
}

export default VersionList;