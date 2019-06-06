import React, { Component } from 'react';
import {
    Modal, Form, Input, Radio, message
} from 'antd';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';

const CapyForm = Form.create({ name: 'copy_form' })(
    @inject('store')
    @observer
    class extends Component {
        onCreate = ()=>{
            let conf_name = '';
            const form = this.props.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                let params = {
                    name: this.props.conf,
                    app: this.props.app,
                    conf_name: values.conf_name,
                    description: values.description,
                    type: values.type,
                    public: values.public,
                    owner_type: values.owner_type
                };
                if (params.owner_type === 'User') {
                    params['owner_id'] = this.props.store.session.user_id
                } else if (params.owner_type === 'Cloud Company Group') {
                    params['owner_id'] = this.props.store.codeStore.groupName
                }
                if (this.props.type === '复制') {
                    http.post('/api/configurations_create', params).then(res=>{
                        conf_name = res.data.name;
                        if (res.ok === false) {
                            message.error('复制模板信息失败！');
                        } else {
                            let list = this.props.store.codeStore.templateList;
                            list.unshift(res.data);
                            this.props.store.codeStore.setTemplateList(list)
                            if (this.props.store.codeStore.copyData.version !== 0) {
                                let params = {
                                    name: conf_name,
                                    version: 1,
                                    comment: 'V1',
                                    data: this.props.store.codeStore.copyData.data
                                };
                                http.post('/api/configurations_versions_create', params)
                                    .then(res=>{
                                        if (res.ok === true) {
                                            message.success('复制模板内容成功！');
                                        } else {
                                            message.error('复制模板内容失败！');
                                        }
                                    })
                            }
                            message.success('新版本上传成功！');
                        }
                    });
                } else if (this.props.type === '编辑') {
                    params['name'] = this.props.conf;
                    http.post('/api/configurations_update', params)
                        .then(res=>{
                            if (res.ok) {
                                message.success('更新模板信息成功！');
                                http.get('/api/user_configuration_list?app=' + params.app)
                                    .then(res=>{
                                        this.props.store.codeStore.setTemplateList(res.message)
                                    });
                            } else {
                                message.error('更新模板信息失败！');
                            }
                        });
                }
                setTimeout(()=>{
                    this.props.store.codeStore.setCopyVisible(false);
                    form.resetFields();
                }, 500)
            });
        };

        render () {
            const {
                visible, onCancel, form
            } = this.props;
            const copyData = this.props.store.codeStore.copyData;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title={this.props.type + '模板'}
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={this.onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label="模板名称">
                            {getFieldDecorator('conf_name', { initialValue: copyData.conf_name }, {
                                rules: [{ required: true, message: '请填写模板名称!' }]
                            })(
                                <Input type="text"/>
                            )}
                        </Form.Item>
                        <Form.Item label="描述">
                            {getFieldDecorator('description', { initialValue: copyData.description }, {
                                rules: [{ required: true, message: '请填写描述信息!' }]
                            })(
                                <Input type="textarea" />
                                )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label="权限"
                        >
                            {getFieldDecorator('owner_type', { initialValue: copyData.owner_type }
                            )(
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
                            {getFieldDecorator('public', { initialValue: copyData.public === 0 ? '0' : '1' })(
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
export default CapyForm;