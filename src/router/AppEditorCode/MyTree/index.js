import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tree, Icon } from 'antd';
import { observer, inject } from 'mobx-react';
// import http from '../../../utils/Server';
const { TreeNode } = Tree;
const MyIcon = Icon.createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_1206200_whqt6igvsx.js'// 在 iconfont.cn 上生成
});

@withRouter
@inject('store')
@observer
class MyTree extends Component {

    constructor (props) {
        super(props);
        this.state = {
            expandedKeys: [],
            autoExpandParent: true
        }
    }

    // componentWillReceiveProps (nextProps) {
    //     if (this.props.store.codeStore.showFileName !== nextProps.showFileName) {
    //         this.setState({
    //             expandedKeys: [this.props.appName]
    //         })
    //     }
    // }

    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
            autoExpandParent: false
        });

    };

    renderTreeNodes = data =>
        data.map(item => {
            console.log(item.icon);
            if (item.children) {

                return (
                    <TreeNode
                        icon={
                            <MyIcon
                                style={{fontSize: 20}}
                                type={'icon-' + item.icon}
                            />
                        }
                        title={item.title}
                        key={item.key}
                        isLeaf={item.isLeaf}
                        dataRef={item}
                    >
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return (
                <TreeNode
                    icon={
                        <MyIcon
                            style={{fontSize: 20}}
                            type={item.icon !== 'file file-' ? 'icon-' + item.icon : 'icon-no'}
                        />
                    }
                    title={item.title}
                    key={item.key}
                    isLeaf={item.isLeaf}
                    dataRef={item}
                />
            );
        });

    render () {
        const { selectedKeys, treeData, onSelect } = this.props;
        return (
            <div>
                {
                    treeData.length > 0
                    ? <Tree
                        showIcon
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        onSelect={onSelect}
                        selectedKeys={selectedKeys}
                      >
                        {this.renderTreeNodes(treeData)}
                    </Tree> : ''
                }
            </div>
        );
    }
}

export default MyTree;
