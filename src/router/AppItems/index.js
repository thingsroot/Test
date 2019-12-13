import React, { PureComponent } from 'react'
import http from '../../utils/Server';
import { Tabs, Button, Rate, Tag, Icon, message } from 'antd';
import Description from '../AppDetails/Description';
import Comments from './Comments';
import Issues from './Issues';
import {_getCookie} from '../../utils/Session';
import './style.scss';
const { TabPane } = Tabs;
function callback (key) {
    console.log(key);
  }
class AppItems extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            data: [],
            visible: false,
            comment: '',
            favorites: false,
            favorites_loading: false
        }
    }
    componentDidMount () {
        this.getData()
        this.getFavoritesList()
    }
    getData = () => {
        const {name} = this.props.match.params;
        http.get('/api/applications_read?app=' + name).then(res=>{
            if (res.ok) {
                this.setState({
                    data: res.data.data,
                    version: res.data.versionLatest
                })
            }
        })
    }
    getFavoritesList = () => {
        http.post('/api/store_favorites_list').then(res=>{
            if (res.ok && res.data && res.data.length > 0) {
                const {name} = this.props.match.params;
                let favorites = false;
                res.data.map(item=>{
                    if (item.name === name) {
                        favorites = true
                    }
                })
                this.setState({
                    favorites,
                    loading: false
                })
            } else {
                this.setState({
                    favorites: false,
                    loading: false
                })
            }
        })
    }
    setFavorites = () => {
        console.log(this.state)
        this.setState({
            loading: true
        })
        const data = {
            app: this.state.data.name
            // comment: '123',
            // priority: ''v
        }
        const url = !this.state.favorites ? '/api/store_favorites_add' : '/api/store_favorites_remove'
        http.post(url, data).then(res=>{
            if (res.ok) {
                this.getFavoritesList()
            }
        })
    }
    sendForkCreate (record){
        http.get('/api/gateways_app_version_latest?app=' + record.name).then(result=>{
            if (result.ok) {
                http.post('/api/applications_forks_create', {
                    name: record.name,
                    version: Number(result.data)
                }).then(res=>{
                    if (res.ok){
                        message.success('应用克隆成功，即将跳转到编辑页面！')
                        if (res.data){
                            this.props.history.push(`/appeditorcode/${res.data.name}/${res.data.app_name}`);
                        }
                    } else {
                        message.error(res.error)
                    }
                })
            }
        })
    }
    render () {
        const {data, version} = this.state;
        return (
            <div className="app_items">
                <div className="app_items_up_button">
                    <Button
                        icon="rollback"
                        // type="primary"
                        onClick={()=>{
                            this.props.history.go(-1)
                        }}
                    >返回</Button>
                </div>
                <div className="app_title">
                    <div className="app_logo">
                        <img src={'http://ioe.thingsroot.com' + data.icon_image}/>
                    </div>
                    <div className="app_simple_info">
                        <p>{data.app_name}</p>
                        <div className="app_simple_desc">
                            <span>{data.developer}</span>
                            <span>{data.installed}次安装</span>
                            <span>
                                <Rate
                                    disabled
                                    defaultValue={data.star}
                                    style={{fontSize: '16px'}}
                                />
                            </span>
                            <span>免费</span>
                        </div>
                        <div
                            style={{marginLeft: '20px', marginTop: '10px'}}
                        >
                            {data.protocol}
                        </div>
                        <Button
                            loading={this.state.loading}
                            onClick={this.setFavorites}
                            style={{marginLeft: '30px', marginTop: '10px', width: '100px'}}
                            type={!this.state.favorites ? 'primary' : 'danger'}
                        >{this.state.favorites ? '取消收藏' : '收藏'}</Button>
                        {
                            data.developer !== _getCookie('user_id') && Number(_getCookie('is_developer')) === 1
                            ? <Button
                                style={{
                                    height: '35px',
                                    marginLeft: '15px'
                                }}
                                onClick={()=>{
                                    this.sendForkCreate(data)
                                }}
                              >
                                <Icon type="fork" />
                                克隆
                            </Button>
                            : ''
                        }
                    </div>
                </div>
                <div className="app_info">
                    <div className="app_info_left">
                    <Tabs
                        defaultActiveKey="1"
                        onChange={callback}
                    >
                        <TabPane
                            tab="总览"
                            key="1"
                        >
                            <div className="app_desc">
                                <Description source={data.description}/>
                                <div className="app_desc_right">
                                    <div>
                                        <p>分类工具</p>
                                    </div>
                                    <div>
                                        <p>标签</p>
                                        <div>
                                            {
                                                data.tags &&
                                                data.tags.length > 0 &&
                                                data.tags.split(',').map((item, key)=>{
                                                    return (
                                                        <Tag key={key}>
                                                            {item}
                                                        </Tag>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <p>适用于</p>
                                        <Tag>
                                            {data.device_serial === 'ALL' ? '全部' : data.device_serial}
                                        </Tag>
                                    </div>
                                    <div className="info_details">
                                        <p>更多信息</p>
                                        <div><span className="info_title">版本:</span><span>{version}</span></div>
                                        <div><span className="info_title">发布时间:</span><span>{data.creation && data.creation.indexOf('.') !== -1 ? data.creation.split('.')[0] : ''}</span></div>
                                        <div><span className="info_title">最近更新时间:</span><span>{data.modified && data.modified.indexOf('.') !== -1 ? data.modified.split('.')[0] : ''}</span></div>
                                        <div><span className="info_title">作者:</span><span>{data.developer}</span></div>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane
                            tab="问与答"
                            key="2"
                        >
                            <Issues />
                        </TabPane>
                        <TabPane
                            tab="评分与评论"
                            key="3"
                        >
                            <Comments />
                        </TabPane>
                    </Tabs>
                    </div>
                </div>
            </div>
        )
    }
}

export default AppItems;