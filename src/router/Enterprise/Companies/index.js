import React, { PureComponent } from 'react'
import Route from '../../../components/GatewayRoute';
import Members from './MemberManage';
import Shared from './ShareGroup';
import InvitedToRecord from './InvitedToRecord';
import { withRouter, Switch, Redirect, Link } from 'react-router-dom';
import CompaniesInfo from './CompaniesInfo';
import http from '../../../utils/Server';
import './style.scss';
import { _getCookie } from '../../../utils/Session';
@withRouter
class Companies extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            index: 1,
            is_admin: false,
            loading: true
        }
    }
    componentDidMount () {
        this.ModifyTheRule()
        this.getCompany()
    }
    setIndex = (i) => {
        this.setState({
            index: i
        })
    }
    getCompany = () => {
        http.get('/api/companies_read?name=' + _getCookie('companies')).then(res=>{
            if (res.ok) {
                if (res.data.admin === _getCookie('user_id')) {
                    this.setState({
                        is_admin: true
                    })
                }
                this.setState({
                    loading: false
                })
            } else {
                this.setState({
                    loading: false
                })
            }
        })
    }
    ModifyTheRule = () => {
        let { pathname } = this.props.location;
        pathname = pathname.toLowerCase()
        if (pathname.indexOf('shared') !== -1) {
            this.setIndex(2)
        } else if (pathname.indexOf('members') !== -1) {
            this.setIndex(1)
        } else if (pathname.indexOf('companiesinfo') !== -1) {
            this.setIndex(4)
        } else {
            return false;
        }
    }
    render () {
        const { path } = this.props.match;
        const { index, is_admin, loading } = this.state;
        return (
            !loading
            ? <div className="companies">
            <div className="companies_nav">
                <p>企业组织</p>
                <ul>
                    {/* <li>子账户管理</li> */}
                    {
                        is_admin
                        ? <Link to={`${path}/members`}>
                            <li
                                className={index === 1 ? 'actives' : ''}
                                onClick={()=>{
                                    this.setIndex(1)
                                }}
                            >
                                成员管理
                            </li>
                          </Link>
                        : ''
                    }
                    <Link to={`${path}/shared`}>
                        <li
                            className={index === 2 ? 'actives' : ''}
                            onClick={()=>{
                                this.setIndex(2)
                            }}
                        >
                            共享组管理
                        </li></Link>
                    {/* <li
                        className={index === 3 ? 'actives' : ''}
                        onClick={()=>{
                            this.setIndex(3)
                        }}
                    ><Link to={`${path}/invited`}>邀请记录</Link></li> */}
                    <Link to={`${path}/companiesinfo`}>
                        <li
                            className={index === 4 ? 'actives' : ''}
                            onClick={()=>{
                                this.setIndex(4)
                            }}
                        >
                            公司信息
                        </li>
                    </Link>
                </ul>
            </div>
            <div className="companies_content">
                <Switch>
                    <Route
                        path={`${path}/shared`}
                        component={Shared}
                        title=""
                    />
                    <Route
                        path={`${path}/members`}
                        component={Members}
                        title=""
                        setIndex={this.setIndex}
                    />
                    <Route
                        path={`${path}/invited`}
                        component={InvitedToRecord}
                        title=""
                    />
                    <Route
                        path={`${path}/companiesinfo`}
                        component={CompaniesInfo}
                        title=""
                    />
                    <Redirect from={path}
                        to={`${path}/members`}
                    />
                </Switch>
            </div>
        </div>
        : ''
        )
    }
}

export default Companies