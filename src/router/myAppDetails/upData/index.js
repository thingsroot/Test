import React, { Component } from 'react';
import {Modal, Form, Input, Checkbox, Upload, Icon, Button, message} from 'antd';
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import reqwest from 'reqwest';
import {inject, observer} from 'mobx-react';
const { TextArea } = Input;
const CollectionCreateForm = Form.create()(
    @inject('store')
    @observer
    @withRouter
    class extends Component {
        state = {
            fileList: [],
            uploading: false
        };
        handleCreate = () => {
            const { fileList } = this.state;
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('app_file', file);
                console.log(file)
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
                      message.success('上传成功.');
                      this.props.store.codeStore.setVersionVisible(false);
                      http.get('/api/versions_list?app=' + this.props.match.params.name).then(res=>{
                          this.props.store.codeStore.setVersionList(res.data);
                      });
                      this.props.store.codeStore.setVersionLatest(this.props.store.codeStore.versionLatest + 1);
                    },
                    error: () => {
                      this.setState({
                        uploading: false
                      });
                      message.error('上传失败.');
                    }
                  });
                form.resetFields();
            });
        };
        render () {
            console.log(this);
            const {
                visible, onCancel, form
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
                            {getFieldDecorator('version', { initialValue: this.props.store.codeStore.versionLatest + 1 }, {
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