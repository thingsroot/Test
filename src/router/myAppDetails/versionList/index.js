import React, { PureComponent } from 'react';
import { Button, message } from 'antd';
import http from '../../../utils/Server';
import CollectionCreateForm from '../upData';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};
function arrSort (arr) {
    arr.sort(function (a, b) {
        return b - a;
    });
    return arr;
}

class VersionList extends PureComponent {
    state = {
        versionList: [],
        visible: false,
        user: '',
        maxVersion: 0,
        name: ''
    };
    componentDidMount (){
        let {name, user} = this.props;
        this.setState({
            user: user,
            name: name
        });
        http.get('/api/applications_versions_list?app=' + name).then(res=>{
            console.log(res)
            let arr = res.data;
            let versions = [];
            arr && arr.length > 0 && arr.map((v, key)=>{
                key;
                console.log(v.version);
                versions.push(v.version)
            });
            arrSort(versions);
            this.setState({
                versionList: arr,
                maxVersion: versions[0] + 1
            })
        })
    }
    showModal = () => {
        this.setState({ visible: true });
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleCreate = () => {
        const form = this.formRef.props.form;
        console.log(form);
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            let data = {
                app: this.state.name,
                version: values.version,
                comment: values.comment,
                app_file: values.app_file.file
            };
            console.log(data);
            http.postToken('/api/applications_versions_create', data).then(res=>{
                if (res.ok === false) {
                    message.error('新版本上传失败！');
                } else {
                    message.success('新版本上传成功！');
                    console.log(res);
                    this.setState({ visible: false });
                }

            });
            form.resetFields();

        });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };
    render () {
        let data = this.state.versionList;
        return (
            <div className="versionList">
                <div>
                    <Button
                        type="primary"
                        onClick={this.showModal}
                    >
                        上传新版本
                    </Button>
                    <CollectionCreateForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        maxVersion={this.state.maxVersion}
                    />
                </div>
                <ul>
                    {
                        data && data.length > 0 && data.map((v, key)=>{
                                return <li key={key}>
                                    <div><p>版本号：<span className="fontColor">{v.version}</span>
                                        {
                                            v.meta === 0 ? <span>(正式版)</span> : <span>(测试版)</span>
                                        }
                                    </p></div>
                                    <div><p>更新时间：<span className="fontColor">{v.modified.substr(0, 19)}</span></p>
                                        {
                                            v.meta === 0 ? '' : <a style={this.state.user ? block : none}>发布为正式版本</a>
                                        }
                                    </div>
                                    <div><p>更新日志：<span className="fontColor">{v.comment}</span></p></div>
                                </li>
                            })

                    }
                </ul>
                <p
                    className="empty"
                    style={data.length > 0 ? none : block}
                >请先上传版本！
                </p>
            </div>
        );
    }
}

export default VersionList;