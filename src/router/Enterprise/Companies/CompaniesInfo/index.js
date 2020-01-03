import React, { PureComponent } from 'react'
import http from '../../../../utils/Server';
import { Button, Modal, message } from 'antd';
import { _getCookie, _setCookie } from '../../../../utils/Session';
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
                message.success('退出公司成功！')
                _setCookie('companies', 'undefined')
                this.props.history.push('/enterprise')
            } else {
                message.error('退出公司失败，错误信息:' + res.error)
            }
        })
    }
    showConfirm = () => {
        confirm({
          title: '确认要退出公司吗?',
          content: '该操作不可逆，是否确认。',
          okText: '确认退出',
          cancelText: '取消',
          onOk: () => {
            this.quitCompanies()
          }
        });
      }
    render () {
        const { data } = this.state;
        return (
            <div className="companies_info">
                <p>您已加入如下组织:</p>
                <div>
                    <span>公司简称:</span>
                    <span>{data !== undefined && data.comp_name}</span>
                </div>
                <div>
                    <span>公司全称:</span>
                    <span>{data !== undefined && data.full_name}</span>
                </div>
                <div>
                    <span>公司域名:</span>
                    <span>{data !== undefined && data.domain}</span>
                </div>
                <div>
                    <span>创建时间:</span>
                    <span>{data !== undefined && data.creation}</span>
                </div>
                <div>
                    <span>管理员账户:</span>
                    <span>{data !== undefined && data.admin}</span>
                </div>
                {
                    data && _getCookie('user_id') !== data.admin
                    ? <Button
                        type="danger"
                        onClick={this.showConfirm}
                        style={{margin: '15px'}}
                      >
                        退出公司
                      </Button>
                    : ''
                }
            </div>
        )
    }
}

export default Companies