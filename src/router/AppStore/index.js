import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Tag, Input, Icon, Rate  } from 'antd';
const { Search } = Input;
import './style.scss';
import http from '../../utils/Server';
@withRouter
@inject('store')
@observer
class AppStore extends Component {
    constructor (props){
        super(props)
        this.state = {
            data: [],
            tag_list: [],
            add_tag_list: [],
            color: ['magenta', 'red', 'volcano', 'orange', 'gold', 'green', 'cyan', 'blue', 'geekblue', 'purple', '#f50', '#2db7f5', '#87d068', '#108ee9']
        }
    }

    componentDidMount (){
        http.get('/api/store_list').then(res=>{
            if (res.ok) {
                this.setState({data: res.data, filterData: res.data})
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
    addTag = (record)=>{
        const list = this.state.add_tag_list;
        if (list.filter(item=>item === record).length <= 0) {
        list.push(record)
        this.setState({
            add_tag_list: list
        }, ()=>{
            this.filterTag()
        })
        }

    }
    disableTag = (record)=>{
        const lists = this.state.add_tag_list.filter(item=>item !== record)
        this.setState({
            add_tag_list: lists
        }, ()=>{
            this.filterTag()
        })
    }
    newArr = (arr) => {
        return Array.from(new Set(arr))
    }
    filterTag = () =>{
        const list = this.state.filterData;
        const tagList = this.state.add_tag_list;
        let arr = [];
        if (tagList.length > 0) {
            tagList.map(item=>{
                const newArr = list.filter(val=>val.tags.indexOf(item.tag) !== -1)
                arr = arr.concat(newArr)
            })
            this.setState({
                data: this.newArr(arr)
            })
        } else {
            this.setState({
                data: list
            })
        }
    }
    searchApp = (e) => {
        const value = e.target.value.toLowerCase();
        const list = this.state.filterData.filter(item => item.app_name.toLowerCase().indexOf(value) !== -1)
        this.setState({
            data: list
        })
    }
    getRandomNumber = () => {
        return (Math.floor(Math.random() * (this.state.color.length - 1)))
    }
    render () {
        const { data, tag_list, add_tag_list } = this.state;
        return (
        <div className="AppStore">
            <div>
                <p className="appStore_title">冬笋云平台应用市场</p>
                <Search
                    placeholder="请输入应用名称"
                    onChange={e => this.searchApp(e)}
                    style={{ width: '60%', marginLeft: '20%', height: '50px' }}
                />
            </div>
            <div className="search">
                <span>标签列表: &nbsp;&nbsp;</span>
                {
                    tag_list && tag_list.length > 0 && tag_list.map((item, key)=>{
                        return (
                            <Tag
                                key={key}
                                color={item.color}
                                onClick={()=>{
                                    this.addTag(item)
                                }}
                            >{item.tag + ' (' + item.number + ')'}</Tag>
                        )
                    })
                }
            </div>
            <div className="the_selected_label">
            <span>已选标签: &nbsp;&nbsp;</span>
                {
                    add_tag_list && add_tag_list.length > 0 && add_tag_list.map((item, key)=>{
                        return (
                            <Tag
                                key={key}
                                color={item.color}
                                closable
                                onClose={()=>{
                                    this.disableTag(item)
                                }}
                            >{item.tag + ' (' + item.number + ')'}</Tag>
                        )
                    })
                }
            </div>
                <div className="all_app_title">
                    全部应用
                </div>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap'
                }}
            >
            {
                        data && data.length > 0 && data.map((val, ind)=>{
                            return (
                                <div
                                    className="app_items"
                                    key={ind}
                                    onClick={()=>{
                                        this.props.history.push('/appitems/' + val.name)
                                    }}
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
                                        <div style={{textAlign: 'center'}}><Icon type="download" /> {val.installed}</div>
                                    </div>
                                    <div
                                        className="stats_and_offer"
                                    >
                                        <div>
                                            <Rate
                                                value={val.star}
                                                disabled
                                                style={{fontSize: '7px', letteSspacing: '2px'}}
                                            />
                                        </div>
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