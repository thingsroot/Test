import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { Tag, Input, Icon, Rate, Button, Select } from 'antd';
import './style.scss';
import http from '../../utils/Server';
import { _getCookie } from '../../utils/Session';
import intl from 'react-intl-universal';

const { Search } = Input;
const { Option } = Select;
      function compare (propertyName) {
        return function (object1, object2) {
          var value1 = object1[propertyName];
          var value2 = object2[propertyName];
          if (value2 < value1) {
            return 1;
          } else if (value2 > value1) {
            return -1;
          } else {
            return 0;
          }
        }
    }
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
            visivle: false,
            color: ['magenta', 'red', 'volcano', 'orange', 'gold', 'green', 'cyan', 'blue', 'geekblue', 'purple', '#f50', '#2db7f5', '#87d068', '#108ee9']
        }
    }

    componentDidMount (){
        http.get('/api/store_list').then(res=>{
            if (res.ok) {
                if (res.data.length > 0 ) {
                    const arr = [];
                    res.data.map(item=>{
                        if (arr.indexOf(item.category) === -1 && item.category !== null) {
                            arr.push(item.category)
                        }
                    })
                    this.setState({data: res.data, filterData: res.data, category: arr})
                }
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
    handleChange = (val) => {
        const data = this.state.filterData.filter(item=> item)
        if (val === 'all') {
            this.setState({
                data
            })
        } else {
            const data = this.state.filterData.filter(item=> item.category === val)
            this.setState({
                data
            })
        }
    }
    dataSort = (val)=>{
        const arr = this.state.data;
        arr.sort(compare(val))
        this.setState({
            data: arr
        })
    }
    render () {
        const { data, tag_list, add_tag_list, category } = this.state;
        return (
        <div className="AppStore">
            {
                Number(_getCookie('is_developer')) !== 1
                ? <div className="app_developer_button">
                    <Button
                        onClick={()=>{
                            this.props.history.push('/appdeveloper')
                        }}
                    >{intl.get('developer.apply_to_be_a_developer')}</Button>
                    </div>
                : ''
            }
            <div>
                <p className="appStore_title">{intl.get('appstore.FreeIOE_application_market')}</p>
                <Search
                    placeholder={intl.get('developer.enter_application_name')}
                    onChange={e => this.searchApp(e)}
                    style={{ width: '60%', marginLeft: '20%', height: '50px' }}
                />
            </div>
            <div className="search">
                {
                    tag_list && tag_list.length >= 8
                    ? <div
                        className="tags_icon"
                        style={{cursor: 'pointer'}}
                        onClick={()=>{
                            this.setState({
                                visible: !this.state.visible
                            })
                        }}
                      >
                            {intl.get('appedit.To_view_more')}&nbsp;&nbsp;
                            <Icon type={this.state.visible ? 'down' : 'right'}/>
                    </div>
                    : ''
                }
                <div className="appstore_tags_list">
                    <div className="appstore_tags_list_min">
                        <span>{intl.get('appitems.label')}:</span>
                        <div>
                            {
                                tag_list && tag_list.length > 0 && tag_list.map((item, key)=>{
                                    if (key < 8) {
                                        return (
                                            <Tag
                                                key={key}
                                                color={item.color}
                                                onClick={()=>{
                                                    this.addTag(item)
                                                }}
                                            >{item.tag + ' (' + item.number + ')'}</Tag>
                                        )
                                    }
                                })
                            }
                        </div>
                    </div>
                    <div className={!this.state.visible ? 'appstore_tags_list_max' : ''}>
                    {
                        tag_list && tag_list.length > 0 && tag_list.map((item, key)=>{
                            if (key >= 10) {
                                return (
                                    <Tag
                                        key={key}
                                        color={item.color}
                                        onClick={()=>{
                                            this.addTag(item)
                                        }}
                                    >{item.tag + ' (' + item.number + ')'}</Tag>
                                )
                            }
                        })
                    }
                    </div>
                </div>
            </div>
            {
                add_tag_list && add_tag_list.length > 0
                ? <div className="the_selected_label">
                    <span>{intl.get('appstore.selected_Tags')}: &nbsp;&nbsp;</span>
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
                : ''
            }
                <div className="all_app_title">
                    {intl.get('appstore.all_applications')}
                </div>
            <div
                className="all_app_content"
            >
                <div className="all_app_filter">
                    <span>{intl.get('appstore.classification')}:</span>
                    &nbsp;&nbsp;
                    <Select
                        defaultValue={intl.get('common.all')}
                        style={{ width: 120 }}
                        onChange={this.handleChange}
                    >
                        <Option value="all">{intl.get('common.all')}</Option>
                        {
                            category && category.length > 0 && category.map((item, key) => {
                                return (
                                    <Option
                                        value={item}
                                        key={key}
                                    >{item}</Option>
                                )
                            })
                        }
                    </Select>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span>{intl.get('appstore.The_sorting')}:</span>
                    &nbsp;&nbsp;
                    <Select
                        defaultValue={intl.get('appstore.The_default_sort')}
                        style={{ width: 120 }}
                        onChange={this.dataSort}
                    >
                        <Option value="app_name">{intl.get('common.name')}</Option>
                        {/* <Option value="description">描述</Option> */}
                        <Option value="creation">{intl.get('appdetails.creation_time')}</Option>
                        <Option value="modified">{intl.get('appdetails.update_time')}</Option>
                        {/* <Option value="developer">应用开发者</Option> */}
                    </Select>
                </div>
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
                                        alt=""
                                    />
                                    <div className="app_title_and_developer">
                                        <p>{val.app_name}</p>
                                        <span>{val.user_info.dev_name}</span>
                                    </div>
                                    <div
                                        className="app_item_desc"
                                    >
                                        <div>
                                            {
                                                val.tags && val.tags.split(',').length > 0 && val.tags.split(',').map((item, key)=>{
                                                    return (
                                                        <Tag
                                                            color="gold"
                                                            key={key}
                                                        >{item}</Tag>
                                                    )
                                                })
                                            }
                                        </div>
                                        <div style={{textAlign: 'center'}}><Icon type="download" /> {val.installed}</div>
                                    </div>
                                    <div
                                        className="stats_and_offer"
                                    >
                                        <div>
                                            <Rate
                                                value={val.star}
                                                disabled
                                                size="small"
                                                style={{fontSize: '14px', letteSspacing: '2px'}}
                                            />
                                        </div>
                                        <span>{intl.get('appedit.free')}</span>
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