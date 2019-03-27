import React, { PureComponent } from 'react';
import { Input } from 'antd';
import { Link } from 'react-router-dom';
import { _getCookie } from '../../utils/Session';
import './style.scss';
import http from '../../utils/Server';

const Search = Input.Search;


class MyApps extends PureComponent {
    state = {
        appList: [],
        backups: []
    };

    componentDidMount (){
        //获取用户信息
        let usr = _getCookie('usr');
        //获取列表
        http.postToken('/api/method/iot_ui.iot_api.appstore_applist?user=' + usr).then(res=>{
            console.log(res);
            if (res.message) {
                this.setState({
                    appList: res.message,
                    backups: res.message
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
            }, ()=>{
                console.log(this.state.text)
            })
        }, 1000);
    };
    searchApp = ()=>{
        let text = event.target.value;
        console.log(text);
        this.tick(text);
        let newData = [];
        this.state.backups.map((v)=>{
            if (v.app_name.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
                newData.push(v)
            }
        });
        if (text !== '') {
            this.setState({
                appList: newData
            });
        } else {
            let backups = this.state.backups;
            this.setState({
                appList: backups
            });
        }
    };
    render () {
        const appList = this.state.appList;
        return (
            <div className="myApps">
                <div className="searchApp">
                    <Search
                        placeholder="输入应用名称"
                        onChange={this.searchApp}
                        style={{ width: 300 }}
                    />
                </div>
                <ul>
                    {
                        appList && appList.length > 0 && appList.map((v, key)=>{
                            return <li key={key}>
                                <div className="appImg">
                                    <Link to={`/myAppDetails/${v.name}`}>
                                        <img
                                            src={`http://cloud.thingsroot.com${v.icon_image}`}
                                            alt=""
                                        />
                                    </Link>
                                </div>
                                <div className="appInfo">
                                    <p className="appName">{v.app_name}</p>
                                    <p className="info">
                                        <span>生产日期：{v.creation.substr(0, 11)}</span>
                                        <span>应用分类：{v.category}</span><br/>
                                        <span>通讯协议：{v.protocol}</span>
                                        <span>设备厂商：{v.device_supplier}</span>
                                    </p>
                                </div>
                            </li>
                        })
                    }
                </ul>
            </div>
        );
    }
}
export default MyApps;