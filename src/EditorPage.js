import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, Modifier, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import './EditorPage.css'; 

const styleMap = {
    'BOLD': {
        fontWeight: 'bold',
      },
      'RED': {
        color: 'red',
      },
      'UNDERLINE': {
        textDecoration: 'underline',
      },
};

function EditorPage() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    const savedContent = localStorage.getItem('savedContent');
    if (savedContent) {
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent))));
    }
  }, []);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    localStorage.setItem('savedContent', JSON.stringify(convertToRaw(content)));
  };

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed() || chars !== ' ') {
      return 'not-handled';
    }
  
    const currentContent = editorState.getCurrentContent();
    const startKey = selection.getStartKey();
    const currentBlock = currentContent.getBlockForKey(startKey);
    const blockText = currentBlock.getText();
    const blockType = currentBlock.getType();
  
    let newContentState = currentContent;
    let newEditorState = editorState;
  
    if (blockText === '#' && blockType !== 'header-one') {
      newContentState = Modifier.replaceText(newContentState, selection.merge({
        anchorOffset: 0,
        focusOffset: 1,
      }), '');
      newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
      newEditorState = RichUtils.toggleBlockType(newEditorState, 'header-one');
    } else if (blockText === '*' && blockType !== 'BOLD') {
      newContentState = Modifier.replaceText(newContentState, selection.merge({
        anchorOffset: 0,
        focusOffset: 1,
      }), '');
      newEditorState = RichUtils.toggleInlineStyle(EditorState.push(editorState, newContentState, 'change-inline-style'), 'BOLD');
    } else if (blockText === '**' && blockType !== 'RED') {
      newContentState = Modifier.replaceText(newContentState, selection.merge({
        anchorOffset: 0,
        focusOffset: 2,
      }), '');
      newEditorState = RichUtils.toggleInlineStyle(EditorState.push(editorState, newContentState, 'change-inline-style'), 'RED');
    } else if (blockText === '***' && blockType !== 'UNDERLINE') {
      newContentState = Modifier.replaceText(newContentState, selection.merge({
        anchorOffset: 0,
        focusOffset: 3,
      }), '');
      newEditorState = RichUtils.toggleInlineStyle(EditorState.push(editorState, newContentState, 'change-inline-style'), 'UNDERLINE');
    } else {
      return 'not-handled';
    }
  
    setEditorState(newEditorState);
    return 'handled';
  };

  

  return (
    <>
    <div className="editorHeader">
        <h2 className="editorTitle">Demo editor</h2>
        <button className="saveButton" onClick={saveContent}>Save</button>
      </div>
      <div className="editorContainer">
        
      <Editor
        customStyleMap={styleMap}
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={onChange}
        handleBeforeInput={(chars) => handleBeforeInput(chars, editorState)}
      />
    </div>
    </>
  );
}

export default EditorPage;
