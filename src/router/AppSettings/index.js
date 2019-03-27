import React, { PureComponent } from 'react';
import {Form, Row, Col, Input, Button, Select, Tabs } from 'antd';
import EditorCode from './editorCode';
import EditorDesc from './editorDesc';
import UploadImg from '../uploadImg';

const Option = Select.Option;
const TabPane = Tabs.TabPane;

function callback (key) {
    console.log(key);
}
function handleChange (value) {
    console.log(value); // { key: "lucy", label: "Lucy (101)" }
}
class AppSettings extends PureComponent {
    state = {
        expand: false
    };
    componentDidMount (){

    }
    componentWillUnmount (){
        clearInterval(window.set)
    }
    getFields () {
        let list = [{
            name: '应用名称',
            type: 'input'
        }, {
            name: '授权类型',
            type: 'select',
            children: ['免费']
        }, {
            name: '应用厂商',
            type: 'select',
            children: ['罗克菲尔', '西门子', '中达电通', '旋思科技', '冬笋科技', 'Other', '华为', '三菱电机']
        }, {
            name: '设备型号',
            type: 'input'
        }, {
            name: '协议',
            type: 'select',
            children: ['SIEMENS-S7COMM', 'Redis', 'Mitsubishi_FX', 'OMRON-FINS', 'Private', 'UNKNOWN', 'DLT645-2007', 'DLT645-1997']
        }, {
            name: '类别',
            type: 'select',
            children: ['General', 'Meter', 'UPS', 'PLC', 'Other', 'SYS']
        }];
        window.list = list;
        const count = this.state.expand ? 10 : 6;
        const { getFieldDecorator } = this.props.form;
        const children = [];
        list.map((item, key)=>{
            if (item.type === 'input'){
                children.push(
                    <Col span={8}
                        key={key}
                        style={{ display: key < count ? 'block' : 'none' }}
                    >
                        <Form.Item label={`${item.name}`}>
                            {getFieldDecorator(`field-${key}`, {
                                rules: [{
                                    required: true,
                                    message: 'Input something!'
                                }]
                            })(
                                <Input
                                    style={{width: '180px'}}
                                    placeholder={`请输入${item.name}`}
                                />
                            )}
                        </Form.Item>
                    </Col>
                );
            } else {
                children.push(
                    <Col span={8}
                        key={key}
                        style={{ display: key < count ? 'block' : 'none' }}
                    >
                        <Form.Item label={`${item.name}`}>
                            {(
                                <Select
                                    //labelInValue
                                    defaultValue={item.children[0]}
                                    style={{ width: 240 }}
                                    onChange={handleChange}
                                    key={key}
                                >
                                    {
                                        item.children && item.children.map((val, ind)=>{
                                            return (
                                                <Option
                                                    value={val}
                                                    key={ind}
                                                >
                                                    {val}
                                                </Option>
                                            )
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                    </Col>
                );
            }
            return false;
        });
        return children;
    }
    handleSearch = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log('Received values of form: ', values);
        });
    };
    handleReset = () => {
        this.props.form.resetFields();
    };
    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
    };
    render () {
        return (
            <div>
                <Form
                    className="ant-advanced-search-form"
                    onSubmit={this.handleSearch}
                >
                    <Row gutter={24}>
                        <Col span={3}>
                            <UploadImg />
                        </Col>
                        <Col span={21}>{this.getFields()}</Col>
                    </Row>
                    <Row>
                        <Col span={18}
                            style={{ textAlign: 'right' }}
                        >
                        </Col>
                    </Row>
                    <p>描述</p>
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

                    <Button type="primary"
                        htmlType="submit"
                    >创建</Button>
                </Form>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AppSettings);
export default (WrappedAdvancedSearchForm);
