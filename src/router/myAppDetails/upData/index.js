import React, { PureComponent } from 'react';
import { Modal, Form, Input, Checkbox, Upload, Icon, Button } from 'antd';
const { TextArea } = Input;
// eslint-disable-next-line
const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
    // eslint-disable-next-line
    class extends PureComponent {
        render () {
            const {
                visible, onCancel, onCreate, form
            } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="上传新版本"
                    okText="确定"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <Form.Item label="版本">
                            {getFieldDecorator('version', {
                                rules: [{ required: true, message: '新版本号大于旧版本号！' }]
                            })(
                                <Input type="number"
                                    min={1}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="上传文件">
                            {getFieldDecorator('upFile', {
                                rules: [{ required: true, message: '请上传文件！' }]
                            })(
                                <Upload>
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
                                rules: [{ required: true, message: '请同意使用条款！' }]
                            })(
                                <Checkbox>我同意使用条款</Checkbox>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);
export default CollectionCreateForm;