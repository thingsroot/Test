import React, { Component } from 'react';
import {
    Modal, Form, Input, Radio, message
} from 'antd';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../../utils/Session';
import intl from 'react-intl-universal';

const TemplateForm = Form.create({ name: 'template_form' })(
    @inject('store')
    @observer
    class extends Component {
        state = {
            userGroups: []
        }
        componentDidMount () {
            if (!this.props.store.session.companies) {
                return
            }
            http.get('/api/user_groups_list').then(res=>{
                if (res.ok) {
                    this.setState({ userGroups: res.data})
                } else {
                    message.error(intl.get('appdetails.failed_to_get_user_group'))
                }
            });
        }
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
                    type: 'Template',
                    public: values.public,
                    developer: _getCookie('user_id'),
                    company: values.developer !== _getCookie('user_id') ? values.developer : null
                };
                // if (params.owner_type === 'User') {
                //     params['owner_id'] = this.props.store.session.user_id
                // } else {
                //     if (this.state.userGroups.length < 0) {
                //         return;
                //     }
                //     params['owner_id'] = this.state.userGroups[0].name
                // }
                http.post('/api/configurations_create', params).then(res=>{
                    if (res.ok === false) {
                        message.error(`${intl.get('appdetails.failed_to_create_app_template')}!`);
                    } else {
                        message.success(`${intl.get('appdetails.application_template_created_successfully')}!`);
                        this.props.onSuccess(res.data)
                    }
                });

                setTimeout(()=>{
                    this.props.onOK();
                    form.resetFields();
                }, 500)
            });
        };

        render () {
            const { visible, onCancel, form, onSuccess } = this.props;
            onSuccess;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title={intl.get('appdetails.new_template')}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    maskClosable={false}
                    onCancel={onCancel}
                    onOk={this.onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label={intl.get('appdetails.template_name')}>
                            {getFieldDecorator('conf_name', {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_fill_in_the_template_name')}!` }]
                            })(
                                <Input type="text"/>
                            )}
                        </Form.Item>
                        <Form.Item label={intl.get('common.desc')}>
                            {getFieldDecorator('description', {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_fill_in_the_description')}!` }]
                            })(
                                <Input type="textarea" />
                                )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label={intl.get('appdetails.jurisdiction')}
                        >
                            {getFieldDecorator('developer', {
                                initialValue: _getCookie('user_id')
                            })(
                                <Radio.Group>
                                    {this.state.userGroups.length > 0 ? <Radio value={_getCookie('companies')}>{intl.get('gateway.company')}</Radio> : ''}
                                    <Radio value={_getCookie('user_id')}>{intl.get('gateway.individual')}</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label={intl.get('appdetails.is_it_public')}
                        >
                            {getFieldDecorator('public', {
                                initialValue: '0'
                            })(
                                <Radio.Group>
                                    <Radio value="0">{intl.get('appdetails.not_public')}</Radio>
                                    <Radio value="1">{intl.get('appdetails.public')}</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);
export default TemplateForm;