import React, { PureComponent } from 'react';
import { Button } from 'antd';
import http from '../../../utils/Server';
import CollectionCreateForm from '../upData';

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

class VersionList extends PureComponent {
    state = {
        versionList: [],
        visible: false,
        user: ''
    };
    componentDidMount (){
        let {name, user} = this.props;
        this.setState({
            user: user
        });
        http.postToken('/api/method/app_center.api.get_versions?app=' + name + '&beta=1').then(res=>{
            console.log(res);
            this.setState({
                versionList: res.message
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
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log('Received values of form: ', values);
            form.resetFields();
            console.log(form);
            this.setState({ visible: false });
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
                    />
                </div>
                <ul>
                    {
                        data && data.length > 0 && data.map((v, key)=>{
                                console.log(data);
                                return <li key={key}>
                                    <div><p>版本号：<span className="fontColor">{v.version}</span>
                                        {
                                            v.meta === 0 ? <span>(正式版)</span> : <span>(测试版)</span>
                                        }
                                    </p></div>
                                    <div><p>更新时间：<span className="fontColor">{v.creation.substr(0, 19)}</span></p>
                                        {
                                            v.meta === 0 ? '' : <a style={this.state.user ? block : none}>发布为正式版本</a>
                                        }
                                    </div>
                                    <div><p>更新日志：<span className="fontColor">{v.comment}</span></p></div>
                                </li>
                            })

                    }
                </ul>
                <p style={data.length > 0 ? none : block}>请先上传版本！</p>
            </div>
        );
    }
}

export default VersionList;