import React, { PureComponent } from 'react';
import {
    Form, Icon, Input, Button, message
} from 'antd';
import { getParam } from '../../../utils/Session';
import http from '../../../utils/Server';
import intl from 'react-intl-universal';


class Password extends PureComponent {
    componentDidMount (){
        let update_key  = getParam('key');
        if (update_key === null){
            this.props.history.push('/');
        }
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const data = {
                    new_password: values.password,
                    logout_all_sessions: 0,
                    key: getParam('key')
                }
                http.post('/api/user_update_password', data).then(res=>{
                    if (res.ok) {
                            message.success(res.full_name + intl.get('login.password_reset_succeeded') + intl.get('login.return_to_the_console_in_2_seconds'), 2).then(()=>{
                                this.props.history.push('/');
                            })
                    } else {
                        message.error(`${intl.get('login.failed_to_reset_password')}: ` + res.exception + `，${intl.get('login.return_to_login_page_in_5_seconds')}`, 5).then(()=>{
                            this.props.history.push('/login');
                        })
                    }
                })
            }
        });
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        //  密码验证
        const passwordValidator = (rule, value, callback) => {
            const { getFieldValue } = this.props.form;
            if (value && value !== getFieldValue('password')) {
                callback(intl.get('login.the_two_inputs_are_inconsistent'))
            }
            // 必须总是返回一个 callback，否则 validateFields 无法响应
            callback();
        };
        return (
            <div>
                <p className="title">{intl.get('login.update_password')}</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: `${intl.get('login.please_input_a_password')}!` }, {
                                pattern: /^(?![a-zA-z]+$)(?!\d+$)(?![!@_#$%^&*]+$)[a-zA-Z\d!_@#$%^&*]{6,12}$/,
                                message: intl.get('login.the_minimum_length_is_6_digits')
                            }]
                        })(
                            <Input prefix={
                                <Icon type="lock"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                type="password"
                                placeholder="password"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('passwordcomfire', {
                            rules: [{ required: true, message: `${intl.get('login.please_enter_the_password_again')}!` }, {
                                validator: passwordValidator
                            }]
                        })(
                            <Input prefix={
                                <Icon type="lock"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                type="password"
                                placeholder="password"
                            />
                        )}

                    </Form.Item>
                    <Form.Item>
                        <Button type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                        >
                            {intl.get('common.sure')}
                        </Button>
                        <span
                            style={{display: 'inlineBlock', width: '91%', height: '30px', float: 'left'}}
                        >   </span>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default Form.create({ name: 'normal_password' })(Password);