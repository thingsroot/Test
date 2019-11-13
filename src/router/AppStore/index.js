import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Tag, Input, Icon  } from 'antd';
const { Search } = Input;
// import Slider from 'react-slick';
// console.log(Slider)
//import { LazyLoad } from 'react-lazy-load';
// import AppCard from '../../common/AppCard';
// import Developer from '../Developer';
import './style.scss';
import http from '../../utils/Server';
// const { TabPane } = Tabs;
/*
import {Input, Icon, Button, message, notification, Rate, Drawer } from 'antd';  //
const openNotification = (title, message) => {
    notification.open({
        message: title,
        description: message,
        placement: 'buttonRight'
    });
};
*/
// function callback (key) {
//     console.log(key);
// }


@withRouter
@inject('store')
@observer
class AppStore extends Component {
    constructor (props){
        super(props)
        this.state = {
            data: [],
            tag_list: [],
            color: ['magenta', 'red', 'volcano', 'orange', 'gold', 'green', 'cyan', 'blue', 'geekblue', 'purple', '#f50', '#2db7f5', '#87d068', '#108ee9']
        }
    }

    componentDidMount (){
        http.get('/api/store_list').then(res=>{
            if (res.ok) {
                this.setState({data: res.data})
                console.log(res.data)
            } else {
                console.log('error')
            }
        })
        http.get('/api/store_tags_list').then(res=>{
            if (res.ok) {
                if (res.data && res.data.length > 0) {
                    const arr = [];
                    res.data.map(item=>{
                        arr.push({
                            tag: item[0],
                            number: item[1],
                            color: this.state.color[this.getRandomNumber()]
                        })
                    })
                    this.setState({
                        tag_list: arr
                    })
                    this.getRandomNumber()
                }
            }
        })
    }
    getRandomNumber = () => {
        return (Math.floor(Math.random() * (this.state.color.length - 1)))
    }
    render () {
        const { data, tag_list } = this.state;
        return (
        <div className="AppStore">
            <div>
                搜索:
                <Search
                    placeholder="input search text"
                    onSearch={value => console.log(value)}
                    style={{ width: 200 }}
                />
            </div>
            <div className="search">
                {
                    tag_list && tag_list.length > 0 && tag_list.map((item, key)=>{
                        console.log(item.color)
                        return (
                            <Tag
                                key={key}
                                color={item.color}
                            >{item.tag + ' (' + item.number + ')'}</Tag>
                        )
                    })
                }
            </div>
            {/* <div>
                <p>应用下载TOP榜</p>
                <div>
                    <Carousel
                        arrows
                        dots
                        infinite
                        speed={500}
                        slidesToShow={1}
                        slidesToScroll={1}
                        cssEase="linear"
                    >
                    <div>
                        <img src="https://p0.meituan.net/dpmerchantpic/0f776c0dd56ed2d0113426309648dba11762409.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" alt=""/>
                        </div>
                        <div>
                        <img src="https://p0.meituan.net/dpmerchantpic/0f776c0dd56ed2d0113426309648dba11762409.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" alt=""/>
                        </div>
                        <div>
                        <img src="http://p0.meituan.net/wedding/62d00696fda0f02b49d929b0825191c8588805.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" alt=""/>
                        </div>
                        <div>
                        <h3>4</h3>
                    </div>
                    </Carousel>
                </div>
            </div>
            <div>
                热门应用
                <Carousel
                    arrows="true"
                    dots="true"
                    infinite="true"
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    cssEase="linear"
                >
                    <div>
                        <h3>1</h3>
                        </div>
                        <div>
                        <h3>2</h3>
                        </div>
                        <div>
                        <h3>3</h3>
                        </div>
                        <div>
                        <h3>4</h3>
                    </div>
                    </Carousel>
            </div>
            <div>
                最新应用
                <Carousel
                    arrows="true"
                    dots="true"
                    infinite="true"
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    cssEase="linear"
                >
                    <div>
                        <img src="https://p0.meituan.net/dpmerchantpic/0f776c0dd56ed2d0113426309648dba11762409.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" alt=""/>
                        </div>
                        <div>
                        <h3><img src="https://p0.meituan.net/dpmerchantpic/0f776c0dd56ed2d0113426309648dba11762409.jpg%40watermark%3D1%26%26r%3D1%26p%3D9%26x%3D2%26y%3D2%26relative%3D1%26o%3D20" alt=""/></h3>
                        </div>
                        <div>
                        <h3>3</h3>
                        </div>
                        <div>
                        <h3>4</h3>
                    </div>
                    </Carousel>
            </div>
            <div>
                应用评分排行榜
                <Carousel
                    arrows="true"
                    dots="true"
                    infinite="true"
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    cssEase="linear"
                >
                    <div>
                        <div style={{display: 'flex', justifyContent: 'space-around'}}>
                        {
                        data && data.length > 0 && data.map((val, ind)=>{
                            if (ind < 4){
                                return (
                                    <div key={ind}>
                                        <img
                                            src={'http://ioe.thingsroot.com' + val.icon_image}
                                            alt=""
                                        />
                                        <span style={{textAlign: 'center', lineHeight: '40px'}}>{val.app_name}</span>
                                        <div style={{display: 'flex', justifyContent: 'space-around', paddingBottom: 5}}>
                                            <p>评价：☆☆☆☆☆</p>
                                            <p>价格：免费</p>
                                        </div>
                                        {console.log(val)}
                                    </div>
                                )
                            }
                        })
                    }
                        </div>
                        </div>
                        <div>
                        <h3>2</h3>
                        </div>
                    </Carousel>
            </div> */}
                <h3>全部应用</h3>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap'
                }}
            >
            {
                        data && data.length > 0 && data.map((val, ind)=>{
                            return (
                                // <LazyLoad
                                //     key={ind}
                                //     offsetTop={100}
                                // >
                                // <AppCard
                                //     app={val}
                                // />
                                // </LazyLoad>
                                // <AppCard
                                //     app={val}
                                //     key={ind}
                                // />
                                <div
                                    key={ind}
                                    onClick={()=>{
                                        this.props.history.push('/appitems/' + val.name)
                                    }}
                                    style={{width: '182px', height: '200px', border: '1px solid #ccc', borderRadius: '5px', marginTop: 10, cursor: 'pointer', borderTop: '2px solid green'}}
                                >
                                    <img
                                        src={'http://ioe.thingsroot.com' + val.icon_image}
                                        style={{width: '72px', padding: '10px', height: '72px', display: 'block',  margin: '0 auto'}}
                                        alt=""
                                    />
                                    <div style={{textAlign: 'center'}}>{val.app_name}</div>
                                    <div
                                        className="app_item_desc"
                                    >
                                        <div>描述.....</div>
                                        <div style={{textAlign: 'center'}}><Icon type="download" /> 412</div>
                                    </div>
                                    <div
                                        className="stats_and_offer"
                                    >
                                        <p>☆☆☆☆☆</p>
                                        <span>免费</span>
                                    </div>
                                </div>
                            )
                        })
                    }
            </div>
        </div>
        );
    }
}

export default AppStore;