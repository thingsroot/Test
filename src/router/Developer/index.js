import React, { Component } from 'react';
import { Input, Button, Spin, Tabs, Result, Icon  } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import './style.scss';
import http from '../../utils/Server';
import {inject, observer} from 'mobx-react';
import { _getCookie } from '../../utils/Session';

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
        console.log(this.props.store.session, 'session')
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
                        >创建新应用</Button>
                    </Link>
                    : <Button
                        type="primary"
                        disabled
                        style={{margin: '0 20px'}}
                      >创建新应用</Button>
                    }
                    <Search
                        placeholder="输入应用名称"
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
                            tab="原创应用"
                            key="1"
                        >
                            {
                                Number(_getCookie('is_developer')) !== 1
                                ? <Result
                                    title="您还不是开发者，请先申请成为开发者！"
                                    extra={
                                        <Button
                                            type="primary"
                                            key="console"
                                            onClick={()=>{
                                                this.props.history.push('/appdeveloper')
                                            }}
                                        >
                                            申请成为开发者
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
                                                        <Link to={`/appdetails/${v.name.replace(/\//g, '*')}`}>
                                                            <img
                                                                src={`/store_assets${v.icon_image}`}
                                                                alt=""
                                                            />
                                                        </Link>
                                                    </div>
                                                    <div className="appInfo">
                                                        <p className="appName">{v.app_name}</p>
                                                        <p className="info">
                                                            <span>生产日期：{v.modified.substr(0, 11)}</span>
                                                            <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                                            <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                                            <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
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
                                            title="您还没有应用，点击创建新应用"
                                            extra={
                                            <Link to={'/appnew'}>
                                                <Button
                                                    type="primary"
                                                    style={{margin: '0 20px'}}
                                                >创建新应用</Button>
                                            </Link>}
                                          />
                                    }
                                    </ul>
                                </div>
                            }
                    </TabPane>
                        <TabPane
                            tab="克隆应用"
                            key="2"
                        >
                            {
                                 Number(_getCookie('is_developer')) !== 1
                                 ? <Result
                                     title="您还不是开发者，请先申请成为开发者！"
                                     extra={
                                         <Button
                                             type="primary"
                                             key="console"
                                             onClick={()=>{
                                                 this.props.history.push('/appdeveloper')
                                             }}
                                         >
                                             申请成为开发者
                                         </Button>
                                     }
                                   />
                                : <div
                                    style={this.state.loading === false ? block : none}
                                  >
                                 <ul>
                                     {
                                        forkList && forkList.length > 0
                                        ? forkList.map((v, key)=>{
                                            return <li key={key}>
                                                <div className="appImg">
                                                    <Link to={`/appdetails/${v.name.replace(/\//g, '*')}`}>
                                                        <img
                                                            src={`/store_assets${v.icon_image}`}
                                                            alt=""
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="appInfo">
                                                    <p className="appName">{v.app_name}</p>
                                                    <p className="info">
                                                        <span>生产日期：{v.modified.substr(0, 11)}</span>
                                                        <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                                        <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                                        <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
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
                                            title="您还没有克隆应用，点击跳转到应用市场"
                                            extra={
                                            <Link to={'/appstore'}>
                                                <Button
                                                    type="primary"
                                                    style={{margin: '0 20px'}}
                                                >应用市场</Button>
                                            </Link>}
                                          />
                                     }
                                 </ul>
                             </div>
                            }
                        </TabPane>
                        <TabPane
                            tab="收藏应用"
                            key="3"
                        >
                        <div style={this.state.loading === false ? block : none}>
                           <ul>
                               {
                                   collectList && collectList.length > 0
                                   ? collectList.map((v, key)=>{
                                       return <li key={key}>
                                           <div className="appImg">
                                               <Link to={`/appdetails/${v.name.replace(/\//g, '*')}`}>
                                                   <img
                                                       src={`/store_assets${v.icon_image}`}
                                                       alt=""
                                                   />
                                               </Link>
                                           </div>
                                           <div className="appInfo">
                                               <p className="appName">{v.app_name}</p>
                                               <p className="info">
                                                    <span>生产日期：{v.modified.substr(0, 11)}</span>
                                                    <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                                    <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                                    <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
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
                                        title="您还没有收藏应用，点击跳转到应用市场"
                                        extra={
                                        <Link to={'/appstore'}>
                                            <Button
                                                type="primary"
                                                style={{margin: '0 20px'}}
                                            >应用市场</Button>
                                        </Link>}
                                      />
                               }
                           </ul>
                        </div>
                    </TabPane>
                </Tabs>
                }
            </div>
        )
    }
}
export default Developer;