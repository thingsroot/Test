import React, { PureComponent } from 'react';
import { Button } from 'antd';
// import http from '../../../utils/Server';
import UploadForm from '../UploadForm';
import intl from 'react-intl-universal';

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
                        {intl.get('appdetails.upload_new_version')}
                    </Button>
                    <UploadForm
                        visible={this.state.visible}
                        initialValue={initialVersion}
                        onCancel={this.handleCancel}
                        onSuccess={this.handleSuccess}
                        app={app}
                    />
                </div>
                <ul>
                    {
                        dataSource && dataSource.length > 0 && dataSource.map((v, key)=>{
                                return <li key={key}>
                                    <div><p>{intl.get('appdetails.version_number')}：<span className="fontColor">{v.version}</span>
                                        {
                                            v.beta === 0 ? <span>{`(${intl.get('appdetails.official_version')})`}</span> : <span>{`(${intl.get('appdetails.beta_version')})`}</span>
                                        }
                                    </p></div>
                                    <div><p>{intl.get('appdetails.update_time')}：<span className="fontColor">{v.modified.substr(0, 19)}</span></p>
                                        {
                                            v.meta === 0 ? '' : <span style={this.state.user ? block : none}>{intl.get('appdetails.release_as_official')}</span>
                                        }
                                    </div>
                                    <div><p>{intl.get('appdetails.update_log')}：<span className="fontColor">{v.comment}</span></p></div>
                                </li>
                            })

                    }
                </ul>
                <p
                    className="empty"
                    style={dataSource.length > 0 ? none : block}
                >{intl.get('appdetails.please_upload_the_version_first')}</p>
            </div>
        );
    }
}

export default VersionList;