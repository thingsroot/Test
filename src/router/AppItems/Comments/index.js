import React, { PureComponent } from 'react'
import http from '../../../utils/Server';
import { withRouter } from 'react-router-dom';
import { Comment, Tooltip, Avatar, Rate, Empty, Button, Modal, Input, message, Popconfirm  } from 'antd';
import './style.scss';
import { _getCookie } from '../../../utils/Session';
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
            console.log(res)
            if (res.ok && res.data.length > 0) {
                this.setState({
                    data: res.data
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
                message.success('删除成功！')
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
                  message.success('评论成功！')
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
                >添加评论</Button>
                <div className="store_reviews_title">
                    评分与评论
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
                                        title="确定要删除此次评分吗?"
                                        okText="确定"
                                        cancelText="取消"
                                        onConfirm={()=>{
                                            this.removeReviews(item)
                                        }}
                                      >
                                        <span>删除</span>
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
                                            主题：{item.title}
                                        </p>
                                        <p style={{marginTop: '10px', marginLeft: '20px', color: '#000'}}>
                                            内容：{item.content}
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
                            暂无评分!
                          </span>}
                        style={{marginTop: '100px'}}
                      />
                }
                </div>
                <Modal
                    title="请输入评星及评论"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    okText="确定"
                    cancelText="取消"
                >
                    请选择评星:
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
                    请输入主题：
                    <Input
                        text="text"
                        onChange={(e)=>{
                            this.setState({title: e.target.value})
                        }}
                    />
                    请输入评论:
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