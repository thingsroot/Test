import React, { PureComponent } from 'react'
import {Tag, Icon} from 'antd';
import intl from 'react-intl-universal';
import './style.scss';
class TagsEdit extends PureComponent {
    constructor (props) {
        super(props)
        this.state = {
            tags_list: [],
            visible: false
        }
    }
    render () {
        const {tags_list} = this.props;
        return (
            <div
                className="tags_edit_wrap"
            >
                <div className="tags_title">
                    {
                        tags_list && tags_list.length > 0 && tags_list.split(',').length > 4
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