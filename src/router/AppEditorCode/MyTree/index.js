import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {message, Modal, Tree} from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';
const { TreeNode } = Tree;

@withRouter
@inject('store')
@observer
class MyTree extends Component {

    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            defaultExpandAll: true,
            autoExpandParent: false,
            selectedKeys: ['version'],
            arr: [],
            a: 1
        }
    }
    componentDidMount () {
        this.setState({
            a: 1,
            arr: []
        });
        this.getTree('#');
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.isChange !== nextProps.isChange){
            this.setState({
                a: 1,
                arr: []
            }, ()=>{
                console.log(this.state.arr);
                this.getTree('#')
            });
        }
    }

    getTree =  id => new Promise((resolve => {
        let data = [];
        http.get('/apis/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + id)
            .then(res=>{
                res.map((v)=>{
                    data.push(v);
                });
                resolve(this.format(data, this.state.a))
            });
    }));

    format = (list, a)=>{
        let arr = [];
        list && list.length > 0 && list.map((v, key)=>{
            key;
            if (v.children === true){
                this.getTree(v.id).then(data=>{
                    let a = {
                        children: data,
                        title: v.text,
                        isLeaf: !v.children,
                        type: v.type,
                        key: v.id
                    };
                    arr.push(a);
                })
            } else {
                let a = {
                    title: v.text,
                    isLeaf: !v.children,
                    type: v.type,
                    key: v.id
                };
                arr.push(a);
            }
        });
        if (a === 1) {
            let data = [
                {
                    title: this.props.appName,
                    isLeaf: false,
                    type: 'folder',
                    key: this.props.appName,
                    children: arr
                }
            ];
            console.log(arr)
            this.setState({
                arr: data,
                a: this.state.a + 1
            }, ()=>{
                this.props.store.codeStore.setTreeData(this.state.arr);
            });
        }
        this.setState({
            a: this.state.a + 1
        });

        return arr;
    };

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

    };

    onSelect = (selectedKeys, info) => {
        if (selectedKeys.length > 0) {
            if (info.node.props.dataRef.type !== 'folder') {
                if (this.props.store.codeStore.editorContent === this.props.store.codeStore.newEditorContent){
                    this.props.store.codeStore.setShowFileName(selectedKeys);
                    this.setState({ selectedKeys }, ()=>{
                        this.props.store.codeStore.setFileName(this.state.selectedKeys);
                    });
                    this.props.store.codeStore.setMyFolder(selectedKeys);
                    this.props.store.codeStore.setFolderType(info.node.props.dataRef.type);
                } else {
                    //保存提示
                    Modal.info({
                        title: '保存提示',
                        content: (
                            <div>
                                <p>'是否保存当前文件?'</p>
                            </div>
                        ),
                        onOk () {
                            let url = '/apis/api/method/app_center.editor.editor';
                            http.postToken(url + '?app=' + this.props.app +
                                '&operation=set_content&id=' + this.props.store.codeStore.fileName +
                                '&text=' + this.props.store.codeStore.newEditorContent)
                                .then(res=>{
                                    console.log(res);
                                    message.success('文件保存成功！')
                                })
                            this.props.store.codeStore.setShowFileName(selectedKeys);
                            this.setState({ selectedKeys }, ()=>{
                                this.props.store.codeStore.setFileName(this.state.selectedKeys);
                            });
                            this.props.store.codeStore.setMyFolder(selectedKeys);
                            this.props.store.codeStore.setFolderType(info.node.props.dataRef.type);
                        }
                    });
                }
                if (selectedKeys[0].indexOf('.') !== -1) {
                    let suffixName = '';
                    switch (selectedKeys[0].substr(selectedKeys[0].indexOf('.') + 1, selectedKeys[0].length)) {
                        case 'js' : suffixName = 'javascript'; break;
                        case 'html' : suffixName = 'html'; break;
                        case 'java' : suffixName = 'java'; break;
                        case 'py' : suffixName = 'python'; break;
                        case 'lua' : suffixName = 'lua'; break;
                        case 'xml' : suffixName = 'xml'; break;
                        case 'rb' : suffixName = 'ruby'; break;
                        case 'scss' : suffixName = 'sass'; break;
                        case 'less' : suffixName = 'sass'; break;
                        case 'md' : suffixName = 'markdown'; break;
                        case 'sql' : suffixName = 'mysql'; break;
                        case 'json' : suffixName = 'json'; break;
                        case 'ts' : suffixName = 'typescript'; break;
                        case 'css' : suffixName = 'css'; break;
                        default : suffixName = 'java'
                    }
                    this.props.store.codeStore.setSuffixName(suffixName);

                } else {
                    this.props.store.codeStore.setSuffixName('text');
                }
            } else {
                this.setState({ selectedKeys }, ()=>{
                    this.props.store.codeStore.setFileName(this.state.selectedKeys);
                });
                this.props.store.codeStore.setMyFolder(selectedKeys);
                this.props.store.codeStore.setFolderType(info.node.props.dataRef.type);
            }
        }
    };

    renderTreeNodes = data =>
        data.map(item => {

            if (item.children) {
                return (
                    <TreeNode
                        title={item.title}
                        key={item.key}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    title={item.title}
                    key={item.key}
                    dataRef={item}
                />
            );
        });

    render () {
        // const { appName } = this.props;
        return (
            <Tree
                className="draggable-tree"
                defaultExpandAll
                autoExpandParent
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                onSelect={this.onSelect}
                selectedKeys={this.state.selectedKeys}
            >
                {
                    this.state.arr.length > 0 ? this.renderTreeNodes(this.state.arr) : ''
                }
            </Tree>
        );
    }
}

export default MyTree;
