import React, { PureComponent } from 'react';
import { Button } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import {_getCookie} from '../../utils/Session';
import ResetPasswordCreateForm from './resetPassword';
class UserSettings extends PureComponent {
    state = {
        info: {},
        company: '',
        isAdmin: '',
        visible: false
    };
    componentDidMount () {
        let usr = _getCookie('usr');
        let isAdmin = _getCookie('isAdmin');
        this.setState({
            isAdmin: isAdmin
        });
        http.get('/api/method/iot_ui.iot_api.user_company?' + Date.parse(new Date()))
            .then(res=>{
                this.setState({
                    company: res.message.company
                })
            });
        http.get('/api/method/iot_ui.iot_api.userinfo_all?user=' + usr)
            .then(res=>{
                console.log(res);
                this.setState({
                    info: res.message
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
            console.log('Received values of form: ', values);
            form.resetFields();
            this.setState({ visible: false });
        });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };
    render () {
        const { info, company, isAdmin } = this.state;
        return (
            <div className="userSettings">
                <div>
                    <p><span>|</span>基本资料</p>
                    <p><span>账户全称：</span><span>{info.first_name}{info.last_name}</span></p>
                    <p><span>账户ID：</span><span>{info.name}</span></p>
                    <Button
                        type="primary"
                        onClick={this.showModal}
                    >更改密码</Button>
                    <ResetPasswordCreateForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />
                </div>
                <div>
                    <p><span>|</span>联系信息</p>
                    <p><span>手机号：</span><span>{info.phone}</span></p>
                    <p><span>邮箱：</span><span>{info.name}</span></p>
                </div>
                <div>
                    <p><span>|</span>公司信息</p>
                    <p><span>所属公司：</span><span>{company}</span></p>
                    <p><span>身份角色：</span><span>{isAdmin ? '管理员' : '普通用户'}</span></p>
                </div>
            </div>
        );
    }
}
export default UserSettings;