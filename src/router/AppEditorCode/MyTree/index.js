import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tree } from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';
const { TreeNode } = Tree;

function format (list) {
    let data = [];
    for (var i = 0; i < list.length; i++){
        if (list[i].children){
            if (list[i].childrenData){
                data.push({
                    title: list[i].text,
                    key: list[i].id,
                    type: list[i].type,
                    isLeaf: false,
                    children: format(list[i].childrenData)
                })
            }
        } else {
            data.push({
                title: list[i].text,
                key: list[i].id,
                type: list[i].type,
                isLeaf: true
            })
        }
    }
    return data;
}
@withRouter
@inject('store')
@observer
class MyTree extends Component {

    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            defaultExpandAll: true,
            autoExpandParent: true,
            selectedKeys: ['version']
        }
    }
    componentDidMount () {
        this.getTree();
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.isChange !== nextProps.isChange){
            this.getTree();
        }
    }
    getTree = ()=>{
        http.get('/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + '#')
            .then(res=>{
                let resData = res;
                resData.map((v)=>{
                    if (v.children) {
                        http.get('/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + v.id)
                            .then(res=>{
                                v['childrenData'] = res;
                                let data = format(resData);
                                console.log(data);
                                this.props.store.codeStore.setTreeData(data)
                            });
                    }
                });
            });
    };
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

    };
    onSelect = (selectedKeys, info) => {
        this.setState({ selectedKeys }, ()=>{
            this.props.store.codeStore.setFileName(this.state.selectedKeys);
        });
        this.props.store.codeStore.setMyFolder(selectedKeys);
        this.props.store.codeStore.setFolderType(info.node.props.type);
        console.log(this.props.store.codeStore.treeData)
    };


    renderTreeNodes = data => data.map((item, key) => {
        key;
        if (item.children) {
            return (
                <TreeNode
                    title={item.title}
                    key={item.key}
                    type={item.type}
                    isLeaf={item.isLeaf}
                >
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        }
        return (
            <TreeNode
                {...item}
                isLeaf={item.isLeaf}
                key={item.key}
            />
        )
    });

    render () {
        const { appName } = this.props;
        return (
            <Tree
                className="draggable-tree"
                defaultExpandAll={this.state.defaultExpandAll}
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                onSelect={this.onSelect.bind(this)}
                selectedKeys={this.state.selectedKeys}
                draggable
                blockNode
            >
                <TreeNode
                    defaultExpandAll
                    title={appName}
                    key={appName}
                >
                    {this.renderTreeNodes(this.props.store.codeStore.treeData)}
                </TreeNode>

            </Tree>
        );
    }
}

export default MyTree;
