import React, { PureComponent } from 'react'
import http from '../../../utils/Server';
import { withRouter } from 'react-router-dom';
import { Comment, Tooltip, Avatar, Rate, Empty, Button, Modal, Input, message, Popconfirm  } from 'antd';
import './style.scss';
import { _getCookie } from '../../../utils/Session';
import intl from 'react-intl-universal';

const { TextArea } = Input;
@withRouter
class Comments extends PureComponent {
    constructor (props) {
        super(props)

        this.state = {
            visible: false,
            star: 5
        }
    }
    componentDidMount () {
        this.getReviews()
    }
    getReviews = () => {
        const {name} = this.props.match.params;
        http.get('/api/store_reviews_list?app=' + name).then(res=>{
            if (res.ok && res.data.length > 0) {
                this.setState({
                    data: res.data
                })
            } else {
                this.setState({
                    data: []
                })
            }
        })
    }
    removeReviews = (record)=> {
        const data = {
            name: record.name
        }
        http.post('/api/store_reviews_remove', data).then(res=>{
            if (res.ok) {
                message.success(intl.get('appeditorcode.delete_successfully'))
                this.getReviews()
            }
        })
    }
    showModal = () => {
        this.setState({
          visible: true
        });
      };
      handleOk = () => {
          const {name} = this.props.match.params;
          const data = {
                app: name,
                star: this.state.star,
                title: this.state.title,
                content: this.state.comment
          }
          http.post('/api/store_reviews_create', data).then(res=>{
              if (res.ok) {
                  this.getReviews()
                  message.success(intl.get('appitems.comment_succeeded'))
              }
          })
        this.setState({
          visible: false
        })
      };
      handleCancel = () => {
        this.setState({
          visible: false
        });
      };
    render () {
        const { data } = this.state;
        return (
            <div className="store_reviews">
                <Button
                    className="store_reviews_add"
                    onClick={this.showModal}
                    type="primary"
                >{intl.get('appitems.add_comments')}</Button>
                <div className="store_reviews_title">
                    {intl.get('appitems.ratings_and_comments')}
                </div>
                <div className="store_reviews_content">
                {
                    data && data.length > 0
                    ? data.map((item, key) => {
                        return (
                            <Comment
                                key={key}
                                actions={[
                                    item.owner === _getCookie('user_id')
                                    ? <Popconfirm
                                        title={`${intl.get('appitems.are_you_sure_you_want_to_delete_this_rating')}?`}
                                        okText={intl.get('common.sure')}
                                        cancelText={intl.get('common.cancel')}
                                        onConfirm={()=>{
                                            this.removeReviews(item)
                                        }}
                                      >
                                        <span>{intl.get('appdetails.delete')}</span>
                                    </Popconfirm>
                                    : ''
                                ]}
                                author={
                                <a
                                    style={{
                                        marginLeft: '10px'
                                    }}
                                >{item.owner}</a>}
                                avatar={
                                    <Avatar style={{ backgroundColor: '#87d068' }}>{item.owner[0].toUpperCase()}</Avatar>
                                }
                                content={
                                    <div
                                        style={{
                                            marginLeft: '10px',
                                            color: '#ccc',
                                            fontSize: '12px'
                                        }}
                                    >
                                        <Tooltip title={item.creation.split('.')[0]}>
                                            <span>{item.creation.split('.')[0]}</span>
                                        </Tooltip>
                                        <p style={{marginTop: '10px', color: '#000'}}>
                                            {intl.get('appitems.theme')}：{item.title}
                                        </p>
                                        <p style={{marginTop: '10px', marginLeft: '20px', color: '#000'}}>
                                            {intl.get('appitems.content')}：{item.content}
                                        </p>
                                </div>
                                }
                                datetime={
                                    <Rate
                                        value={item.star}
                                        disabled
                                        style={{
                                            fontSize: '16px',
                                            marginLeft: '10px',
                                            marginTop: '-5px'
                                        }}
                                    />
                                }
                            />
                        )
                    })
                    : <Empty
                        description={<span>
                            {intl.get('appitems.no_score_yet')}
                          </span>}
                        style={{marginTop: '100px'}}
                      />
                }
                </div>
                <Modal
                    title={intl.get('appitems.please_enter_comments_and_comments')}
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    okText={intl.get('common.sure')}
                    cancelText={intl.get('common.cancel')}
                >
                    {intl.get('appitems.please_select_star_rating')}:
                    <Rate
                        onChange={(val)=>{
                            this.setState({
                                star: val
                            })
                        }}
                        style={{
                            fontSize: '16px',
                            marginLeft: '10px',
                            marginTop: '-5px'
                        }}
                    />
                    <br />
                    {intl.get('appitems.please_enter_a_subject')}：
                    <Input
                        text="text"
                        onChange={(e)=>{
                            this.setState({title: e.target.value})
                        }}
                    />
                    {intl.get('appitems.please_enter_a_comment')}
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

export default Comments