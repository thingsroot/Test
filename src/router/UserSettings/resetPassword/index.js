import React, { PureComponent } from 'react';
import {
    Modal, Form, Input
} from 'antd';
import http from '../../../utils/Server';

const ResetPasswordCreateForm = Form.create({ name: 'resetPassword' })(
    class extends PureComponent {
        state = {
            oldPassword: '',
            num: '',
            newPassword: ''
        };
        VerifyPassword = (password)=>{
            http.post('/api/method/iot_ui.iot_api.verify_password?password=' + password)
                .then(res=>{
                    console.log(res)
                })
        };

        render () {
            const {
                visible, onCancel, onCreate, form
            } = this.props;
            const { getFieldDecorator } = form;
            //  密码验证
            const passwordValidator = (rule, value, callback) => {
                const { getFieldValue } = this.props.form;
                if (value && value !== getFieldValue('password')) {
                    callback('两次输入不一致！')
                }

                // 必须总是返回一个 callback，否则 validateFields 无法响应
                callback();
            };
            const oldPassword = (rule, value, callback) => {
                console.log(value);
                this.setState({
                    num: value
                });

                setTimeout(()=>{
                    http.postToken('/api/method/iot_ui.iot_api.verify_password?password=' + this.state.num)
                        .catch(err=>{
                            console.log(err);
                            callback('请输入正确的旧密码！')
                        });
                }, 500)

            };
            return (
                <Modal
                    visible={visible}
                    title="修改密码"
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label="旧密码">
                            {getFieldDecorator('oldPassword', {
                                rules: [{ required: true, message: '不能为空' }, {
                                    validator: oldPassword
                                }]
                            })(
                                <Input type="password"/>
                            )}
                        </Form.Item>
                        <Form.Item label="新密码">
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: '请输入密码!' }, {
                                    pattern: /^[\w]{6,12}$/, message: '密码格式6-12数字和字母组合'
                                }]
                            })(
                                <Input
                                    type="password"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="确认新密码">
                            {getFieldDecorator('passwordComfire', {
                                rules: [{ required: true, message: '请再次输入密码!' }, {
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
