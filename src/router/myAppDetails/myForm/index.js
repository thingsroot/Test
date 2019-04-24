import React, { Component } from 'react';
import {
    Modal, Form, Input, Radio, message
} from 'antd';
import http from '../../../utils/Server';
import {_getCookie} from '../../../utils/Session';
import {inject, observer} from 'mobx-react';

const MyTemplateForm = Form.create({ name: 'template_form' })(
    @inject('store')
    @observer
    class extends Component {
        onCreate = ()=>{
            const form = this.props.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                let params = {
                    app: this.props.app,
                    conf_name: values.conf_name,
                    description: values.description,
                    type: 'Configuration',
                    public: values.public,
                    owner_type: values.owner_type,
                    owner_id: _getCookie('user_id')
                };
                http.post('/api/configurations_create', params).then(res=>{
                    if (res.ok === false) {
                        message.error('新版本上传失败！');
                    } else {
                        message.success('新版本上传成功！');
                        let list = this.props.store.codeStore.templateList;
                        list.unshift(res.data);
                        this.props.store.codeStore.setTemplateList(list)
                    }

                });

                setTimeout(()=>{
                    this.props.store.codeStore.setTemplateVisible(false);
                    form.resetFields();
                }, 500)
            });
        };

        render () {
            const {
                visible, onCancel, form
            } = this.props;
            console.log(this.props.store.codeStore.templateList)
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="新建模板"
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={this.onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label="模板名称">
                            {getFieldDecorator('conf_name', {
                                rules: [{ required: true, message: '请填写模板名称!' }]
                            })(
                                <Input type="text"/>
                            )}
                        </Form.Item>
                        <Form.Item label="描述">
                            {getFieldDecorator('description', {
                                rules: [{ required: true, message: '请填写描述信息!' }]
                            })(
                                <Input type="textarea" />
                                )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label="权限"
                        >
                            {getFieldDecorator('owner_type', {
                                initialValue: 'User'
                            })(
                                <Radio.Group>
                                    <Radio value="Cloud Company Group">公司</Radio>
                                    <Radio value="User">个人</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label="是否公开"
                        >
                            {getFieldDecorator('public', {
                                initialValue: '0'
                            })(
                                <Radio.Group>
                                    <Radio value="0">不公开</Radio>
                                    <Radio value="1">公开</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);
export default MyTemplateForm;