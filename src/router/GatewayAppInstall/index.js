import React, { PureComponent } from 'react';
import SimpleMDE from 'simplemde';
import marked from 'marked';
import highlight from 'highlight.js';
import 'simplemde/dist/simplemde.min.css';
import intl from 'react-intl-universal';
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
    };
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
            name: intl.get('appedit.apply_name'),
            type: 'input'
        }, {
            name: intl.get('appedit.authorization_type'),
            type: 'select',
            children: [intl.get('appedit.freeappedit.free')]
        }, {
            name: intl.get('gateway.application_manufacturer'),
            type: 'select',
            children: [intl.get('gatewayappinstall.Roque_Phil'), intl.get('gatewayappinstall.Siemens'), intl.get('gatewayappinstall.Zhongda_Telecom'), intl.get('gatewayappinstall.Spin_technology'), intl.get('gatewayappinstall.Winter_bamboo_shoot_Technology'), 'Other', intl.get('gatewayappinstall.HUAWEI'), intl.get('gatewayappinstall.MITSUBISHI_electric')]
        }, {
            name: intl.get('gatewayappinstall.equipment_type'),
            type: 'input'
        }, {
            name: intl.get('gatewayappinstall.agreement'),
            type: 'select',
            children: ['SIEMENS-S7COMM', 'Redis', 'Mitsubishi_FX', 'OMRON-FINS', 'Private', 'UNKNOWN', 'DLT645-2007', 'DLT645-1997']
        }, {
            name: intl.get('gatewayappinstall.category'),
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
                          <Input placeholder={`${intl.get('gatewayappinstall.please_input')}${item.name}`} />
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
                    <p>{intl.get('common.desc')}</p>
                    <textarea id="editor"></textarea>
                    <Button type="primary"
                        htmlType="submit"
                    >{intl.get('accesskeys.create')}</Button>
                </Form>
            </div>
        )
    }
}
const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);
export default (WrappedAdvancedSearchForm);
