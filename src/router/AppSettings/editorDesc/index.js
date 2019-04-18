import React, { PureComponent } from 'react';
import SimpleMDE from 'simplemde';
import marked from 'marked';
import highlight from 'highlight.js';
import 'simplemde/dist/simplemde.min.css';
import {inject, observer} from 'mobx-react';

@inject('store')
@observer
class EditorDesc extends PureComponent {
    state = {
        text: this.props.store.codeStore.editorContent
    };
    componentDidMount (){
        this.smde = new SimpleMDE({
            element: document.getElementById('editor').childElementCount,
            autofocus: true,
            autosave: true,
            previewRender: function (plainText) {
                return marked(plainText, {
                    renderer: new marked.Renderer(),
                    gfm: true,
                    pedantic: false,
                    sanitize: false,
                    tables: true,
                    breaks: true,
                    smartLists: true,
                    smartypants: true,
                    highlight: function (code) {
                        return highlight.highlightAuto(code).value;
                    }
                });
            }
        })
    }
    render () {
        return (
            <div className="editorDesc">
                <textarea
                    id="editor"
                    value={this.state.text}
                > </textarea>
            </div>
        );
    }
}

export default EditorDesc;