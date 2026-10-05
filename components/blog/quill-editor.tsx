'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamic import to avoid SSR issues (Quill requires window/DOM)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => (
    <div className="h-64 border rounded-lg animate-pulse bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Loading editor...</p>
    </div>
  ),
})

interface QuillEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}

export function QuillEditor({
  value,
  onChange,
  placeholder = 'Write your blog content here...',
  readOnly = false,
  className = '',
}: QuillEditorProps) {
  // Memoize modules to prevent re-initialization on every render
  const modules = useMemo(
    () => ({
      toolbar: [
        // Headers
        [{ header: [1, 2, 3, false] }],
        
        // Font size
        [{ size: ['small', false, 'large', 'huge'] }],
        
        // Text formatting
        ['bold', 'italic', 'underline', 'strike'],
        
        // Text color and background
        [{ color: [] }, { background: [] }],
        
        // Lists and indentation
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        
        // Alignment
        [{ align: [] }],
        
        // Media and links
        ['link', 'image', 'video'],
        
        // Code block
        ['code-block'],
        
        // Blockquote
        ['blockquote'],
        
        // Clean formatting
        ['clean'],
      ],
      clipboard: {
        matchVisual: false, // Prevent automatic formatting on paste
      },
    }),
    []
  )

  // Define which formats are allowed
  const formats = [
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'indent',
    'align',
    'link',
    'image',
    'video',
    'code-block',
    'blockquote',
  ]

  return (
    <div 
      className={`quill-wrapper ${className}`}
      style={{ height: '400px', maxHeight: '400px', overflow: 'hidden' }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="bg-white dark:bg-gray-950"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      />
    </div>
  )
}
