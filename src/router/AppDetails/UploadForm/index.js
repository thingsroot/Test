import React, { Component } from 'react';
import {Modal, Form, Input, Checkbox, Upload, Icon, Button, message} from 'antd';
import { withRouter } from 'react-router-dom';
import reqwest from 'reqwest';
import intl from 'react-intl-universal';

const { TextArea } = Input;

const CollectionCreateForm = Form.create()(
    @withRouter
    class extends Component {
        state = {
            fileList: [],
            uploading: false,
            initialVersion: this.props.initialValue + 1
        };
        handleCreate = () => {
            const { fileList } = this.state;
            const formData = new FormData();
            if (fileList.length > 1) {
                message.error(intl.get('appdetails.cannot_upload_multiple_files'))
                return
            }
            if (fileList.length === 0) {
                message.error(intl.get('appdetails.Please select the file to upload'))
                return
            }
            fileList.forEach((file) => {
                formData.append('app_file', file);
            });
            const form = this.props.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                formData.append('app', this.props.app);
                formData.append('version', values.version);
                formData.append('comment', values.comment);
                reqwest({
                    url: '/api/applications_versions_create',
                    method: 'post',
                    processData: false,
                    data: formData,
                    success: () => {
                        this.setState({
                            fileList: [],
                            uploading: false
                        });
                        message.success(`${intl.get('appdetails.uploaded_successfully')}.`);
                        this.setState({
                            initialVersion: values.version + 1
                        })
                        this.props.onSuccess()
                    },
                    error: () => {
                      this.setState({
                            uploading: false
                      });
                      message.error(`${intl.get('appdetails.upload_failure')}.`);
                    }
                  });
                form.resetFields();
            });
        };

        checkChange = (e)=>{
            e;
        };

        render () {
            const { visible, onCancel, form, initialVersion } = this.props;
            initialVersion;
            const { fileList } = this.state;
            const { getFieldDecorator } = form;
            const isChecked = (rule, value, callback) => {
                if (value !== true) {
                    callback(`${intl.get('appdetails.please_agree_to_the_terms_of_use')}!`)
                }
                callback();
            };
            const props = {
                multiple: false,
                action: '/api/api/v1/applications.versions.create',
                onRemove: (file) => {
                    this.setState((state) => {
                        const index = state.fileList.indexOf(file);
                        const newFileList = state.fileList.slice();
                        newFileList.splice(index, 1);
                        return {
                            fileList: newFileList
                        };
                    });
                },
                beforeUpload: (file) => {
                    this.setState(state => ({
                        fileList: [...state.fileList, file]
                    }));
                    return false;
                },
                fileList
            };
            return (
                <Modal
                    visible={visible}
                    title={intl.get('appdetails.upload_new_version')}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                    maskClosable={false}
                    onCancel={onCancel}
                    onOk={this.handleCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label={intl.get('appdetails.version')}>
                            {getFieldDecorator('version', { initialValue: this.state.initialVersion }, {
                                rules: [{ required: true, message: `${intl.get('appdetails.new_version_number_is_greater_than_old_version_number')}!` }]
                            })(
                                <Input type="number"
                                    min={1}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label={intl.get('appdetails.upload_the_file')}>
                            {getFieldDecorator('app_file', {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_upload_the_file')}!` }]
                            })(
                                <Upload {...props}>
                                    <Button>
                                        <Icon type="upload" /> Select File
                                    </Button>
                                </Upload>
                            )}
                        </Form.Item>
                        <Form.Item label="">
                            {getFieldDecorator('comment', {
                                rules: [{ required: true, message: `${intl.get('appdetails.please_fill_in_the_log')}!` }]
                            })(
                                <TextArea rows={4} />
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('agreement', {
                                valuePropName: 'checked',
                                rules: [{ validator: isChecked}]
                            })(
                                <Checkbox
                                    wrappedComponentRef={(btn) => this.form = btn}
                                    onChange={this.checkChange}
                                >{intl.get('appdetails.I_agree_to_the_terms_of_use')}</Checkbox>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    });
export default CollectionCreateForm;