import React, { Component } from 'react';
import {Modal, Form, Input, Checkbox, Upload, Icon, Button, message} from 'antd';
// import http from '../../../utils/Server';
import reqwest from 'reqwest';
const { TextArea } = Input;
const CollectionCreateForm = Form.create()(
    class extends Component {
        state = {
            fileList: [],
            uploading: false
        };
        handleCreate = () => {
            const { fileList } = this.state;
            const formData = new FormData();
            console.log(fileList)
            fileList.forEach((file) => {
                formData.append('app_file', file);
            });
            console.log(formData)
            const form = this.props.form;
            form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                console.log(values)
                formData.append('app', this.props.app);
                formData.append('version', values.version);
                formData.append('comment', values.comment);
                console.log(formData.get('app_file'))
                    
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
                      message.success('upload successfully.');
                    },
                    error: () => {
                      this.setState({
                        uploading: false
                      });
                      message.error('upload failed.');
                    }
                  });

                // http.form('/api/api/v1/applications.versions.create', formData).then(res=>{
                //     if (res.ok === false) {
                //         message.error('新版本上传失败！');
                //     } else {
                //         message.success('新版本上传成功！');
                //         console.log(res);
                //         this.setState({ visible: false });
                //     }
                // });
                form.resetFields();
            });
        };
        render () {
            console.log(this)
            const {
                visible, onCancel, form, versionLatest
            } = this.props;
            const { fileList } = this.state;
            const { getFieldDecorator } = form;
            const isChecked = (rule, value, callback) => {
                if (value !== true) {
                    callback('请您同意使用条款！')
                }
                callback();
            };
            const props = {
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
                    title="上传新版本"
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={this.handleCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label="版本">
                            {getFieldDecorator('version', { initialValue: versionLatest }, {
                                rules: [{ required: true, message: '新版本号大于旧版本号！' }]
                            })(
                                <Input type="number"
                                    min={1}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="上传文件">
                            {
                                console.log(props)
                            }
                            {getFieldDecorator('app_file', {
                                rules: [{ required: true, message: '请上传文件！' }]
                            })(
                                <Upload {...props}>
                                    <Button>
                                        <Icon type="upload" /> Select File
                                    </Button>
                                </Upload>
                            )}
                        </Form.Item>
                        <Form.Item label="更新日志">
                            {getFieldDecorator('comment', {
                                rules: [{ required: true, message: '请填写日志！' }]
                            })(
                                <TextArea rows={4} />
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('agreement', {
                                rules: [{ validator: isChecked}]
                            })(
                                <Checkbox defaultChecked={false}>我同意使用条款</Checkbox>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    });
export default CollectionCreateForm;