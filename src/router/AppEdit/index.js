import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {Form, Row, Col, Input, Button, Select, Tabs, message, Checkbox, Icon } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import reqwest from 'reqwest';
import intl from 'react-intl-universal';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

function callback (key) {
    console.log(key);
}

@withRouter
@inject('store')
@observer
class AppEdit extends Component {
    state = {
        is_new: true,
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
        const app = this.props.match.params.name && this.props.match.params.name.indexOf('*') !== -1 ? this.props.match.params.name.replace(/\*/g, '/') : this.props.match.params.name
        this.setState({
            is_new: this.props.match.params.name !== undefined ? false : true,
            app,
            imgSrc: '/assets/app_center/img/logo.png'
        }, () => {
            if (!this.state.is_new) {
                this.getDetails();
            }
        })
    }
    prettyJson (str) {
        try {
            if (str === null || str === undefined || str.length === 0){
                return ''
            }
            let data = JSON.parse(str)
            return JSON.stringify(data, null, 4)
        } catch (err) {
            message.error(`${intl.get('appedit.JSON_format_error')}: ` + err)
            return str
        }
    }
    strimJsonStr (str) {
        try {
            if (str === undefined || str.length === 0){
                return ''
            }
            let data = JSON.parse(str);
            return JSON.stringify(data)
        } catch (err) {
            message.error(`${intl.get('appedit.JSON_format_error')}: ` + err);
            return
        }
    }

    getDetails = ()=>{
        http.get('/api/applications_details?name=' + this.state.app).then(res=>{
            if (!res.ok) {
                message.error(`${intl.get('appedit.failed_to_get_application_information')}: ` + res.error)
                return
            }
            console.log(res.data.conf_template)
            this.setState({
                app_info: res.data,
                description: res.data.description,
                conf_template: this.prettyJson(res.data.conf_template),
                pre_configuration: this.prettyJson(res.data.pre_configuration),
                imgSrc: '/store_assets' + res.data.icon_image
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
                let conf_template_str = this.strimJsonStr(conf_template)
                if (conf_template_str === undefined) {
                    return;
                }
                let pre_configuration_str = this.strimJsonStr(pre_configuration)
                if (pre_configuration_str === undefined) {
                    return;
                }

                let params = {
                    app_name: values.app_name,
                    code_name: values.code_name,
                    published: values.published === true ? 1 : 0,
                    license_type: 'Open',
                    description: description,
                    conf_template: conf_template_str,
                    pre_configuration: pre_configuration_str
                };
                if (conf_template && conf_template !== '') {
                    params['has_conf_template'] = 1
                } else {
                    params['has_conf_template'] = 0
                }
                if (params.conf_template === 'error') {
                    return
                }
                if (this.state.is_new) {
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
                                    message.success(intl.get('appedit.application_created_successfully'));
                                }
                            });
                            setTimeout(()=>{
                                window.location.href = '/developer'
                            }, 1500)
                        } else {
                            message.error(intl.get('appedit.application_creation_failed'))
                        }
                    })
                } else {
                    params['name'] = this.state.app;
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
                                        message.success(intl.get('appedit.app_updated'));
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
                                    message.error(intl.get('appedit.app_ID_already_exists'))
                                } else {
                                    message.error(intl.get('appedit.application_update_failed'))
                                }
                            }
                        })
                }
            })
        } else {
            message.warning(intl.get('appedit.sorry'))
        }
    };

    iconChange = (e)=>{
        let tmppath = URL.createObjectURL(e.target.files[0]);
        this.setState({
            imageUrl: e.target.files[0],
            imgSrc: tmppath
        })
    };
    onDescriptionChange = (description) => {
        this.setState({
            description: description
        })
    }
    onConfTemplateChange = (conf_template, pre_configuration) => {
        this.setState({
            pre_configuration: pre_configuration,
            conf_template: conf_template
        })
    }

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
        const { app_info, description, conf_template, pre_configuration } = this.state;
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
                                        title={intl.get('appedit.click_to_switch_pictures')}
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
                                <Form.Item label={intl.get('appedit.apply_name')}>
                                    {getFieldDecorator('app_name', {
                                        rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }],
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
                                        rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }, {
                                            pattern: /^[^\u4e00-\u9fa5]+$/,
                                            message: intl.get('appedit.app_ID_does_not_contain_Chinese')
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
                                <Form.Item label={intl.get('appedit.authorization_type')}>
                                    {getFieldDecorator('license_type', {
                                        rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }],
                                        initialValue: app_info.license_type !== undefined ? app_info.license_type : 'Open'
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            <Option value="Open">{intl.get('appedit.free')}</Option>
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item label={intl.get('appedit.publish_to_app_Market')}>
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
                        tab={intl.get('common.desc')}
                        key="desc"
                    >
                        <EditorDesc value={description}
                            onChange={this.onDescriptionChange}
                        />
                    </TabPane>
                    <TabPane
                        tab={intl.get('appedit.default_installation_configuration')}
                        key="conf"
                    >
                        <div style={{minHeight: '400px'}}>
                            <EditorCode
                                pre_configuration={pre_configuration}
                                conf_template={conf_template}
                                onChange={this.onConfTemplateChange}
                            />
                        </div>
                    </TabPane>
                </Tabs>
                <br/>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    onClick={this.handleSubmit}
                >
                    {this.state.is_new ? intl.get('accesskeys.create') : intl.get('appedit.modify')}
                </Button>
                <span style={{padding: '0 5px'}}> </span>
                <Button
                    onClick={()=>{
                        this.props.history.go(-1)
                    }}
                >
                    {intl.get('common.cancel')}
                </Button>
            </div>
        )
    }
}

const WrappedAdvancedSearchForm = Form.create()(AppEdit);
export default (WrappedAdvancedSearchForm);