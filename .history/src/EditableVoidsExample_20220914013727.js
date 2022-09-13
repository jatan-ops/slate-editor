import React, { useState, useMemo, useRef } from 'react'
import { Transforms, createEditor, Descendant } from 'slate'
import { Slate, Editable, useSlateStatic, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { css } from '@emotion/css'

import RichEditor from './RichEditor'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Button, Icon, Toolbar } from './Components'

const EditableVoidsExample = () => {

  const editorRef = useRef()
  if (!editorRef.current) editorRef.current = withEditableVoids(withHistory(withReact(createEditor())))
  const editor = editorRef.current

  return (
    <Slate editor={editor} value={initialValue}>
      <Toolbar>
        <InsertEditableVoidButton />
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

  editor.isVoid = element => {
    return element.type === 'editable-void' ? true : isVoid(element)
  }

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
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <Container md={12} >
        <Row>
          <Col md={6} >
            <RichEditor />
          </Col>
          <Col>
            <RichEditor />
          </Col>
        </Row>
      </Container>
      {children}
    </div>
  )
}

const InsertEditableVoidButton = () => {
  const editor = useSlateStatic()
  return (
    <Button
      onMouseDown={event => {
        event.preventDefault()
        insertEditableVoid(editor)
      }}
    >
      <Icon>add</Icon>
    </Button>
  )
}

const initialValue = [
  {
    type: 'paragraph',
    children: [
      {
        text:
          'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.',
      },
    ],
  },
  {
    type: 'editable-void',
    children: [{ text: '' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
]

export default EditableVoidsExample