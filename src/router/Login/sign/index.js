import React, { PureComponent } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {
    Form, Icon, Input, Button, Checkbox, message
} from 'antd';
import http  from '../../../utils/Server';
import { _getCookie, _setCookie } from '../../../utils/Session';
@withRouter
class Sign extends PureComponent {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                http.post('/api/user_login', {
                    username: values.userName,
                    password: values.password
                }).then(res=>{
                    if (res.statusText === 'OK') {
                        const Cookie = res.headers['set-cookie'];
                        Cookie.map(item=>{
                            const name = item.slice(0, item.indexOf('='))
                            const content = item.slice(item.indexOf('=') + 1)
                            _setCookie(name, content, 24)
                        });
                        http.get('/api/developers_read?name=' + _getCookie('user_id'))
                            .then(res=>{
                                if (!res.error) {
                                    if (res.data.enabled === 1) {
                                        _setCookie('is_developer', '1')
                                    } else {
                                        _setCookie('is_ddeveloper', '0')
                                    }
                                } else {
                                    _setCookie('is_ddeveloper', '0')
                                }
                            });
                        _setCookie('T&R_auth_token', res.data.data.csrf_token)
                        message.success('登录成功，正在跳转', 1).then(()=>{
                            if (_getCookie('T&R_auth_token') !== null ){
                                this.props.history.push('/')
                            }
                        })
                    }
                }).catch(function (error){
                    if (error){
                        message.info('账号密码错误，请重新输入')
                    }
                })
            }
        });
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <p className="title">密码登录</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('userName', {
                            rules: [{ required: true, message: '请输入用户名' }]
                        })(
                            <Input prefix={
                                <Icon type="user"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                placeholder="Username"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入密码!' }]
                        })(
                            <Input prefix={
                                <Icon type="lock"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                type="password"
                                placeholder="Password"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('remember', {
                            valuePropName: 'checked',
                            initialValue: true
                        })(
                            <Checkbox>记住我！</Checkbox>
                        )}
                        <Link className="login-form-forgot"
                            style={{float: 'right'}}
                            to="/login/retrieve"
                        >忘记密码</Link>
                        <Button type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                        >登录</Button>
                        <Link to="/login/register"
                            style={{display: 'block', height: '60px'}}
                        >注册</Link>
                    </Form.Item>
                </Form>
            </div>

        );
    }
}
export default Form.create({ name: 'normal_login' })(Sign);