import React, { Component } from 'react';
import { Input, Button, Spin } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import './style.scss';
import http from '../../utils/Server';
import {inject, observer} from 'mobx-react';

const Search = Input.Search;

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
                    if (item.fork_from !== null) {
                        formData.push(item)
                    } else if (item.owner === user) {
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
        this.setState({
            myList: newData,
            forkList: newData1
        });

        } else {
            let myLists = this.state.myLists;
            let forkLists = this.state.forkLists;
            this.setState({
                myList: myLists,
                forkList: forkLists
            });
        }
    };
    render () {
        const { appList, myList, forkList } = this.state;
        return (
            <div className="appList">

                <div className="searchApp">
                    <Link to={'/appnew'}>
                        <Button
                            type="primary"
                            style={{margin: '0 20px'}}
                        >创建新应用</Button>
                    </Link>
                    <Search
                        placeholder="输入应用名称"
                        onChange={this.searchApp}
                        style={{ width: 300 }}
                    />
                </div>
                <div style={{lineHeight: '300px', textAlign: 'center'}}>
                    <Spin spinning={this.state.loading}/>
                </div>
                <div
                    style={this.state.loading === false ? block : none}
                >
                    <p
                        className="detailsTitle"
                    >|<span>原创应用</span></p>
                    <ul style={myList.length > 0 ? {} : {height: '40px'}}>
                        {
                            myList && myList.length > 0 && myList.map((v, key)=>{
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
                                            <span>生产日期：{v.modified.substr(0, 11)}</span>
                                            <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                            <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                            <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                        </p>
                                    </div>
                                </li>
                            })
                        }
                    </ul>
                </div>

                <div
                    style={this.state.loading === false ? block : none}
                >
                    <p
                        className="detailsTitle"
                    >|<span>克隆应用</span></p>
                    <ul>
                        {
                            forkList && forkList.length > 0 && forkList.map((v, key)=>{
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
                                            <span>生产日期：{v.modified.substr(0, 11)}</span>
                                            <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                            <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                            <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                        </p>
                                    </div>
                                </li>
                            })
                        }
                    </ul>
                </div>

                {/*<div style={this.state.loading === false ? block : none}>*/}
                {/*    <p className="detailsTitle">|<span>我的收藏</span></p>*/}
                {/*    <ul>*/}
                {/*        {*/}
                {/*            appList && appList.length > 0 && appList.map((v, key)=>{*/}
                {/*                return <li key={key}>*/}
                {/*                    <div className="appImg">*/}
                {/*                        <Link to={`/myAppDetails/${v.name}`}>*/}
                {/*                            <img*/}
                {/*                                src={`/store_assets${v.icon_image}`}*/}
                {/*                                alt=""*/}
                {/*                            />*/}
                {/*                        </Link>*/}
                {/*                    </div>*/}
                {/*                    <div className="appInfo">*/}
                {/*                        <p className="appName">{v.app_name}</p>*/}
                {/*                        <p className="info">
                                            <span>生产日期：{v.modified.substr(0, 11)}</span>
                                            <span>应用分类：{v.category === null ? '----' : v.category}</span><br/>
                                            <span>通讯协议：{v.protocol === null ? '----' : v.protocol}</span>
                                            <span>设备厂商：{v.device_supplier === null ? '----' : v.device_supplier}</span>
                                        </p>
                {/*                    </div>*/}
                {/*                </li>*/}
                {/*            })*/}
                {/*        }*/}
                {/*    </ul>*/}
                {/*</div>*/}

                <div
                    style={this.state.loading ? none : block}
                >
                    <p
                        className="empty"
                        style={appList.length === 0 ? block : none}
                    >
                        暂时没有应用！
                    </p>
                </div>
            </div>
        )
    }
}
export default Developer;