import React, { PureComponent } from 'react';
import {
    Modal, Form, Input
} from 'antd';
import http from '../../../utils/Server';
import intl from 'react-intl-universal';

const ResetPasswordCreateForm = Form.create({ name: 'resetPassword' })(
    class extends PureComponent {
        state = {
            oldPassword: '',
            num: '',
            newPassword: ''
        };

        render () {
            const {
                visible, onCancel, onCreate, form
            } = this.props;
            const { getFieldDecorator } = form;
            //旧密码验证
            const verifyPassword = (rule, value, callback) => {
                http.post('/apis/api/method/iot_ui.iot_api.verify_password', {password: value})
                    .then(res=> {
                        res;
                        callback()
                    })
                    .catch(err=>{
                        err;
                        callback(intl.get('usersettings.the_old_password_is_incorrect'))
                    })
                // callback(value)
            };
            //  密码验证
            const passwordValidator = (rule, value, callback) => {
                const { getFieldValue } = this.props.form;
                if (value && value !== getFieldValue('password')) {
                    callback(intl.get('login.the_two_inputs_are_inconsistent'))
                }
                callback();
            };

            return (
                <Modal
                    visible={visible}
                    title={intl.get('login.change_password')}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label={intl.get('usersettings.old_password')}>
                            {getFieldDecorator('oldPassword', {
                                rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }, {
                                    validator: verifyPassword
                            }]
                            })(
                                <Input type="password"/>
                            )}
                        </Form.Item>
                        <Form.Item label={intl.get('login.new_password')}>
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: `${intl.get('login.please_input_a_password')}!` }, {
                                    pattern: /^(?![a-zA-z]+$)(?!\d+$)(?![!@_#$%^&*]+$)[a-zA-Z\d!_@#$%^&*]{6,12}$/,
                                    message: intl.get('login.the_minimum_length_is_6_digits')
                                }]
                            })(
                                <Input
                                    type="password"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label={intl.get('login.confirm_new_password')}>
                            {getFieldDecorator('passwordComfire', {
                                rules: [{ required: true, message: `${intl.get('login.please_enter_the_password_again')}!` }, {
                                    validator: passwordValidator
                                }]
                            })(
                                <Input
                                    type="password"
                                />
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);
export default ResetPasswordCreateForm;
