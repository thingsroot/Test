import React, { PureComponent } from 'react';
import SimpleMDE from 'simplemde';
import marked from 'marked';
import highlight from 'highlight.js';
import 'simplemde/dist/simplemde.min.css';
import {
    Form, Row, Col, Input, Button, Select
  } from 'antd';
  const Option = Select.Option;

  function handleChange (value) {
    console.log(value); // { key: "lucy", label: "Lucy (101)" }
  }
class AdvancedSearchForm extends PureComponent {
    state = {
        expand: false,
        a: 1
    }
    componentDidMount (){
        this.smde = new SimpleMDE({
            element: document.getElementById('editor').childElementCount,
            autofocus: true,
            autosave: true,
            previewRender: function (plainText) {
                    return marked(plainText, {
                            renderer: new marked.Renderer(),
                            gfm: true,
                            pedantic: false,
                            sanitize: false,
                            tables: true,
                            breaks: true,
                            smartLists: true,
                            smartypants: true,
                            highlight: function (code) {
                                    return highlight.highlightAuto(code).value;
                            }
                    });
            }
    })
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
        }]
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
                          <Input placeholder={`请输入${item.name}`} />
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
                        <Select labelInValue
                            defaultValue={{ key: item.children[0] }}
                            style={{ width: 302 }}
                            onChange={handleChange}
                            key={key}
                        >
                            {
                                item.children && item.children.map((val, ind)=>{
                                    return (
                                      <Option value={val}
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
        })
        return children;
      }
    handleSearch = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        console.log('Received values of form: ', values);
      });
    }
    handleReset = () => {
        this.props.form.resetFields();
      }
    toggle = () => {
        const { expand } = this.state;
        this.setState({ expand: !expand });
      }
    setNum (_this){
        _this.setState({a: 333})
    }
    render () {
        return (
            <div>
                <Form
                    className="ant-advanced-search-form"
                    onSubmit={this.handleSearch}
                >
                    <Row gutter={24}>{this.getFields()}</Row>
                    <Row>
                    <Col span={24}
                        style={{ textAlign: 'right' }}
                    >
                    </Col>
                    </Row>
                    <p>描述</p>
                    <textarea id="editor"></textarea>
                    <Button type="primary"
                        htmlType="submit"
                    >创建</Button>
                </Form>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
export default (WrappedAdvancedSearchForm);
