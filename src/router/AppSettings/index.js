import React, { PureComponent } from 'react';
import {Form, Row, Col, Input, Button, Select, Tabs } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import UploadImg from '../uploadImg';
import { withRouter } from 'react-router-dom';
import http from '../../utils/Server';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

function callback (key) {
    console.log(key);
}

@withRouter
class AppSettings extends PureComponent {
    state = {
        expand: false,
        message: ''
    };
    componentDidMount (){
        let app = this.props.match.params.name;
        if (app) {
            this.getDetails(app);
        } else {
            this.props.form.setFieldsValue({
                app_name: '',
                code_name: '',
                license_type: ''
            });
        }
    }
    getDetails = (app)=>{
        http.get('/api/applications_read?name=' + app).then(res=>{
            console.log(res);
            this.setState({
                message: res.data
            });
            this.props.form.setFieldsValue({
                app_name: res.data.app_name,
                code_name: res.data.code_name,
                license_type: '免费'
            })
        })
    };
    submit = (e)=>{
        e.preventDefault();
        if (this.props.match.params.type === 1) {
            //创建
        } else {
            console.log(this.props.form)
        }
    };

    render () {
        const { getFieldDecorator } = this.props.form;
        return (
            <div>
                <Form
                    onSubmit={this.submit}
                    className="ant-advanced-search-form"
                >
                    <Row gutter={24}>
                        <Col span={3}>
                            <UploadImg />
                        </Col>
                        <Col span={21}>
                            <Col span={8}>
                                <Form.Item label="应用名称">
                                    {getFieldDecorator('app_name', {
                                        rules: [{ required: true, message: '不能为空！' }]
                                    })(
                                        <Input type="text"
                                            style={{width: '240px'}}/>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="应用文件">
                                    {getFieldDecorator('code_name', {
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
                                    {getFieldDecorator('license_type', {
                                        rules: [{ required: true, message: '不能为空！' }]
                                    })(
                                        <Select
                                            defaultValue="免费"
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
                    <br/>
                    <Tabs
                        onChange={callback}
                        type="card"
                    >
                        <TabPane
                            tab="描述"
                            key="1"
                        >
                            <div style={{minHeight: '400px'}}>
                                <EditorDesc/>
                            </div>
                        </TabPane>
                        <TabPane
                            tab="预定义"
                            key="2"
                        >
                            <div style={{minHeight: '400px'}}>
                                <EditorCode/>
                            </div>
                        </TabPane>
                    </Tabs>

                    <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                    >
                        {this.props.match.params.type === 1 ? '创建' : '修改'}
                    </Button>
                </Form>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AppSettings);
export default (WrappedAdvancedSearchForm);
