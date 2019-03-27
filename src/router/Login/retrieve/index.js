import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, Icon, Input, Button, message
} from 'antd';
import http from '../../../utils/Server';
class Retrieve extends PureComponent {
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log(values)
            if (!err) {
                http.post('/apis/api/method/frappe.core.doctype.user.user.reset_password?user=' + values.password).then(res=>{
                    if (res.message) {
                        if (res.message === 'not found') {
                            message.info('用户不存在')
                        }
                    }
                    if (res._server_messages){
                        var ret = JSON.parse(res._server_messages)[0];
                        if (ret !== ''){
                            ret = JSON.parse(ret);
                        }
                        if (ret.message){
                            message.info('申请重置成功，' + ret.message + '<br>' + '登录邮箱' + values.password + '完成密码重置')
                        }
                    }
                }).catch(function (error){
                    if (error){
                        message.info('提交错误')
                    }
                })
            }
        });
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <p className="title">找回密码</p>
                <Form onSubmit={this.handleSubmit}
                    className="login-form"
                >
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: '请输入邮箱!' }, {
                                pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
                                message: '邮箱格式不正确！'
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
                        <Button type="primary"
                            htmlType="submit"
                            className="login-form-button"
                            style={{width: '100%'}}
                        >
                            确定
                        </Button>
                        <Link to="/login"
                            style={{display: 'inlineBlock', width: '91%', height: '60px', float: 'left'}}
                        >返回</Link>
                        <Link to="/login/register"
                            style={{display: 'inlineBlock', width: '9%', height: '60px', float: 'right'}}
                        >注册</Link>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
export default Form.create({ name: 'normal_retrieve' })(Retrieve);