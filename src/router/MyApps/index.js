import React, { PureComponent } from 'react';
import { Input, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
import './style.scss';
import http from '../../utils/Server';

const Search = Input.Search;

const block = {
    display: 'block'
};
const none = {
    display: 'none'
};

class MyApps extends PureComponent {
    state = {
        appList: [],
        backups: [],
        loading: true
    };

    componentDidMount (){
        http.get('/api/applications_list').then(res=>{
            console.log(res);
            if (res) {
                this.setState({
                    loading: false,
                    appList: res.data,
                    backups: res.data
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
                    <Button
                        type="primary"
                        style={{margin: '0 20px'}}
                    >
                        <Link to={'/appSettings/1'}>创建新应用</Link>
                    </Button>

                    <Search
                        placeholder="输入应用名称"
                        onChange={this.searchApp}
                        style={{ width: 300 }}
                    />
                </div>
                <div style={{lineHeight: '300px', textAlign: 'center'}}>
                    <Spin spinning={this.state.loading}/>
                </div>
                <ul style={appList && appList.length > 0 || this.state.loading === false ? block : none}>
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
                                        <span>生产日期：{v.modified.substr(0, 11)}</span>
                                        <span>应用分类：{v.category}</span><br/>
                                        <span>通讯协议：{v.protocol}</span>
                                        <span>设备厂商：{v.device_supplier}</span>
                                    </p>
                                </div>
                            </li>
                        })
                    }
                </ul>
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
export default MyApps;