import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, Icon, Input, Button, message
} from 'antd';
import http from '../../../utils/Server';
import intl from 'react-intl-universal';

class Register extends PureComponent {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const data = {
                email: values.email,
                full_name: values.username
            }
            if (!err) {
                http.post('/api/user_create', data).then(res=>{
                    if (res.ok){
                        if (res.result === 0){
                            message.info(intl.get('login.this_user') + res.info)
                        }
                        if (res.result === 1){
                            message.info(`${intl.get('login.login_was_successful')}，` + res.info + intl.get('login.login_mailbox') + values.email + intl.get('login.completion_of_registration'))
                        }
                    }
                })
            }
        });
    }

    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <p className="title">{intl.get('login.user_registration')}</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('email', {
                            rules: [{ required: true, message: `${intl.get('login.please_enter_email')}!` }, {
                                pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                                message: intl.get('login.incorrect_mailbox_format')
                            }]
                        })(
                            <Input prefix={
                                <Icon type="mail"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                placeholder="email"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: `${intl.get('login.enter_one_user_name')}!`}, {
                                pattern: /^([\d]|[\w]){6,16}$/, message: intl.get('login.the_format_of_user_name_is_6-16_letters')
                            }]
                        })(
                            <Input prefix={
                                <Icon type="user"
                                    style={{ color: 'rgba(0,0,0,.25)' }}
                                />}
                                type="username"
                                placeholder="username"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                        >
                            {intl.get('login.register')}
                        </Button>
                        <Link to="/login"
                            style={{display: 'block', height: '60px'}}
                        >{intl.get('login.login')}</Link>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default Form.create({ name: 'normal_register' })(Register);