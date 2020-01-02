import React, { PureComponent } from 'react'
import http from '../../../utils/Server';
import { _getCookie, _setCookie } from '../../../utils/Session';
import reqwest from 'reqwest';
import { withRouter } from 'react-router-dom';
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
                    title="创建企业组织"
                    okText="创建"
                    cancelText="取消"
                    onCancel={onCancel}
                    onOk={onCreate}
                    maskClosable={false}
                >
                <Form layout="vertical">
                  <Form.Item label="公司简称">
                    {getFieldDecorator('comp_name', {
                      rules: [{ required: true, message: '请输入公司简称!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="公司全称">
                    {getFieldDecorator('full_name', {
                      rules: [{ required: true, message: '请输入公司全称!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="公司域名">
                    {getFieldDecorator('domain', {
                      rules: [{ required: true, message: '请输入公司域名!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="联系电话">
                    {getFieldDecorator('telephone', {
                      rules: [{ required: true, message: '请输入联系电话!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="公司信用代码(税号)">
                    {getFieldDecorator('credit_code', {
                      rules: [{ required: true, message: '请输入公司信用代码(税号)!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="公司注册地址">
                    {getFieldDecorator('address', {
                      rules: [{ required: true, message: '请输入公司注册地址!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="联系地址">
                    {getFieldDecorator('contact', {
                      rules: [{ required: true, message: '请输入公司联系地址!' }]
                    })(<Input />)}
                  </Form.Item>
                  <Form.Item label="公司运营执照照片文件">
                    {getFieldDecorator('business_license_file', {
                      rules: [{ required: true, message: '请上传公司运营执照照片!' }]
                    })(<Upload {...props}>
                        <Button>
                          <Icon type="upload" /> 上传运营执照照片
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
        http.get('api/user_read?name' + _getCookie('user_id')).then(result=>{
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
                                    message.success('您的申请已经成功，即将为您跳转到企业页面，请稍等！')
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
        })
    }
    addcompany = (name, company)=>{
        const data = {
            name
        }
        http.post('/api/user_company_invitations_accept', data).then(res=>{
            if (res.ok) {
                message.success('您已成功加入该公司！')
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
              message.error('您已拒绝加入该公司！')
            }
        })
    }
    showConfirm = (record) => {
        confirm({
          title: '有用户邀请您加入公司' + record.company,
          content: '是否加入该公司？',
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
                message.error('不能上传多个文件')
                return
            }
            if (fileList.length === 0) {
                message.error('请选择要上传的文件')
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
            reqwest({
                url: '/api/companies_requisition_create',
                method: 'post',
                processData: false,
                data: formData,
                success: () => {
                    message.success('资料提交成功，请耐心等待后台审核，预计需要1-3个工作日...');
                    this.setState({
                      visible: false,
                      status: 'processing',
                      loading: false
                    })
                },
                error: () => {
                  message.error('资料提交失败，请重试！');
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
                        <p className="create_companies_title">企业组织简介</p>
                        <p className="create_companies_content">您可以将相关账户加入企业组织，组织成员具有层级关系的结构，如果您的账户代表一家公司，则可以将所有部门账户添加进来，按照公司结构组织这些部门账户的层级关系；如果您的账户是代理商，可以添加所有子公司账户。作为主账户，您还可以控制子账户的访问权限。</p>
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={this.showModal}
                        >创建企业组织</Button>
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
                            title="申请失败,点击重新申请"
                            extra={
                            <Button
                                type="primary"
                                key="console"
                                onClick={this.showModal}
                            >
                                重新申请
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
                            title="您的申请正在处理中，请耐心等待!"
                            extra={
                              <Button
                                  type="primary"
                                  key="console"
                                  onClick={()=>{
                                    this.props.history.go(-1)
                                  }}
                              >
                                  点击返回
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