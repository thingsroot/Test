import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {
    Form, Icon, Input, Button, Checkbox, message
} from 'antd';
import http  from '../../../utils/Server';
import { authenticateSuccess } from '../../../utils/Session';
import Cookies from 'js-cookie'
import OEM from '../../../assets/OEM';
import intl from 'react-intl-universal';

@withRouter
class Sign extends PureComponent {
    componentDidMount () {
        const keys = document.cookie.match(/[^ =;]+(?==)/g)
        keys && keys.length > 0 && keys.map((item, key)=>{
            Cookies.remove(keys[key])
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                http.postNoToken('/api/user_login', {
                    username: values.userName,
                    password: values.password
                }).then(res=>{
                    if (res.ok) {
                        authenticateSuccess(res.data)
                        message.success(intl.get('login.login_succeeded'), 3).then(()=>{
                            location.href = '/dashboard';
                        })
                    } else {
                        if (res.message === 'Incorrect password') {
                            message.info(intl.get('login.account_password_error'))
                            return false;
                        }
                        if (res.message === 'User disabled or missing') {
                            message.info(intl.get('login.the_user_is_not_registered_or_disabled'))
                            return false;
                        } else {
                            message.error(intl.get('login.user_name_and_password_do_not_match'))
                        }
                    }
                }).catch(function (error){
                    console.log(error)
                    if (error){
                        message.info(intl.get('login.system_error'))
                    }
                })
            }
        });
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <p className="title">{intl.get('login.password_login')}</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('userName', {
                            rules: [{ required: true, message: intl.get('login.enter_one_user_name') }]
                        })(
                            <Input prefix={
                                <Icon type="user"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                placeholder={intl.get('login.email_address_or_user_name')}
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: `${intl.get('login.please_input_a_password')}!` }]
                        })(
                            <Input prefix={
                                <Icon type="lock"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                type="password"
                                placeholder={intl.get('login.password')}
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true
                        })(
                            <Checkbox>{intl.get('login.Remember_me')}</Checkbox>
                        )}
                        {
                            OEM.Title === intl.get('login.winter_bamboo_shoots_cloud')
                            ? <Link className="login-form-forgot"
                                style={{float: 'right'}}
                                to="/login/retrieve"
                              >{intl.get('login.forget_password')}</Link>
                            : ''
                        }
                        <Button type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                        >{intl.get('login.login')}</Button>
                        {console.log(OEM.Title, 'title', intl.get('login.winter_bamboo_shoots_cloud'), 'en')}
                        {
                            OEM.Title === intl.get('login.winter_bamboo_shoots_cloud')
                            ? <Link to="/login/register"
                                style={{display: OEM.Title === intl.get('login.winter_bamboo_shoots_cloud') ? 'block' : 'none', height: '60px', float: 'right'}}
                              >{intl.get('login.free_registration')}</Link>
                            : <div style={{height: '60px'}}></div>
                        }
                    </Form.Item>
                </Form>
            </div>

        );
    }
}
export default Form.create({ name: 'normal_login' })(Sign);