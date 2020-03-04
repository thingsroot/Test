import React, { PureComponent } from 'react'
import http from '../../../../utils/Server';
import { Button, Modal, message } from 'antd';
import { _getCookie, _setCookie } from '../../../../utils/Session';
import intl from 'react-intl-universal';
const { confirm } = Modal;
class Companies extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            data: undefined
        }
    }
    componentDidMount () {
        http.get('/api/companies_read?name=' + _getCookie('companies')).then(res=>{
            if (res.ok) {
                this.setState({
                    data: res.data
                })
            }
        })
    }
    quitCompanies = () =>{
        const data = {
            company: _getCookie('companies')
        }
        http.post('/api/user_companies_quit', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('company.Exit_the_company_successfully') + '!')
                _setCookie('companies', 'undefined')
                this.props.history.push('/enterprise')
            } else {
                message.error(intl.get('company.Exit_company_failed_error_message') + ':' + res.error)
            }
        })
    }
    showConfirm = () => {
        confirm({
          title: intl.get('company.Are_you_sure_you_want_to_quit_the_company') + '?',
          content: intl.get('company.This_operation_is_irreversible_Is_it_confirmed'),
          okText: intl.get('company.Confirm_the_exit'),
          cancelText: intl.get('common.cancel'),
          onOk: () => {
            this.quitCompanies()
          }
        });
      }
    render () {
        const { data } = this.state;
        return (
            <div className="companies_info">
                <p>{intl.get('company.You_have_joined_the_following_organization')}:</p>
                <div>
                    <span>{intl.get('company.The_company_referred_to_as')}:&nbsp;&nbsp;</span>
                    <span>{data !== undefined && data.comp_name}</span>
                </div>
                <div>
                    <span>{intl.get('company.The_company_full_name')}:&nbsp;&nbsp;</span>
                    <span>{data !== undefined && data.full_name}</span>
                </div>
                <div>
                    <span>{intl.get('company.The_company_name')}:&nbsp;&nbsp;</span>
                    <span>{data !== undefined && data.domain}</span>
                </div>
                <div>
                    <span>{intl.get('appdetails.creation_time')}:&nbsp;&nbsp;</span>
                    <span>{data !== undefined && data.creation}</span>
                </div>
                <div>
                    <span>{intl.get('company.Administrator_account')}:&nbsp;&nbsp;</span>
                    <span>{data !== undefined && data.admin}</span>
                </div>
                {
                    data && _getCookie('user_id') !== data.admin
                    ? <Button
                        type="danger"
                        onClick={this.showConfirm}
                        style={{margin: '15px'}}
                      >
                        {intl.get('company.Quit_the_company')}
                      </Button>
                    : ''
                }
            </div>
        )
    }
}

export default Companies