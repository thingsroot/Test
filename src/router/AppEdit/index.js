import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {Form, Row, Col, Input, Button, Select, Tabs, message, Checkbox, Icon, Modal, Tag } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import reqwest from 'reqwest';
import TagEdit from '../../common/TagsEdit';
import intl from 'react-intl-universal';
import './style.scss';
const Option = Select.Option;
const TabPane = Tabs.TabPane;


@withRouter
@inject('store')
@observer
class AppEdit extends Component {
    state = {
        is_new: true,
        expand: false,
        message: '',
        tag: '',
        imgSrc: '',
        previewImage: '',
        previewVisible: false,
        imageUrl: '',
        checkValue: 0,
        app: '',
        app_info: {},
        description: '',
        conf_template: '',
        pre_configuration: '',
        select_the_label: [],
        visible_tags: false,
        tags_list: [],
        categories_list: []
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
            message.error(intl.get('appedit.JSON_format_error') + ': ' + err)
            return str
        }
    }
    strimJsonStr (str) {
        try {
            if (!str === undefined || str.length === 0){
                return ''
            }
            let data = JSON.parse(str);
            return JSON.stringify(data)
        } catch (err) {
            message.error(intl.get('appedit.JSON_format_error') + ': ' + err);
            return
        }
    }

    getDetails = ()=>{
        http.get('/api/applications_categories_list').then(res=>{
            if (res.ok) {
                this.setState({
                    categories_list: res.data
                })
            }
        })
        http.get('/api/applications_details?name=' + this.state.app).then(res=>{
            if (!res.ok) {
                message.error(intl.get('appedit.failed_to_get_application_information') + ':' + res.error)
                return
            }
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
        const { app_info, description, conf_template, pre_configuration, select_the_label } = this.state;
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
                    pre_configuration: pre_configuration_str,
                    tags: select_the_label.join(','),
                    category: values.category
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
            message.warning(intl.get('appedit.Sorry_please_apply_to_be_a_developer_first'))
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
        if (e.target.value === '0') {
            e.target.value = 1
        } else {
            e.target.value = 0
        }
    };
    saveTags = () => {
        const {select_the_label} = this.state;
        const data = {
            name: this.props.match.params.name,
            tags: select_the_label.join(',')
        }
        http.post('/api/applications_tags_update', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('appedit.Changed_TAB_successfully'))
                this.getDetails();
                this.setVisibleTags()
            }
        })
    }
    filterGateway = (e) => {
        const value = e.target.value.toLowerCase();
        const data = this.state.filterDataSource.filter(item=> item.description.toLowerCase().indexOf(value) !== -1 || item.dev_name.toLowerCase().indexOf(value) !== -1 || item.name.indexOf(value) !== -1)
        this.setState({
            dataSource: data
        })
    }
    getTags = () => {
        http.get('/api/store_tags_list').then(res=>{
            if (res.ok) {
                const tags_list = this.state.app_info.tags.length > 0 ? this.state.app_info.tags.split(',') : [];
                const select_the_label = this.state.select_the_label.concat(tags_list)
                if (res.data.length > 0) {
                    res.data.map(item=>{
                        tags_list.push(item[0])
                    })
                }
                this.setState({
                    tags_list,
                    select_the_label
                })
            }
        })
        this.setState({visible_tags: true})
    }
    setVisibleTags = () => {
        this.setState({
            visible_tags: false
        })
    }
    addTag = (item) =>{
        const {select_the_label} = this.state;
        if (select_the_label.indexOf(item) === -1) {
            if (select_the_label.length < 20) {
                select_the_label.push(item)
                this.setState({
                    select_the_label
                })
            } else {
                message.error(intl.get('appedit.The_quantity_is_full'))
            }
        } else {
            message.error(intl.get('appedit.Do_not_add_the_same_label_repeatedly'))
        }
    }
    addCustomTag = () => {
        if (this.state.tag !== ''){
            const {select_the_label} = this.state;
            if (select_the_label.indexOf(this.state.tag) === -1) {
                if (select_the_label.length < 20) {
                    if (this.state.tag.length < 8) {
                        select_the_label.push(this.state.tag)
                        this.setState({
                            select_the_label,
                            tag: ''
                        })
                    } else {
                        message.error(intl.get('appedit.Maximum_length_of_characters_is_eight'))
                    }
                } else {
                    message.error(intl.get('appedit.The_quantity_is_full'))
                }
            } else {
                message.error(intl.get('appedit.Do_not_add_the_same_label_repeatedly'))
            }
        } else {
            message.error(intl.get('appedit.Please_enter_label_content'))
        }
    }
    deleteTag = (item)=>{
        const {select_the_label} = this.state;
        const ind = select_the_label.indexOf(item)
        select_the_label.splice(ind, 1)
        this.setState({
            select_the_label
        })
    }
    render () {
        const { getFieldDecorator } = this.props.form;
        const { app_info, description, conf_template, pre_configuration, select_the_label, visible_tags, tags_list, categories_list } = this.state;
        return (
            <div className="appedit_wrap">
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
                                        title={intl.get('appedit.Im_gonna_go_ahead_and_hit_toggle')}
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
                            <Col span={9}>
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
                            <Col span={9}>
                                <Form.Item label={intl.get('gateway.app_ID')}>
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
                            <Col span={9}>
                                <Form.Item label={intl.get('developer.application_of_classification')}>
                                    {getFieldDecorator('category', {
                                        rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }],
                                        initialValue: app_info.category !== null ? app_info.category : '默认分类'
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            {
                                                categories_list && categories_list.length > 0 && categories_list.map((item, key)=>{
                                                    return (
                                                        <Option
                                                            value={item.name}
                                                            key={key}
                                                        >{item.name}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={9}>
                                <Form.Item label={intl.get('appedit.authorization_type')}>
                                    {getFieldDecorator('license_type', {
                                        rules: [{ required: true, message: intl.get('appedit.cannot_be_empty') }],
                                        initialValue: app_info.license_type !== undefined ? app_info.license_type : 'Open'
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            <Option value="Open">{intl.get('appedit.freeappedit.free')}</Option>
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
                            <Col span={24}>
                                <div>
                                    <div className="app_details_tags_wrap">
                                        <span>{intl.get('appitems.label')}:</span>&nbsp;&nbsp;
                                        <TagEdit tags_list={app_info.tags}/>
                                        {
                                            this.props.location.pathname.toLowerCase().indexOf('appnew') === -1
                                            ? <span
                                                type="link"
                                                className="app_details_tags_set"
                                                onClick={this.getTags}
                                              >{intl.get('appedit.modify')}</span>
                                            : ''
                                        }
                                    </div>
                                </div>
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
                    {this.state.is_new ? intl.get('accesskeys.create') : intl.get('accesskeys.appedit.modify')}
                </Button>
                <span style={{padding: '0 5px'}}> </span>
                <Button
                    onClick={()=>{
                        this.props.history.go(-1)
                    }}
                >
                    {intl.get('common.cancel')}
                </Button>
                <Modal
                    title={<span><Icon type="info-circle" /> {intl.get('appedit.Edit_the_label')}</span>}
                    visible={visible_tags}
                    onOk={this.saveTags}
                    // confirmLoading={confirmLoading}
                    onCancel={()=>{
                        this.setState({
                            select_the_label: []
                        }, ()=>{
                            this.setVisibleTags()
                        })
                    }}
                    cancelText={intl.get('appedit.cancel_all')}
                    okText={intl.get('common.sure')}
                >
                    <div>
                        <div className="Select_the_label">
                            {
                                select_the_label.length > 0 && select_the_label.map((item, key) => {
                                    return (
                                        <Tag
                                            key={key}
                                            closable
                                            onClose={()=>{
                                                this.deleteTag(item)
                                            }}
                                        >{item}</Tag>
                                    )
                                })
                            }
                        </div>
                        <div>
                            {intl.get('appedit.max_number_20')}
                        </div>
                        <div>
                        <Tabs defaultActiveKey="1">
                            <TabPane
                                tab={intl.get('appedit.For_the_label')}
                                key="1"
                            >
                            {
                                tags_list.length > 0 && tags_list.map((item, key) => {
                                    return (
                                        <Tag
                                            key={key}
                                            onClick={()=>{
                                                this.addTag(item)
                                            }}
                                        >{item}</Tag>
                                    )
                                })
                            }
                            </TabPane>
                            <TabPane
                                tab={intl.get('appedit.The_new_label')}
                                key="2"
                            >
                                <div className="add_tags">
                                    {intl.get('appedit.The_new_label')}：
                                    <Input
                                        value={this.state.tag}
                                        placeholder={intl.get('appedit.Please_enter_a_custom_label')}
                                        onChange={(e)=>{
                                            this.setState({tag: e.target.value})
                                        }}
                                    />
                                    <Button
                                        onClick={this.addCustomTag}
                                    >{intl.get('appsinstall_add')}</Button>
                                </div>
                            </TabPane>
                        </Tabs>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}

const WrappedAdvancedSearchForm = Form.create()(AppEdit);
export default (WrappedAdvancedSearchForm);