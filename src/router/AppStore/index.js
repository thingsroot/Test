import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Carousel } from 'antd';
//import { LazyLoad } from 'react-lazy-load';
// import AppCard from '../../common/AppCard';
// import Developer from '../Developer';
import './style.scss';
import http from '../../utils/Server';
@withRouter
@inject('store')
@observer
class AppStore extends Component {
    constructor (props){
        super(props)
        this.state = {
            data: []
        }
    }

    componentDidMount (){
        // let arr = ['aaaa', 'bbb', 'eee', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff', 'fff']
        // this.setState({data: arr})
        http.get('/api/store_list').then(res=>{
            console.log(res)
            this.setState({data: res.data})
            console.log(res.data)
        })
    }

    render () {
        const { data } = this.state;
        return (
        <div className="AppStore">
            <div className="search">
                search
            </div>
            <div>
                <p>应用下载TOP榜</p>
                <div>
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
                                        <p style={{textAlign: 'center'}}>{val.app_name}</p>
                                        {/* // <h6 style={{textAlign: 'center'}}>xxx次下载</h6> */}
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
            </div>
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
                                    style={{width: '21%', border: '1px solid #ccc', borderRadius: '5px', marginTop: 10, cursor: 'pointer', borderTop: '2px solid green'}}
                                >
                                    <img
                                        src={'http://ioe.thingsroot.com' + val.icon_image}
                                        style={{width: '150px', padding: '10px', height: '150px', display: 'block',  margin: '0 auto'}}
                                        alt=""
                                    />
                                    <h4 style={{textAlign: 'center', padding: '10px 0', borderTop: '1px solid #ccc'}}>{val.app_name}</h4>
                                    <h6 style={{textAlign: 'center'}}>xxx次下载</h6>
                                    <div style={{display: 'flex', justifyContent: 'space-around', paddingBottom: 5}}>
                                        <p>评价：☆☆☆☆☆</p>
                                        <p>价格：免费</p>
                                    </div>
                                </div>
                            )
                        })
                    }
        </div>
        );
    }
}

export default AppStore;