import React, {useState, useMemo, useContext, useEffect, useRef  } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, Slate, useSlate, useSlateStatic } from "slate-react";
import { createEditor, Editor, Transforms } from "slate";
import { withHistory } from 'slate-history'
import Toolbar from './Components'

import { v4 as uuidv4 } from 'uuid';

import Box from "@material-ui/core/Box";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import ToggleButton from "@material-ui/lab/ToggleButton";
import './index.css'

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const RichEditor = () => {

  let editorRef = useRef()
  if (!editorRef.current) editorRef.current = withHistory(withReact(createEditor()))
  const editor = editorRef.current

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])

  const [instanceid, setInstanceId] = useState(uuidv4())

  return ( 
    <Slate
      editor={editor}
      value={initialValue}
      // onChange={value => {
      //   const isAstChange = editor.operations.some(
      //     op => 'set_selection' !== op.type
      //   )
      //   if (isAstChange) {
      //     const content = JSON.stringify(value)
      //     localStorage.setItem(instanceid, content)
      //   }
      // }}
    > 
      <Toolbar>
        <MarkButton format="bold">
          <FormatBoldIcon />
        </MarkButton>
        <MarkButton format="italic">
          <FormatItalicIcon />
        </MarkButton>
        <MarkButton format="underline">
          <FormatUnderlinedIcon />
        </MarkButton>
        <MarkButton format="code">
          <CodeIcon />
        </MarkButton>
        <BlockButton format="heading-one">
          <LooksOneIcon />
        </BlockButton>
        <BlockButton format="heading-two">
          <LooksTwoIcon />
        </BlockButton>
        <BlockButton format="block-quote">
          <FormatQuoteIcon />
        </BlockButton>
        <BlockButton format="numbered-list">
          <FormatListNumberedIcon />
        </BlockButton>
        <BlockButton format="bulleted-list">
          <FormatListBulletedIcon />
        </BlockButton>
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text???"
        spellCheck        
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>  
  );
};

// ---block---

const Element = (props) => {

  const { attributes, children, element } = props

  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const BlockButton = ({ format, children }) => {
  const editor = useSlate();
  return (
    <Box ml={1} mt={1}>
      <ToggleButton
        value={format}
        selected={isBlockActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
        style={{ lineHeight: 1 }}
      >
        {children}
      </ToggleButton>
    </Box>
  );
};

const isBlockActive = (editor, format) => {
  //At any given Location or Span in the editor provided by at (default is the current selection) - https://docs.slatejs.org/api/nodes/editor#editor.nodes-less-than-t-extends-node-greater-than-editor-editor-options-greater-than-generator-less
  // in the selection, it will check if any of the blocks are of eg block-quote, in that cases, !!match will be true all selected blocks will be reverted to para
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });
  return !!match;
};

const toggleBlock = (editor, format) => {  
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

//---mark---

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const MarkButton = ({ format, children }) => {
  const editor = useSlate();
  return (
    <Box ml={1} mt={1}>
      <ToggleButton
        value={format}
        selected={isMarkActive(editor, format)}
        onMouseDown={event => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
        style={{ lineHeight: 1 }}
      >
        {children}
      </ToggleButton>
    </Box>
  );
};

const isMarkActive = (editor, format) => {
  //Get the marks that would be added to text at the current selection
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export default RichEditor;

