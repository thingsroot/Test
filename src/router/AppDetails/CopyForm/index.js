import React, { Component } from 'react';
import {
    Modal, Form, Input, Radio, message
} from 'antd';
import http from '../../../utils/Server';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../../utils/Session';
import intl from 'react-intl-universal';

const CopyForm = Form.create({ name: 'copy_form' })(
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
            let conf_name = '';
            const form = this.props.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                let params = {
                    name: this.props.conf ? this.props.conf : 'undefined',
                    app: this.props.app,
                    conf_name: values.conf_name,
                    description: values.description,
                    type: values.type,
                    public: values.public,
                    developer: _getCookie('user_id'),
                    company: values.developer !== _getCookie('user_id') ? values.developer : null
                };
                // if (params.owner_type === 'User') {
                //     params['owner_id'] = this.props.store.session.user_id
                // } else if (params.owner_type === 'Cloud Company Group') {
                //     if (this.state.userGroups.length < 0) {
                //         return;
                //     }
                //     params['owner_id'] = this.state.userGroups[0].name
                // }
                if (this.props.type === intl.get('appdetails.copy')) {
                    http.post('/api/configurations_create', params).then(res=>{
                        let conf_info = res.data;
                        if (res.ok === false) {
                            message.error(`${intl.get('appdetails.failed_to_copy_template_information')}!`);
                        } else {
                            conf_name = res.data.name;
                            if (this.props.copyData.version !== 0) {
                                const data = this.props.csvData ? this.props.csvData.join('\n') : this.props.copyData

                                let params = {
                                    conf: conf_name,
                                    version: 1,
                                    comment: 'V1',
                                    data: data
                                };
                                http.post('/api/configurations_versions_create', params)
                                    .then(res=>{
                                        if (res.ok === true) {
                                            message.success(`${intl.get('appdetails.copy_template_content_succeeded')}!`);
                                        } else {
                                            message.error(`${intl.get('appdetails.failed_to_copy_template_content')}!`);
                                        }
                                        this.props.onSuccess(conf_info)
                                        this.props.onOK();
                                    })
                            }
                            message.success(`${intl.get('appdetails.new_version_uploaded_successfully')}!`);
                            this.props.onOK();
                        }
                    });
                } else if (this.props.type === intl.get('appdetails.edit')) {
                    params['name'] = this.props.conf;
                    http.post('/api/configurations_update', params)
                        .then(res=>{
                            if (res.ok) {
                                message.success(`${intl.get('appdetails.template_information_updated_successfully')}!`);
                                this.props.onOK();
                                this.props.onSuccess({name: this.props.conf, app: this.props.app})
                            } else {
                                message.error(`${intl.get('appdetails.failed_to_update_template_information')}!`);
                            }
                        });
                }
            });
        };

        render () {
            const {
                type, visible, onCancel, form, copyData
            } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title={type + intl.get('appdetails.template')}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    maskClosable={false}
                    onCancel={onCancel}
                    onOk={this.onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label={intl.get('appdetails.template_name')}>
                            {getFieldDecorator('conf_name', { initialValue: this.props.type === intl.get('appdetails.edit') ? copyData.conf_name : copyData.conf_name + '_copy' }, {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_fill_in_the_template_name')}!`}]
                            })(
                                <Input type="text"/>
                            )}
                        </Form.Item>
                        <Form.Item label={intl.get('common.desc')}>
                            {getFieldDecorator('description', { initialValue: this.props.type === intl.get('appdetails.edit') ? copyData.description : copyData.description + '_copy' }, {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_fill_in_the_description')}!` }]
                            })(
                                <Input type="textarea" />
                                )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label={intl.get('appdetails.jurisdiction')}
                        >
                            {getFieldDecorator('developer', { initialValue: copyData.developer }
                            )(
                                <Radio.Group>
                                    {this.state.userGroups.length > 0 ? <Radio value={_getCookie('companies')}>{intl.get('gateway.company')}</Radio> : ''}
                                    <Radio value={copyData.developer}>{intl.get('gateway.individual')}</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        <Form.Item
                            className="collection-create-form_last-form-item"
                            label={intl.get('appdetails.is_it_public')}
                        >
                            {getFieldDecorator('public', { initialValue: copyData.public === 0 ? '0' : '1' })(
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
export default CopyForm;
