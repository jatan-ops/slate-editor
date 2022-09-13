import React, { useState, useMemo, useRef } from 'react'
import { Transforms, createEditor } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import Toolbar from './Components'

import RichEditor from './RichEditor'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

const EditableVoidsExample = () => {

  let editorRef = useRef()
  if (!editorRef.current) editorRef.current = withEditableVoids(withHistory(withReact(createEditor())))
  const editor = editorRef.current

  return (
    <Slate 
      editor={editor} 
      value={initialValue}
      // onChange={value => {
      //   const isAstChange = editor.operations.some(
      //     op => 'set_selection' !== op.type
      //   )
      //   if (isAstChange) {
      //     // Save the value to Local Storage.
      //     const content = JSON.stringify(value)
      //     localStorage.setItem('parent-content', content)
      //   }
      // }}
    >
      <Toolbar>
        <button
          onMouseDown={event => {
            event.preventDefault()
            insertEditableVoid(editor)
          }}
        >
          add
        </button>
      </Toolbar>
      <Editable
        renderElement={props => <Element {...props} />}
        placeholder="Enter some text..."
      />
    </Slate>
  )
}

const withEditableVoids = editor => {
  const { isVoid } = editor

  editor.isVoid = element => element.type === 'editable-void' ? true : isVoid(element)

  return editor
}

const insertEditableVoid = editor => {
  const text = { text: '' }
  const voidNode = {
    type: 'editable-void',
    children: [text],
  }
  Transforms.insertNodes(editor, voidNode)
}

const Element = props => {
  const { attributes, children, element } = props

  switch (element.type) {
    case 'editable-void':
      return <EditableVoid {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const EditableVoid = ({ attributes, children, element }) => {

  return (      
    <div {...attributes}>
      <RichEditor />
      {/* <Container>
        <Row>
          <Col md={6} >
            <RichEditor />
          </Col>
        </Row>
        <Row>
          <Col md={6} >
            <RichEditor />
          </Col>
        </Row>
      </Container> */}
      {children}      
    </div>
  )
}

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text:
          'This is parent editor',
      },
    ],
  }
]

export default EditableVoidsExample