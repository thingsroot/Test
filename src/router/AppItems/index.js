import React, { PureComponent } from 'react'
import http from '../../utils/Server';
import { Tabs, Button, Rate, Tag } from 'antd';
import Description from '../AppDetails/Description';
import './style.scss';
const { TabPane } = Tabs;
function callback (key) {
    console.log(key);
  }
class AppItems extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            data: []
        }
    }
    componentDidMount () {
        console.log()
        const {name} = this.props.match.params;
        http.get('/api/applications_read?app=' + name).then(res=>{
            console.log(res)
            if (res.ok) {
                this.setState({
                    data: res.data.data,
                    version: res.data.versionLatest
                })
            }
        })
    }
    render () {
        const {data, version} = this.state;
        return (
            <div className="app_items">
                <div className="app_title">
                    <div className="app_logo">
                        <img src={'http://ioe.thingsroot.com' + data.icon_image}/>
                    </div>
                    <div className="app_simple_info">
                        <p>{data.app_name}</p>
                        <div className="app_simple_desc">
                            <span>简易描述</span>
                            <span>xxx次下载</span>
                            <span>
                                <Rate
                                    disabled
                                    defaultValue={data.star}
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
                            style={{marginLeft: '30px', marginTop: '10px', width: '100px'}}
                            type="primary"
                        >收藏</Button>
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
                                    </div>
                                    <div className="info_details">
                                        <p>更多信息</p>
                                        <div><span className="info_title">版本:</span><span>{version}</span></div>
                                        <div><span className="info_title">发布时间:</span><span>{data.creation}</span></div>
                                        <div><span className="info_title">最近更新时间:</span><span>{data.modified}</span></div>
                                        <div><span className="info_title">作者:</span><span>{data.owner}</span></div>
                                    </div>
                                </div>
                            </div>
                        </TabPane>
                        <TabPane
                            tab="讨论"
                            key="2"
                        >
                            讨论
                        </TabPane>
                        <TabPane
                            tab="评分与评论"
                            key="3"
                        >
                            评分与评论
                        </TabPane>
                    </Tabs>
                    </div>
                </div>
            </div>
        )
    }
}

export default AppItems