import React, { Component } from 'react';
import {Form, Row, Col, Input, Button, Select, Tabs, message } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import {inject, observer} from 'mobx-react';
import {_getCookie} from '../../utils/Session';
import reqwest from 'reqwest';

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
        imgSrc: '',
        previewImage: '',
        previewVisible: false,
        imageUrl: ''
    };
    componentDidMount (){
        let app = this.props.match.params.name;
        if (app) {
            this.getDetails(app);
        }
    }

    getDetails = (app)=>{
        http.get('/api/applications_details?name=' + app).then(res=>{
            let settingData = {
                appName: res.data.app_name,
                codeName: res.data.code_name,
                licenseType: '免费',
                description: res.data.description,
                confTemplate: res.data.pre_configuration,
                preConfiguration: res.data.conf_template
            };
            this.props.store.codeStore.setDescription(res.data.description)
            this.props.store.codeStore.setSettingData(settingData);
            this.setState({
                imgSrc: 'http://cloud.thingsroot.com' + res.data.icon_image
            })
        })
    };

    handleSubmit = (e) => {
        const { description, configuration, predefined } = this.props.store.codeStore;
        e.preventDefault();
        if (_getCookie('is_developer') === '1') {
            this.props.form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                let params = {
                    app_name: values.app_name,
                    code_name: values.code_name,
                    license_type: 'Open',
                    description: description,
                    conf_template: configuration,
                    pre_configuration: predefined
                };
                if (configuration) {
                    params['has_conf_template'] = 1
                } else {
                    params['has_conf_template'] = 0
                }
                if (this.props.match.params.type === '1') {
                    http.post('/api/applications_create', params).then(res=>{
                        if (res.ok === true) {
                            let formData = new FormData();
                            formData.append('name', res.data.name);
                            formData.append('file', this.state.imageUrl);
                            reqwest({
                                url: '/api/applications_icon',
                                method: 'post',
                                processData: false,
                                data: formData,
                                success: (res) => {
                                    res;
                                    message.success('应用创建成功！');
                                }
                            });
                            window.location.href = '/myApps'
                        } else {
                            message.error('应用创建失败！')
                        }
                    })
                } else {
                    params['name'] = this.props.match.params.name;
                    http.post('/api/applications_update', params).then(res=>{
                        if (res.ok === true) {
                            let formData = new FormData();
                            formData.append('name', params.name);
                            formData.append('file', this.state.imageUrl);
                            reqwest({
                                url: '/api/applications_icon',
                                method: 'post',
                                processData: false,
                                data: formData,
                                success: (res) => {
                                    res;
                                    message.success('应用已更新！');
                                    window.location.href = '/myApps'
                                }
                            });
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

    iconChange = (e)=>{
        let tmppath = URL.createObjectURL(e.target.files[0]);
        this.setState({
            imageUrl: e.target.files[0],
            imgSrc: tmppath
        })
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        const { settingData } = this.props.store.codeStore;
        return (
            <div>
                <Form
                    onSubmit={this.handleSubmit}
                    className="ant-advanced-search-form"
                >
                    <Row gutter={24}>
                        <Col span={3}>
                            <div style={{height: '130px'}}>
                                <label htmlFor="icon_file">
                                    <img
                                        ref="img"
                                        src={this.state.imgSrc}
                                        title="点击切换图片"
                                        id="icon_img1"
                                        style={{width: '100px', height: '100px'}}
                                    />
                                    <Input
                                        type="file"
                                        id="icon_file"
                                        style={{display: 'none'}}
                                        onChange={this.iconChange}
                                    />
                                </label>
                            </div>
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
                        tab="默认安装配置"
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
                <Button
                    onClick={()=>{
                        window.location.href = '/myApps'
                    }}
                >
                    取消
                </Button>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AppSettings);
export default (WrappedAdvancedSearchForm);
