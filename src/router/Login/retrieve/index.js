import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, Icon, Input, Button, message
} from 'antd';
import http from '../../../utils/Server';
import intl from 'react-intl-universal';

class Retrieve extends PureComponent {
    state = {
        disabled: false
    };
    handleSubmit = (e) => {
        this.setState({
            disabled: true
        })
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            const data = {
                email: values.password
            };
            if (!err) {
                http.post('/api/user_reset_password', data).then(res=>{
                    if (res.error) {
                        if (res.error === 'user_not_found') {
                            message.info(intl.get('login.user_does_not_exist'))
                            this.setState({
                                disabled: false
                            })
                        }
                    }
                    if (res.ok){
                        if (res.info === 'password_reset_email_sent'){
                            message.info(intl.get('login.application_for_reset_succeeded') + values.password + intl.get('login.complete_password_reset'))
                        }
                    }
                }).catch(function (error){
                    if (error){
                        message.info(intl.get('login.commit_errorlogin.retrieve_password'))
                        this.setState({
                            disabled: false
                        })
                    }
                })
            }
        });
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <p className="title">{intl.get('')}</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: `${intl.get('login.please_enter_email')}!` }, {
                                pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                                message: intl.get('login.email_format_is_incorrect')
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                            disabled={this.state.disabled}
                        >
                            {this.state.disabled ? intl.get('login.has_been_sent') : intl.get('common.sure')}
                        </Button>
                        <Link to="/login"
                            style={{display: 'inlineBlock', width: '91%', height: '60px', float: 'left'}}
                        >{intl.get('login.return')}</Link>
                        <Link to="/login/register"
                            style={{display: 'inlineBlock', width: '9%', height: '60px', float: 'right'}}
                        >{intl.get('login.register')}</Link>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default Form.create({ name: 'normal_retrieve' })(Retrieve);