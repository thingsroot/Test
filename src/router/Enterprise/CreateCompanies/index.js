import React, { PureComponent } from 'react'
import http from '../../../utils/Server';
import { _getCookie, _setCookie } from '../../../utils/Session';
import reqwest from 'reqwest';
import { withRouter } from 'react-router-dom';
import intl from 'react-intl-universal'
import {
    Button,
    Form,
    Input,
    Modal,
    Upload,
    Icon,
    message,
    Result
    // Spin
 } from 'antd'
 import './style.scss';
 const { confirm } = Modal;
 let fileList = [];
    const CollectionCreateForm = Form.create({ name: 'form_in_modal' })(
        class extends React.Component {
            state = {
                fileList: []
            }
          render () {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            const props = {
                multiple: false,
                action: '/api/api/v1/companies.requisition.create',
                onRemove: (file) => {
                        const index = fileList.indexOf(file);
                        const newFileList = fileList.slice();
                        newFileList.splice(index, 1);
                        fileList = newFileList
                },
                beforeUpload: (file) => {
                        fileList = [...fileList, file]
                    return false;
                }
            };
            return (
                <Modal
                    visible={visible}
                    title={intl.get('company.Creating_an_organization')}
                    okText={intl.get('accesskeys.create')}
                    cancelText={intl.get('common.cancel')}
                    onCancel={onCancel}
                    onOk={onCreate}
                    maskClosable={false}
                >
                <Form layout="vertical">
                  <Form.Item label={intl.get('company.The_company_referred_to_as')}>
                    {getFieldDecorator('comp_name', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.The_company_referred_to_as') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.The_company_full_name')}>
                    {getFieldDecorator('full_name', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.The_company_full_name') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.The_company_name')}>
                    {getFieldDecorator('domain', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.The_company_name') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.Contact_phone_number')}>
                    {getFieldDecorator('telephone', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.Contact_phone_number') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.Company_credit_code_(tax_code)')}>
                    {getFieldDecorator('credit_code', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.Company_credit_code_(tax_code)') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.Company_registered_address')}>
                    {getFieldDecorator('address', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.Company_registered_address') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.Contact_address')}>
                    {getFieldDecorator('contact', {
                      rules: [{ required: true, message: intl.get('gateway.please_enter') + intl.get('company.Contact_address') + '!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label={intl.get('company.Company_operating_license_photo_file')}>
                    {getFieldDecorator('business_license_file', {
                      rules: [{ required: true, message: intl.get('company.Please_upload_photos_of_the_companys_operating_license') + '!' }]
                    })(<Upload {...props}>
                        <Button>
                          <Icon type="upload" /> {intl.get('company.Upload_photos_of_operating_license')}
                        </Button>
                      </Upload>)}
                  </Form.Item>
                </Form>
              </Modal>
            );
          }
        },
      );
      @withRouter
class CreateCompanies extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            visible: false,
            status: '',
            loading: true
        }
    }
    componentDidMount () {
        http.get('/api/user_company_invitations_list').then(res=>{
            if (res.ok && res.data.length > 0) {
                res.data.map(item=>{
                    if (item.docstatus === 0 && _getCookie('companies') === 'undefined') {
                        this.showConfirm(item)
                    }
                })
                this.setState({
                    data: res.data
                })
            }
        })
        http.get('/api/user_read?name=' + _getCookie('user_id')).then(result=>{
            if (result.ok) {
                http.get('/api/companies_requisition_list').then(res=>{
                    if (res.ok && res.data.length > 0) {
                        res.data.map(item=>{
                            if (item.docstatus === 0) {
                                this.setState({
                                    status: 'processing',
                                    loading: false
                                })
                            }
                            if (item.docstatus === 1) {
                                this.setState({
                                    status: 'true',
                                    loading: false
                                })
                                if (result.data && result.data.companies.length > 0) {
                                    _setCookie('companies', result.data.companies[0])
                                    message.success(intl.get('company.Your_application_has_been_successful_and_will_be_redirected_to_the_enterprise_page_for_you._Please_wait_a_moment'))
                                    this.props.history.push('/enterprise/shared')
                                }
                            }
                            if (item.docstatus === 2) {
                                this.setState({
                                    status: 'false',
                                    loading: false
                                })
                            }
                        })
                    } else {
                        this.setState({
                            loading: false
                        })
                    }
                })
            }
        })
    }
    addcompany = (name, company)=>{
        const data = {
            name
        }
        http.post('/api/user_company_invitations_accept', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('company.You_have_successfully_joined_the_company"'))
                _setCookie('companies', company)
            }
        })
    }
    refusedCompany = (name) =>{
        const data = {
            name
        }
        http.post('/api/user_company_invitations_reject', data).then(res=>{
            if (res.ok) {
              message.error(intl.get('company.You_have_refused_to_join_the_company'))
            }
        })
    }
    showConfirm = (record) => {
        confirm({
          title: intl.get('company.Users_have_invited_you_to_join_the_company') + record.company,
          content: intl.get('company.Join_the_company'),
          onOk: ()=> {
            this.addcompany(record.name, record.company)
          },
          onCancel: () => {
              this.refusedCompany(record.name)
              this.setState({
                  loading: false
              })
          }
        });
      }
    showModal = () => {
        this.setState({ visible: true });
    };
    handleCancel = () => {
        this.setState({ visible: false });
    };
    handleCreate = () => {
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const formData = new FormData();
            if (fileList.length > 1) {
                message.error(intl.get('appdetails.cannot_upload_multiple_files'))
                return
            }
            if (fileList.length === 0) {
                message.error(intl.get('appdetails.Please select the file to upload'))
                return
            }
            fileList.forEach((file) => {
                formData.append('business_license_file', file);
            });
            const key = Object.keys(values);
            key.length > 0 && key.map(item=>{
                if (item !== 'business_license_file') {
                    formData.append(item, values[item]);
                }
            })
            const token = _getCookie('csrf_auth_token') || '';
            reqwest({
                url: '/api/companies_requisition_create',
                method: 'post',
                headers: {
                    'X-Frappe-CSRF-Token': token
                },
                processData: false,
                data: formData,
                success: (res) => {
                    if (res.ok) {
                        message.success(intl.get('company.The_materials_are_submitted_successfully._Please_wait_patiently_for_the_background_review._It_is_expected_to_take_1-3_working_days'));
                        this.setState({
                          visible: false,
                          status: 'processing',
                          loading: false
                        })
                    } else {
                        message.error(intl.get('company.Data_submission_failed,_please_try_again'));
                    }
                },
                error: () => {
                  message.error(intl.get('company.Data_submission_failed,_please_try_again'));
                }
              });
            form.resetFields();
        });
    }
    saveFormRef = formRef => {
        this.formRef = formRef;
    };
    render () {
        const { status, loading } = this.state;
        return (
            <div className="create_companies">
                {
                    status === '' && !loading
                    ? <div>
                        <p className="create_companies_title">{intl.get('company.company.Introduction_to_enterprise_organization')}</p>
                        <p className="create_companies_content">{intl.get('company.company.Introduction_to_enterprise_organization_content')}</p>
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={this.showModal}
                        >{intl.get('company.Creating_an_organization')}</Button>
                        <CollectionCreateForm
                            wrappedComponentRef={this.saveFormRef}
                            visible={this.state.visible}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreate}
                        />
                      </div>
                    : ''
                }
                {
                    status === 'false'
                    ? <div>
                        <Result
                            status="warning"
                            title={intl.get('company.Application_failed_click_reapply')}
                            extra={
                            <Button
                                type="primary"
                                key="console"
                                onClick={this.showModal}
                            >
                                {intl.get('appdeveloper.reapply')}
                            </Button>
                            }
                        />
                    </div>
                    : ''
                }
                {
                    status === 'processing'
                    ? <div>
                        <Result
                            icon={
                                <Icon
                                    type="smile"
                                    theme="twoTone"
                                />
                            }
                            title={intl.get('company.Your_application_is_being_processed_please_wait_patiently')}
                            extra={
                              <Button
                                  type="primary"
                                  key="console"
                                  onClick={()=>{
                                    this.props.history.go(-1)
                                  }}
                              >
                                  {intl.get('login.return')}
                              </Button>
                            }
                        />
                    </div>
                    : ''
                }
            </div>
        )
    }
}

export default CreateCompanies