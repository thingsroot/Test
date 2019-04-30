import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tree } from 'antd';
import { observer, inject } from 'mobx-react';
import http from '../../../utils/Server';
const { TreeNode } = Tree;
const DirectoryTree = Tree.DirectoryTree;

function format (list) {
    let data = [];
    list && list.length > 0 && list.map((item)=>{
        if (item.children) {
            data.push({
                title: item.text,
                key: item.id,
                // type: item.type,
                isLeaf: false
                // children: item.childrenData
            })
        } else {
            data.push({
                title: item.text,
                key: item.id,
                // type: item.type,
                isLeaf: true
            })
        }
    });
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
            selectedKeys: ['version'],
            resData: [],
            treeData: []
        }
    }
    componentDidMount () {
        let resData = [];
        this.getTree(resData);
        this.getTree(resData).then((res)=>{
            let data = format(res);
            console.log(data);
            this.props.store.codeStore.setTreeData(data)
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps){
        if (this.props.isChange !== nextProps.isChange){
            let resData = [];
            this.getTree(resData);
            this.getTree(resData).then((resData)=>{
                console.log(resData);
                let data = format(resData);
                console.log(data);
                this.props.store.codeStore.setTreeData(data)
            })
        }
    }

    onLoadData = treeNode => new Promise((resolve) => {
        if (treeNode.props.children) {
            resolve();
            return;
        }
        let data = [];
        http.get('/home/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + treeNode.props.eventKey)
            .then(res=> {
                data = res;
            });
        setTimeout(() => {
            treeNode.props.dataRef.children = format(data);

            this.setState({
                treeData: [...this.state.treeData]
            });
            resolve();
        }, 1000);
    });
    renderTreeNodes = data => data.map((item) => {
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
                {...item}
                dataRef={item}
                key={item.key}
            />
        )
    });

    getTree = (resData)=>{
        return new Promise((resolve, reject)=>{
            console.log(resolve, reject);
            http.get('/home/api/method/app_center.editor.editor?app=' + this.props.match.params.app + '&operation=get_node&id=' + '#')
                .then(res=>{
                    resData = res;
                    if (resData.length > 0) {
                        resolve(resData);
                        console.log(resData)
                    }
                });
        })
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
    };

    render () {
        return (
            <DirectoryTree
                className="draggable-tree"
                defaultExpandAll={this.state.defaultExpandAll}
                onExpand={this.onExpand}
                expandedKeys={this.state.expandedKeys}
                onSelect={this.onSelect.bind(this)}
                selectedKeys={this.state.selectedKeys}
                loadData={this.onLoadData}
            >
                {this.renderTreeNodes(this.props.store.codeStore.treeData)}
            </DirectoryTree>
        );
    }
}

export default MyTree;
