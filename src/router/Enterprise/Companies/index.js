import React, { PureComponent } from 'react'
import Route from '../../../components/GatewayRoute';
import Members from './MemberManage';
import Shared from './ShareGroup';
import InvitedToRecord from './InvitedToRecord';
import { withRouter, Switch, Redirect, Link } from 'react-router-dom';
import CompaniesInfo from './CompaniesInfo';
import './style.scss';
@withRouter
class Companies extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            index: 1
        }
    }
    setIndex = (i) => {
        this.setState({
            index: i
        })
    }
    render () {
        const { path } = this.props.match;
        const { index } = this.state;
        return (
            <div className="companies">
                <div className="companies_nav">
                    <p>企业组织</p>
                    <ul>
                        {/* <li>子账户管理</li> */}
                        <Link to={`${path}/members`}>
                            <li
                                className={index === 1 ? 'actives' : ''}
                                onClick={()=>{
                                    this.setIndex(1)
                                }}
                            >
                                成员管理
                            </li>
                        </Link>
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
                            to={`${path}/shared`}
                        />
                    </Switch>
                </div>
            </div>
        )
    }
}

export default Companies