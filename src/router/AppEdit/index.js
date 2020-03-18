import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {Form, Row, Col, Input, Button, Select, Tabs, message, Checkbox, Icon, Modal, Tag } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';
import {_getCookie} from '../../utils/Session';
import reqwest from 'reqwest';

import TagEdit from '../../common/TagsEdit';
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
                this.getDetails();
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
            message.error('JSON格式有错误: ' + err)
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
            message.error('JSON格式有错误: ' + err);
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
        if (!this.state.app) {
            return false;
        }
        http.get('/api/applications_details?name=' + this.state.app).then(res=>{
            if (!res.ok) {
                message.error('获取应用信息失败:' + res.error)
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
                            const token = _getCookie('csrf_auth_token') || '';
                            formData.append('name', res.data.name);
                            formData.append('file', this.state.imageUrl);
                            reqwest({
                                url: '/api/applications_icon',
                                method: 'post',
                                headers: {
                                    'X-Frappe-CSRF-Token': token
                                },
                                processData: false,
                                data: formData,
                                success: (res) => {
                                    if (res.ok) {
                                        message.success('应用创建成功！');
                                    } else {
                                        message.error('应用创建失败！')
                                    }
                                }
                            });
                            setTimeout(()=>{
                                window.location.href = '/developer'
                            }, 1500)
                        } else {
                            message.error('应用创建失败！')
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
                message.success('更改标签成功！')
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
                message.error('数量已满！')
            }
        } else {
            message.error('请勿重复添加同一标签！')
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
                        message.error('字符最大长度为八位！')
                    }
                } else {
                    message.error('数量已满！')
                }
            } else {
                message.error('请勿重复添加同一标签！')
            }
        } else {
            message.error('请输入标签内容！')
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
                            <Col span={9}>
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
                            <Col span={9}>
                                <Form.Item label="应用ID">
                                    {getFieldDecorator('code_name', {
                                        rules: [{ required: true, message: '不能为空！' }, {
                                            pattern: /^[^\u4e00-\u9fa5]+$/,
                                            message: '应用ID不含中文！'
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
                                <Form.Item label="应用分类">
                                    {getFieldDecorator('category', {
                                        rules: [{ required: true, message: '不能为空！' }],
                                        initialValue: app_info.category ? app_info.category : '默认分类'
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
                                <Form.Item label="授权类型">
                                    {getFieldDecorator('license_type', {
                                        rules: [{ required: true, message: '不能为空！' }],
                                        initialValue: app_info.license_type !== undefined ? app_info.license_type : 'Open'
                                    })(
                                        <Select
                                            style={{ width: 240 }}
                                        >
                                            <Option value="Open">免费</Option>
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
                            <Col span={24}>
                                <div>
                                    <div className="app_details_tags_wrap">
                                        <span>标签:</span>&nbsp;&nbsp;
                                        <TagEdit tags_list={app_info.tags}/>
                                        {
                                            this.props.location.pathname.toLowerCase().indexOf('appnew') === -1
                                            ? <span
                                                type="link"
                                                className="app_details_tags_set"
                                                onClick={this.getTags}
                                              >修改</span>
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
                        tab="描述"
                        key="desc"
                    >
                        <EditorDesc value={description}
                            onChange={this.onDescriptionChange}
                        />
                    </TabPane>
                    <TabPane
                        tab="默认安装配置"
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
                    {this.state.is_new ? '创建' : '修改'}
                </Button>
                <span style={{padding: '0 5px'}}> </span>
                <Button
                    onClick={()=>{
                        this.props.history.go(-1)
                    }}
                >
                    取消
                </Button>
                <Modal
                    title={<span><Icon type="info-circle" /> 编辑标签</span>}
                    visible={visible_tags}
                    onOk={this.saveTags}
                    onCancel={()=>{
                        this.setState({
                            select_the_label: []
                        }, ()=>{
                            this.setVisibleTags()
                        })
                    }}
                    cancelText="取消所有"
                    okText="确定"
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
                            注：每个资源最多绑定20个标签，单次操作绑定/解绑标签的数量分别不能超过20个
                        </div>
                        <div>
                        <Tabs defaultActiveKey="1">
                            <TabPane
                                tab="已有标签"
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
                                tab="新建标签"
                                key="2"
                            >
                                <div className="add_tags">
                                    新建标签：
                                    <Input
                                        value={this.state.tag}
                                        placeholder="请输入自定义标签"
                                        onChange={(e)=>{
                                            this.setState({tag: e.target.value})
                                        }}
                                    />
                                    <Button
                                        onClick={this.addCustomTag}
                                    >添加</Button>
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