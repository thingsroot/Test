import React, { PureComponent } from 'react'
import {Tag, Icon} from 'antd';
import './style.scss';
class TagsEdit extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            tags_list: this.props.tags_list,
            visible: true
        }
    }

    render () {
        const {tags_list} = this.props;
        console.log(tags_list)
        return (
            <div
                className="tags_edit_wrap"
            >
                <div className="tags_title">
                    {
                        tags_list && tags_list.length > 0 && tags_list.split(',').length > 3
                        ? <div
                            className="tags_icon"
                            style={{cursor: 'pointer'}}
                            onClick={()=>{

                                this.setState({
                                    visible: !this.state.visible
                                })
                            }}
                          >
                                查看更多&nbsp;&nbsp;
                                <Icon type={this.state.visible ? 'down' : 'right'}/>
                          </div>
                        : ''
                    }
                    {
                        tags_list && tags_list.length > 0 && tags_list.split(',').map((item, key)=>{
                            if (key < 4) {
                                return (
                                    <Tag key={key}>{item}</Tag>
                                )
                            }
                        })
                    }
                </div>
                <div className="tags_select">
                {
                        this.state.visible
                        ? <div>
                            {
                                tags_list && tags_list.length > 0 && tags_list.split(',').map((item, key)=>{
                                    if (key > 3) {
                                        return (
                                            <Tag key={key}>{item}</Tag>
                                        )
                                    }
                                })
                            }
                        </div>
                        :  ''
                }
                </div>
            </div>
        )
    }
}

export default TagsEdit