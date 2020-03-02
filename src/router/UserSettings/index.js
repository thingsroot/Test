import React, { PureComponent } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, message } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import ResetPasswordCreateForm from './ResetPassword';
import intl from 'react-intl-universal';


@inject('store')
@observer
class UserSettings extends PureComponent {
    state = {
        info: {},
        company: '',
        isAdmin: '',
        visible: false
    };
    componentDidMount () {
        const {is_admin, user_id} = this.props.store.session
        this.setState({
            isAdmin: is_admin
        });
        http.get('/api/user_read?name=' + user_id).then(res=>{
            let role = '';
            let groups = res.data.groups;
            groups && groups.length > 0 && groups.map((v, key)=>{
                key;
                role = v.role;
            });
            this.setState({
                info: res.data,
                company: res.data.companies[0],
                isAdmin: role
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
            let data = {
                old_password: values.oldPassword,
                new_password: values.password
            };
            http.post('/api/user_update_password', data).then(res=>{
                res;
                // TODO: Post Logout ?????
                this.props.store.session.setUserId('Guest')
                this.props.store.session.setSid('Guest')
                this.props.store.session.setCSRFToken('')
                message.success(intl.get('usersettings.password_change_succeeded'), 1.5).then(()=>{
                    console.log('Logout')
                    location.href = '/';
                })
            }).catch(err=>{
                err;
                message.success(intl.get('usersettings.failed_to_modify_password'))
            });
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
                    <p><span>|</span>{intl.get('usersettings.basic_data')}</p>
                    <p><span>{intl.get('usersettings.full_name_of_account')}：</span><span>{info.first_name}{info.last_name}</span></p>
                    <p><span>{intl.get('usersettings.account_ID')}：</span><span>{info.name}</span></p>
                    <br/>
                    <Button
                        type="primary"
                        onClick={this.showModal}
                    >{intl.get('usersettins.change_password')}</Button>
                    <ResetPasswordCreateForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />
                </div>
                <div>
                    <p><span>|</span>{intl.get('usersettings.contact_information')}</p>
                    <p><span>{intl.get('appdeveloper.cell-phone_number')}：</span><span>{info.mobile_no}</span></p>
                    <p><span>{intl.get('usersettings.mailbox')}：</span><span>{info.name}</span></p>
                </div>
                <div>
                    <p><span>|</span>{intl.get('usersettings.company_information')}</p>
                    <p><span>{intl.get('usersettings.affiliated_company')}：</span><span>{company}</span></p>
                    <p><span>{intl.get('usersettings.status_role')}：</span><span>{isAdmin ? intl.get('usersettings.administrators') : intl.get('usersettings.ordinary_users')}</span></p>
                </div>
            </div>
        );
    }
}
export default UserSettings;