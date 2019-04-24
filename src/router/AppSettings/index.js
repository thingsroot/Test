import React, { Component } from 'react';
import {Form, Row, Col, Input, Button, Select, Tabs, Icon, message, Upload } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import {inject, observer} from 'mobx-react';
import {_getCookie} from '../../utils/Session';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

function callback (key) {
    console.log(key);
}

@withRouter
@inject('store')
@observer
class AppSettings extends Component {
    state = {
        expand: false,
        message: '',
        fileList: [{
            uid: '-1',
            name: 'xxx.png',
            // status: 'done',
            url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        }],
        imageUrl: '',
        previewImage: '',
        previewVisible: false
    };
    componentDidMount (){
        let app = this.props.match.params.name;
        if (app !== 'undefined') {
            console.log(app);
            this.getDetails(app);
        }
    }
    getDetails = (app)=>{
        http.get('/api/applications_details?name=' + app).then(res=>{
            console.log(res.data);
            let settingData = {
                appName: res.data.app_name,
                codeName: res.data.code_name,
                licenseType: '免费',
                description: res.data.description,
                confTemplate: res.data.conf_template,
                preConfiguration: res.data.pre_configuration
            };
            console.log(settingData);
            this.props.store.codeStore.setSettingData(settingData);
            console.log(this.props.store.codeStore.settingData);
        })
    };

    handleSubmit = (e) => {
        const { description, configuration, predefined } = this.props.store.codeStore;
        e.preventDefault();
        if (_getCookie('is_developer') === '1') {
            const { fileList } = this.state;
            const formData = new FormData();
            fileList.forEach((file) => {
                formData.append('icon_image', file);
            });
            console.log(formData);
            this.props.form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                console.log(values);
                let params = {
                    app_name: values.app_name,
                    code_name: values.code_name,
                    license_type: 'Open',
                    description: description,
                    conf_template: predefined,
                    pre_configuration: configuration
                };
                if (configuration) {
                    params['has_conf_template'] = 1
                } else {
                    params['has_conf_template'] = 0
                }

                if (this.props.match.params.type === '1') {
                    http.post('/api/applications_create', params).then(res=>{
                        if (res.ok === true) {
                            message.success('应用创建成功！')
                        } else {
                            message.error('应用创建失败！')
                        }
                    })
                } else {
                    params['name'] = this.props.match.params.name;
                    console.log(params);
                    http.post('/api/applications_update', params).then(res=>{
                        if (res.ok === true) {
                            message.success('应用已更新！')
                        } else {
                            message.error('应用更新失败！')
                        }
                    })
                }
            })
        } else {
            message.warning('抱歉，请您先申请开发者！')
        }
    };

    // beforeUpload = (file)=>{
    //     console.log(file)
    //     console.log(file.type)
    //     console.log(file.size)
    //     const isJPG = file.type === 'image/jpeg' || 'image/png';
    //     if (!isJPG) {
    //         message.error('只能上传jpg/png格式的图片!');
    //     }
    //     const isLt2M = file.size / 1024 / 1024 < 2;
    //     if (!isLt2M) {
    //         message.error('图片必须小于2MB!');
    //     }
    //     this.setState({
    //         img: file
    //     });
    //     return false;
    // };

    // getBase64 = (img, callback)=>{
    //     const reader = new FileReader();
    //     reader.addEventListener('load', () => callback(reader.result));
    //     reader.readAsDataURL(img);
    // };

    // handlePreview = (file) => {
    //     this.setState({
    //         previewImage: file.url || file.thumbUrl,
    //         previewVisible: true
    //     });
    // };

    handleChange = ({ fileList }) => this.setState({ fileList });

    // handleCancel = () => this.setState({ previewVisible: false })

    render () {
        const { getFieldDecorator } = this.props.form;
        const { settingData } = this.props.store.codeStore;
        const { fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        return (
            <div>
                <Form
                    onSubmit={this.handleSubmit}
                    className="ant-advanced-search-form"
                >
                    <Row gutter={24}>
                        <Col span={3}>
                            <Upload
                                action=""
                                listType="picture-card"
                                fileList={fileList}
                                onChange={this.handleChange}
                            >
                                {fileList.length >= 1 ? null : uploadButton}
                            </Upload>
                        </Col>
                        <Col span={21}>
                            <Col span={8}>
                                <Form.Item label="应用名称">
                                    {getFieldDecorator('app_name', { initialValue: settingData.appName }, {
                                        rules: [{ required: true, message: '不能为空！' }]
                                    })(
                                        <Input type="text"
                                            style={{width: '240px'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="应用文件">
                                    {getFieldDecorator('code_name', { initialValue: settingData.codeName }, {
                                        rules: [{ required: true, message: '不能为空！' }]
                                    })(
                                        <Input
                                            type="text"
                                            style={{width: '240px'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="授权类型">
                                    {getFieldDecorator('license_type', { initialValue: settingData.licenseType }, {
                                        rules: [{ required: true, message: '不能为空！' }]
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            <Option value="open">免费</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={18}
                            style={{ textAlign: 'right' }}
                        >
                        </Col>
                    </Row>
                </Form>
                <Tabs
                    onChange={callback}
                    type="card"
                >
                    <TabPane
                        tab="描述"
                        key="1"
                    >
                        {/*<div style={{minHeight: '400px'}}>*/}
                        <EditorDesc />
                        {/*</div>*/}
                    </TabPane>
                    <TabPane
                        tab="预定义"
                        key="2"
                    >
                        <div style={{minHeight: '400px'}}>
                            <EditorCode />
                        </div>
                    </TabPane>
                </Tabs>

                <Button
                    type="primary"
                    className="login-form-button"
                    onClick={this.handleSubmit}
                >
                    {this.props.match.params.type === '1' ? '创建' : '修改'}
                </Button>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AppSettings);
export default (WrappedAdvancedSearchForm);
