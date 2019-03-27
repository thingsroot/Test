import React, { PureComponent } from 'react';
import SimpleMDE from 'simplemde';
import marked from 'marked';
import highlight from 'highlight.js';
import 'simplemde/dist/simplemde.min.css';
class EditorDesc extends PureComponent {

    componentDidMount (){
        console.log(document.getElementById('editor'))
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
                <textarea id="editor"> </textarea>
            </div>
        );
    }
}

export default EditorDesc;