import React, { PureComponent } from 'react'
import { withRouter } from 'react-router-dom';
import http from '../../../utils/Server';
import {Comment, Avatar, Modal, Input, Button, message, Popconfirm, Empty} from 'antd'
import { _getCookie } from '../../../utils/Session';
import './style.scss';
import intl from 'react-intl-universal';

const { TextArea } = Input;
@withRouter
class Issues extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            data: [],
            visible: false,
            comment: '',
            reply_to: null,
            type: ''
        }
    }
    componentDidMount () {
        this.getComments()
    }
    commentsRemove = (record) => {
        const data = {
            name: record.name
        }
        http.post('/api/store_comments_remove', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('appeditorcode.delete_successfully'))
                this.getComments()
            }
        })
    }
    getComments = () =>{
        const { name } = this.props.match.params;
        http.get('/api/store_comments_list?app=' + name).then(res=>{
            const obj = {};
            const arr = [];
            if (res.ok && res.data.length > 0) {
                const data = res.data;
                data.map((item)=>{
                    if (item.reply_to === null){
                        obj[item.name] = item;
                    } else {
                        arr.push(item)
                    }
                })
                this.filterComment(obj, arr)
            } else {
                this.setState({
                    data: []
                })
            }
        })
    }
    showModal = () => {
        this.setState({
          visible: true,
          reply_to: null,
          type: '问题'
        });
      };
      handleOk = () => {
          const {name} = this.props.match.params;
          const data = {
                app: name,
                reply_to: this.state.reply_to,
                title: this.state.comment,
                comment: this.state.comment
          }
          http.post('/api/store_comments_create', data).then(res=>{
              if (res.ok) {
                  this.getComments()
                  message.success(intl.get('appitems.comment_succeeded'))
              }
          })
        this.setState({
          visible: false,
          comment: ''
        })
      };
      handleCancel = () => {
        this.setState({
          visible: false,
          comment: ''
        });
      };
    filterComment = (obj, list) => {
        const arr = list;
        if (arr.length > 0) {
            arr.map(item=>{
                for (let i in obj){
                    if (obj[i].name === item.reply_to) {
                        if (obj[i].chidren === undefined) {
                            obj[i].chidren = [];
                        }
                        obj[i].chidren.push({...item, reply_to_id: item.owner})
                        if (obj[i].chidren && obj[i].chidren.length > 0) {
                            obj[i].chidren.map(val=>{
                                const chidren = arr.filter(items=> items.reply_to === val.name)
                                if (chidren.length > 0) {
                                    chidren.map((values) => {
                                        values.reply_to_id = item.owner;
                                        const index = arr.findIndex(val=> val === values)
                                        arr.splice(index, 1)
                                    })
                                    obj[i].chidren =  obj[i].chidren.concat(chidren)
                                }
                            })
                            obj[i].chidren.sort((a, b) => {
                                return new Date(a.creation) - new Date(b.creation)
                            })
                        }
                        const index = arr.findIndex(val=> val === item)
                        arr.splice(index, 1)
                    } else {
                        obj[i].chidren && obj[i].chidren.length > 0 && obj[i].chidren.map(chidrenItem=>{
                            if (chidrenItem.name === item.reply_to) {
                                obj[i].chidren.push({...item, reply_to_id: chidrenItem.owner})
                                const index = arr.findIndex(val=> val === item)
                                arr.splice(index, 1)
                            }
                        })
                    }
                }
            })
            this.filterComment(obj, arr)
        } else {
            const data = Object.values(obj);
            data.sort((a, b) =>{
                return new Date(b.creation) - new Date(a.creation)
            })
            this.setState({
                data
            })
        }
    }
    render () {
        const {data} = this.state;
        return (
            <div className="store_comments">
                <Button
                    className="store_comments_add"
                    onClick={this.showModal}
                    type="primary"
                >{intl.get('appitems.add_problem')}</Button>
                <div className="store_comments_title">
                    {intl.get('appitems.comments')}
                </div>
                <div className="store_comments_content">
                {
                    data && data.length > 0
                    ? data.map((item, key) => {
                        return (
                            <Comment
                                key={key}
                                actions={[
                                <span
                                    key="comment-nested-reply-to"
                                    onClick={()=>{
                                        this.setState({
                                            reply_to: item.name,
                                            visible: true,
                                            type: '回复'
                                        })
                                    }}
                                >{intl.get('appitems.reply')}</span>,
                                item.owner === _getCookie('user_id')
                                ? <Popconfirm
                                    title={intl.get('appitems.are_you_sure_you_want_to_delete_this_reply')}
                                    onConfirm={()=> {
                                        this.commentsRemove(item)
                                    }}
                                    // onCancel={cancel}
                                    okText={intl.get('common.sure')}
                                    cancelText={intl.get('common.cancel')}
                                  >
                                    <span>{intl.get('appdetails.delete')}</span>
                                </Popconfirm>
                                : ''
                                ]}
                                author={<a>{item.owner}</a>}
                                avatar={
                                <Avatar style={{ backgroundColor: '#87d068' }}>{item.owner && item.owner[0].toUpperCase()}</Avatar>
                                }
                                content={
                                <p>
                                    {item.comment}
                                </p>
                                }
                            >
                                {item.chidren && item.chidren.length > 0 && item.chidren.map((val, ind) => {
                                    return (
                                        <Comment
                                            key={ind}
                                            actions={[
                                                <span
                                                    key="comment-nested-reply-to"
                                                    onClick={()=>{
                                                        this.setState({
                                                            visible: true,
                                                            reply_to: val.name
                                                        })
                                                    }}
                                                >{intl.get('appitems.reply')}</span>,
                                                val.owner === _getCookie('user_id')
                                                ? <Popconfirm
                                                    title={intl.get('appitems.are_you_sure_you_want_to_delete_this_reply')}
                                                    onConfirm={()=> {
                                                        this.commentsRemove(val)
                                                    }}
                                                    // onCancel={cancel}
                                                    okText={intl.get('common.sure')}
                                                    cancelText={intl.get('common.cancel')}
                                                  >
                                                    <span>{intl.get('appdetails.delete')}</span>
                                                </Popconfirm>
                                                : ''
                                            ]}
                                            author={<a>{val.owner}</a>}
                                            avatar={
                                            <Avatar style={{ backgroundColor: '#f56a00' }}>
                                                {val.owner[0].toUpperCase()}
                                            </Avatar>
                                            }
                                            content={
                                                <div>
                                                    {val.reply_to_id ? <span>{intl.get('appitems.reply')} <a>{val.reply_to_id}</a>  :   </span> : ''}
                                                    <span>
                                                        {val.comment}
                                                    </span>
                                                </div>
                                            }
                                        >
                                      </Comment>
                                    )
                                })}
                            </Comment>
                        )
                    })
                    : <Empty
                        style={{
                            marginTop: '100px'
                        }}
                        description={
                            <span>{intl.get('appitems.no_comment_yet')}</span>
                        }
                      />
                }
                </div>
                <Modal
                    title={intl.get('appitems.please_enter_a_comment')}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    destroyOnClose
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    <TextArea
                        rows={4}
                        onChange={(val)=>{
                            this.setState({
                                comment: val.target.value
                            })
                        }}
                    />
                </Modal>
            </div>
        )
    }
}

export default Issues