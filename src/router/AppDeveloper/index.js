import React, { PureComponent } from 'react'
import {Form, Input, Button, message, Result, Skeleton, Modal} from 'antd';
import http from '../../utils/Server';
import './style.scss';
import intl from 'react-intl-universal';

import { _getCookie, _setCookie } from '../../utils/Session';
const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };
class DynamicRule extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            checkNick: false,
            status: null,
            flag: false,
            loading: true
        }
    }
    componentDidMount () {
        if (Number(_getCookie('is_developer')) === 1) {
            this.props.history.go(-1)
        }
        http.get('/api/developers_requisition_list').then(res=>{
            if (res.ok) {
                if (res.data.length > 0) {
                    let status = null;
                    res.data.map(item=>{
                        if (item.docstatus === 0) {
                            status = 0;
                        }
                        if (item.docstatus === 1 && status !== 0) {
                            message.success(intl.get('appdeveloper.Application_successfully_jumped_to_application_market'))
                            _setCookie('is_developer', '1')
                            this.props.history.push('/appstore')
                        }
                        if (item.docstatus === 2 && status !== 0) {
                            status = 2;
                        }
                    })
                    this.setState({
                        status,
                        loading: false
                    })
                } else {
                    this.setState({
                        flag: true,
                        loading: false
                    })
                }
            }
        })
    }
    confirm = () => {
        Modal.success({
          title: intl.get('appdeveloper.Application_is_successful') + '！',
          content: intl.get('appdeveloper.application_succeeded'),
          okText: intl.get('appdeveloper.Confirm_and_return'),
          onOk: () => this.props.history.go(-1)
        });
    }
    check = () => {
        this.props.form.validateFields((err, values) => {
          if (err) {
            return false;
          }
          const data = {
            user: _getCookie('user_id'),
            dev_name: values.devname,
            id_name: values.username,
            id_card: values.idcardnumber,
            address: values.address
          }
          http.post('/api/developers_requisition_create', data).then(res=>{
              if (res.ok) {
                  message.success(intl.get('appdeveloper.application_succeeded'))
              } else {
                  message.error(`${intl.get('appdeveloper.application_failed')}:` + res.error)
              }
          })
        });
    };
    render () {
        const { getFieldDecorator } = this.props.form;
        const {loading, flag, status} = this.state;
    return (
      <div className="app_developer">
        <div className="app_developer_title">{intl.get('appdeveloper.Welcome_to_apply_to_be_a_developer!You_can_use_more_features_when_you_become_a_developer')}</div>
        <div className="app_developer_up_button">
            <Button
                type="link"
                style={{color: '#fff'}}
                icon="left"
                onClick={()=>{
                    this.props.history.go(-1)
                }}
            >{intl.get('login.return')}</Button>
        </div>
        {
            loading
            ? <Skeleton active />
            : flag
                ? <div className="app_developer_form">
                    <div className="app_developer_register">{intl.get('appdeveloper.apply_to_become_a_developer')}</div>
                    <Form.Item
                        {...formItemLayout}
                        label={intl.get('appdeveloper.Developer_name')}
                    >
                    {getFieldDecorator('devname', {
                        rules: [
                        {
                            required: true,
                            message: intl.get('appdeveloper.The_developer_name_format_is_alphabetic_and_underlined'),
                            pattern: /^[a-zA-Z_]{1,}$/
                        }
                        ]
                    })(<Input placeholder={intl.get('appdeveloper.Please_enter_your_developer_name')} />)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={intl.get('appdeveloper.The_name')}
                    >
                        {getFieldDecorator('username', {
                            rules: [
                            {
                                required: true,
                                message: intl.get('appdeveloper.please_enter_your_name')
                            }
                            ]
                        })(<Input placeholder={intl.get('appdeveloper.please_enter_your_name')} />)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={intl.get('appdeveloper.ID_card_No.')}
                    >
                        {getFieldDecorator('idcardnumber', {
                            rules: [
                            {
                                required: true,
                                message: intl.get('appdeveloper.please_enter_the_correct_ID_number'),
                                pattern: /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
                            }
                            ]
                        })(<Input placeholder={intl.get('appdeveloper.please_enter_the_correct_ID_number')} />)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={intl.get('appdeveloper.address')}
                    >
                        {getFieldDecorator('address', {
                            rules: [
                            {
                                required: true,
                                message: intl.get('appdeveloper.please_enter_your_address')
                            }
                            ]
                        })(<Input placeholder={intl.get('appdeveloper.please_enter_your_address')} />)}
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        label={intl.get('appdeveloper.cell-phone_number')}
                    >
                        {getFieldDecorator('phone', {
                            rules: [
                            {
                                required: true,
                                message: intl.get('appdeveloper.please_enter_your_mobile_number'),
                                pattern: /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
                            }
                            ]
                        })(<Input placeholder={intl.get('appdeveloper.please_enter_your_mobile_number')} />)}
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            size="large"
                            onClick={this.check}
                        >
                            {intl.get('appdeveloper.application_for_submission')}
                        </Button>
                    </Form.Item>
            </div>
                : status !== null
                    ? <Result
                        title={status === 0 ? intl.get('appdeveloper.your_application_is_being_processed') : intl.get('appdeveloper.your_application_has_been_rejected')}
                        extra={
                            status !== 0
                            ? <Button
                                type="primary"
                                key="console"
                                onClick={()=>{
                                    this.setState({
                                        flag: true
                                    })
                                }}
                              >
                                  {intl.get('appdeveloper.reapply')}
                            </Button>
                        : ''
                        }
                      />
                    : ''
        }
      </div>
    );
    }
}
const AppDeveloper = Form.create({ name: 'dynamic_rule' })(DynamicRule);
export default AppDeveloper