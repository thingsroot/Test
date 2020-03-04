import React, { Component } from 'react';
import { Input, Button, Spin, Tabs, Result, Icon  } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import './style.scss';
import http from '../../utils/Server';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../utils/Session';
import intl from 'react-intl-universal';

const Search = Input.Search;

const { TabPane } = Tabs;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

@withRouter
@inject('store')
@observer

class Developer extends Component {
    state = {
        appList: [],
        myList: [],
        myLists: [],
        collectList: [],  //收藏应用列表
        collectLists: [],  //收藏应用列表
        forkList: [],
        forkLists: [],
        backups: [],
        loading: true
    };

    componentDidMount (){
        let user = this.props.store.session.user_id
        http.get('/api/applications_list').then(res=>{
            let formData = [];
            let myData = [];
            if (res) {
                res.data && res.data.length > 0 && res.data.map((item=>{
                    if (item.name.indexOf('/') !== -1) {
                        item.name = item.name.replace(/\//g, '*')
                    }
                    if (item.fork_from !== null) {
                        formData.push(item)
                    } else if (item.developer === user) {
                        myData.push(item)
                    }
                }));
                this.setState({
                    loading: false,
                    appList: res.data,
                    myList: myData,
                    myLists: myData,
                    forkList: formData,
                    forkLists: formData,
                    backups: res.data
                })
            }
        });
        http.post('/api/store_favorites_list').then(res=>{
            if (res.ok && res.data.length > 0) {
                this.setState({
                    collectList: res.data,
                    collectLists: res.data
                })
            }
        })
    }
    tick = (text)=>{
        if (this.timer){
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(() => {
            this.setState({
                text: text
            })
        }, 1000);
    };
    searchApp = (e)=>{
        let text = e.target.value;
        this.tick(text);
        if (text) {
        let newData = [];
        let newData1 = [];
        let newData2 = [];
        this.state.myLists.map((v)=>{
            if (v.app_name.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                newData.push(v)
            }
        });
        this.state.forkLists.map((v)=>{
            if (v.app_name.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                newData1.push(v)
            }
        });
        this.state.collectLists.map((v)=>{
            if (v.app_name.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                newData2.push(v)
            }
        });
        this.setState({
            myList: newData,
            forkList: newData1,
            collectList: newData2
        });

        } else {
            const {myLists, forkLists, collectLists} = this.state;
            this.setState({
                myList: myLists,
                forkList: forkLists,
                collectList: collectLists
            });
        }
    };
    render () {
        const { myList, forkList, collectList } = this.state;
        return (
            <div className="appList">

                <div className="searchApp">
                    {
                        Number(_getCookie('is_developer')) === 1
                        ? <Link to={'/appnew'}>
                        <Button
                            type="primary"
                            style={{margin: '0 20px'}}
                        >{intl.get('developer.create_new_app')}</Button>
                    </Link>
                    : <Button
                        type="primary"
                        disabled
                        style={{margin: '0 20px'}}
                      >{intl.get('developer.create_new_app')}</Button>
                    }
                    <Search
                        placeholder={intl.get('developer.enter_application_name')}
                        onChange={this.searchApp}
                        style={{ width: 300 }}
                    />
                </div>
                {
                    this.state.loading
                    ? <div style={{lineHeight: '300px', textAlign: 'center'}}>
                        <Spin spinning={this.state.loading}/>
                    </div>
                    : <Tabs
                        defaultActiveKey="1"
                        type="card"
                      >
                        <TabPane
                            tab={intl.get('developer.original_application')}
                            key="1"
                        >
                            {
                                Number(_getCookie('is_developer')) !== 1
                                ? <Result
                                    title={intl.get('developer.Please_apply_to_be_a_developer_first') + '!'}
                                    extra={
                                        <Button
                                            type="primary"
                                            key="console"
                                            onClick={()=>{
                                                console.log(this)
                                                this.props.history.push('/appdeveloper')
                                            }}
                                        >
                                            {intl.get('developer.apply_to_be_a_developer')}
                                        </Button>
                                    }
                                  />
                                : <div>
                                <ul>
                                    {
                                        myList && myList.length > 0
                                        ? myList.map((v, key)=>{
                                            return (
                                                <li key={key}>
                                                    <div className="appImg">
                                                        <Link to={`/appdetails/${v.name}`}>
                                                            <img
                                                                src={`/store_assets${v.icon_image}`}
                                                                alt=""
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="appInfo">
                                                        <p className="appName">{v.app_name}</p>
                                                        <p className="info">
                                                            <span>{intl.get('developer.the_date_of_production')}：{v.modified.substr(0, 11)}</span>
                                                            <span>{intl.get('developer.application_of_classification')}：{v.category === null ? '----' : v.category}</span><br/>
                                                            <span>{intl.get('developer.communication_protocol')}：{v.protocol === null ? '----' : v.protocol}</span>
                                                            <span>{intl.get('developer.equipment_manufacturers')}：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                                        </p>
                                                    </div>
                                                </li>
                                            )
                                        })
                                        : <Result
                                            icon={
                                                <Icon
                                                    type="smile"
                                                    theme="twoTone"
                                                />
                                            }
                                            title={intl.get('appedit.You_havent_applied_yet_click_create_new_application')}
                                            extra={
                                            <Link to={'/appnew'}>
                                                <Button
                                                    type="primary"
                                                    style={{margin: '0 20px'}}
                                                >{intl.get('developer.create_new_app')}</Button>
                                            </Link>}
                                          />
                                    }
                                    </ul>
                                </div>
                            }
                    </TabPane>
                    <TabPane
                        tab={intl.get('developer.clone_application')}
                        key="2"
                    >
                        <div
                            style={this.state.loading === false ? block : none}
                        >
                            <ul>
                                {
                                    forkList && forkList.length > 0
                                    ? forkList.map((v, key)=>{
                                        return <li key={key}>
                                            <div className="appImg">
                                                <Link to={`/appdetails/${v.name}`}>
                                                    <img
                                                        src={`/store_assets${v.icon_image}`}
                                                        alt=""
                                                    />
                                                </Link>
                                            </div>
                                            <div className="appInfo">
                                                <p className="appName">{v.app_name}</p>
                                                <p className="info">
                                                    <span>{intl.get('developer.the_date_of_production')}：{v.modified.substr(0, 11)}</span>
                                                    <span>{intl.get('developer.application_of_classification')}：{v.category === null ? '----' : v.category}</span><br/>
                                                    <span>{intl.get('developer.communication_protocol')}：{v.protocol === null ? '----' : v.protocol}</span>
                                                    <span>{intl.get('developer.equipment_manufacturers')}：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                                </p>
                                            </div>
                                        </li>
                                    })
                                    : <Result
                                        icon={
                                            <Icon
                                                type="smile"
                                                theme="twoTone"
                                            />
                                        }
                                        title={intl.get('appedit.You_have_not_yet_cloned_the_application,_click_jump_to_the_application_market')}
                                        extra={
                                        <Link to={'/appstore'}>
                                            <Button
                                                type="primary"
                                                style={{margin: '0 20px'}}
                                            >{intl.get('header.app_store')}</Button>
                                        </Link>}
                                      />
                                }
                            </ul>
                        </div>
                    </TabPane>
                    <TabPane
                        tab={intl.get('developer.collect_applied')}
                        key="3"
                    >
                        <div style={this.state.loading === false ? block : none}>
                           <ul>
                               {
                                   collectList && collectList.length > 0
                                   ? collectList.map((v, key)=>{
                                       return <li key={key}>
                                           <div className="appImg">
                                               <Link to={`/appdetails/${v.name}`}>
                                                   <img
                                                       src={`/store_assets${v.icon_image}`}
                                                       alt=""
                                                   />
                                               </Link>
                                           </div>
                                           <div className="appInfo">
                                               <p className="appName">{v.app_name}</p>
                                               <p className="info">
                                                    <span>{intl.get('developer.the_date_of_production')}：{v.modified.substr(0, 11)}</span>
                                                    <span>{intl.get('developer.application_of_classification')}：{v.category === null ? '----' : v.category}</span><br/>
                                                    <span>{intl.get('developer.communication_protocol')}：{v.protocol === null ? '----' : v.protocol}</span>
                                                    <span>{intl.get('developer.equipment_manufacturers')}：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                                </p>
                                            </div>
                                       </li>
                                   })
                                    : <Result
                                        icon={
                                            <Icon
                                                type="smile"
                                                theme="twoTone"
                                            />
                                        }
                                        title={intl.get('appedit.You_do_not_yet_have_a_favorite_app_click_jump_to_app_market')}
                                        extra={
                                        <Link to={'/appstore'}>
                                            <Button
                                                type="primary"
                                                style={{margin: '0 20px'}}
                                            >{intl.get('header.app_store')}</Button>
                                        </Link>}
                                      />
                               }
                           </ul>
                        </div>
                    </TabPane>
                </Tabs>
                }
                {/* <div
                    style={this.state.loading ? none : block}
                >
                    {
                        Number(_getCookie('is_developer')) !== 1
                        ? <Result
                            title={intl.get('developer.Please_apply_to_be_a_developer_first') + '!'}
                            extra={
                                <Button
                                    type="primary"
                                    key="console"
                                    onClick={()=>{
                                        console.log(this)
                                        this.props.history.push('/appdeveloper')
                                    }}
                                >
                                    {intl.get('developer.apply_to_be_a_developer')}
                                </Button>
                            }
                          />
                        : <p
                            className="empty"
                            style={appList && appList.length === 0 ? block : none}
                          >
                            {intl.get('developer.temporarily_not_applied')}!
                        </p>
                    }
                </div> */}
            </div>
        )
    }
}
export default Developer;