import React, { useState, useMemo, createContext, useContext } from 'react'
import { Transforms, createEditor, Descendant } from 'slate'
import { Slate, Editable, useSlateStatic, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import Toolbar from './Components'

import RichEditor from './RichEditor'

import Box from "@material-ui/core/Box";

import UserContext from './User-Context'

const EditableVoidsExample = () => {

  const editor = useMemo(
    () => withEditableVoids(withHistory(withReact(createEditor())))
  ,[])

  return (
    <Slate 
      editor={editor} 
      value={initialValue}
      onChange={value => {
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        )
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value)
          localStorage.setItem('slate-content', content)
        }
      }}
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
          
      <Box pl={1}>
        <Editable
          renderElement={props => {
            return <UserContext.Provider value={editor}>      
              <Element {...props} />
            </UserContext.Provider>
          }}
          placeholder="Enter some text..."
        />
      </Box>
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
    <div {...attributes} contentEditable={false}>
      <RichEditor />
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
  },
]

export default EditableVoidsExample