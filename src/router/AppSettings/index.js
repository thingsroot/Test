import React, { Component } from 'react';
import {Form, Row, Col, Input, Button, Select, Tabs, message, Checkbox, Icon } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import reqwest from 'reqwest';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

function callback (key) {
    console.log(key);
}

@withRouter
class AppSettings extends Component {
    state = {
        expand: false,
        message: '',
        imgSrc: '',
        previewImage: '',
        previewVisible: false,
        imageUrl: '',
        checkValue: 0,
        app: '',
        app_info: {},
        description: '',
        conf_template: '',
        pre_configuration: ''
    };
    componentDidMount (){
        this.setState({
            app: this.props.match.params.app,
            imgSrc: 'http://cloud.thingsroot.com/assets/app_center/img/logo.png'
        }, () => {
            this.getDetails(this.state.app);
        })
    }

    getDetails = ()=>{
        http.get('/api/applications_read?name=' + this.state.app).then(res=>{
            if (!res.ok) {
                message.error('获取应用信息失败:' + res.error)
                return
            }
            this.setState({
                app_info: res.data,
                description: res.data.description,
                conf_template: res.data.conf_template,
                pre_configuration: res.data.pre_configuration,
                imgSrc: 'http://cloud.thingsroot.com' + res.data.icon_image
            })
        })
    };
    handleSubmit = (e) => {
        const { app_info, description, conf_template, pre_configuration } = this.state;
        app_info;
        e.preventDefault();
        if (this.props.store.session.is_developer === '1') {
            this.props.form.validateFields((err, values) => {
                if (err) {
                    return;
                }
                let params = {
                    app_name: values.app_name,
                    code_name: values.code_name,
                    published: values.published === true ? 1 : 0,
                    license_type: 'Open',
                    description: description,
                    conf_template: conf_template,
                    pre_configuration: pre_configuration
                };
                if (conf_template && conf_template !== '') {
                    params['has_conf_template'] = 1
                } else {
                    params['has_conf_template'] = 0
                }
                if (this.props.match.params.action === 'new') {
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
                            setTimeout(()=>{
                                window.location.href = '/myapps'
                            }, 1500)
                        } else {
                            message.error('应用创建失败！')
                        }
                    })
                } else {
                    params['name'] = this.props.match.params.app;
                    http.post('/api/applications_update', params)
                        .then(res=>{
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
                                        console.log(res)
                                        message.success('应用已更新！');
                                        setTimeout(()=>{
                                            this.props.history.go(-1)
                                        }, 1500)
                                    },
                                    error: (args)=>{
                                        console.log(args)
                                    }
                                });
                            } else {
                                if (JSON.parse(JSON.parse(res._server_messages)[0]).message ===
                                    'App Path must be unique') {
                                    message.error('应用ID已存在！')
                                } else {
                                    message.error('应用更新失败！')
                                }
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

    checkChange = (e)=>{
        console.log(e.target.value);
        if (e.target.value === '0') {
            e.target.value = 1
        } else {
            e.target.value = 0
        }
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        const { app_info} = this.state;
        return (
            <div>
                <Icon
                    className="rollback"
                    style={{top: 85, right: 40}}
                    type="rollback"
                    onClick={()=>{
                        this.props.history.go(-1)
                    }}
                />
                <br/>
                <Form
                    onSubmit={this.handleSubmit}
                    className="ant-advanced-search-form"
                >
                    <Row gutter={24}>
                        <Col span={3}>
                            <div style={{height: '130px'}}>
                                <label htmlFor="icon_file">
                                    <img
                                        alt=""
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
                            <Col span={7}>
                                <Form.Item label="应用名称">
                                    {getFieldDecorator('app_name', {
                                        rules: [{ required: true, message: '不能为空！' }],
                                        initialValue: app_info.app_name ? app_info.app_name : ''
                                    })(
                                        <Input type="text"
                                            style={{width: '240px'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item label="应用ID">
                                    {getFieldDecorator('code_name', {
                                        rules: [{ required: true, message: '不能为空！' }, {
                                            pattern: /^[0-9a-zA-Z_]{1,}$/,
                                            message: '应用ID须包含字母，数字或特殊字符！'
                                        }],
                                        initialValue: app_info.code_name ? app_info.code_name : ''
                                    })(
                                        <Input
                                            type="text"
                                            style={{width: '240px'}}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={7}>
                                <Form.Item label="授权类型">
                                    {getFieldDecorator('license_type', {
                                        rules: [{ required: true, message: '不能为空！' }],
                                        initialValue: app_info.licenseType !== undefined ? app_info.licenseType : ''
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            <Option value="open">免费</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item label="发布到应用市场">
                                    {getFieldDecorator('published', {
                                        valuePropName: 'checked',
                                        initialValue: app_info.published === 1 ?  true : false
                                    })(
                                        <Checkbox
                                            onChange={this.checkChange}
                                        >
                                        </Checkbox>
                                    )}
                                </Form.Item>
                            </Col>
                        </Col>
                    </Row>
                </Form>
                    <Row>
                        <Col span={18}
                            style={{ textAlign: 'right' }}
                        >
                        </Col>
                    </Row>

                <Tabs
                    onChange={callback}
                    type="card"
                >
                    <TabPane
                        tab="描述"
                        key="desc"
                    >
                        <EditorDesc />
                    </TabPane>
                    <TabPane
                        tab="默认安装配置"
                        key="conf"
                    >
                        <div style={{minHeight: '400px'}}>
                            <EditorCode />
                        </div>
                    </TabPane>
                </Tabs>

                <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    onClick={this.handleSubmit}
                >
                    {this.props.match.params.type === 'new' ? '创建' : '修改'}
                </Button>
                <Button
                    onClick={()=>{
                        this.props.history.go(-1)
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