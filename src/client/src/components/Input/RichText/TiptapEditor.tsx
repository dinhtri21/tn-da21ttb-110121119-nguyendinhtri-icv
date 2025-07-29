import './styles.css'
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Underline from "@tiptap/extension-underline";
import { IconBold, IconItalic, IconUnderline, IconList } from "@tabler/icons-react";
import { useState, useCallback } from "react";
import { Placeholder } from '@tiptap/extensions'

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const TiptapEditor = ({ content = "", onChange, placeholder }: TiptapEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const onToolbarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "tiptap-bullet-list",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "tiptap-list-item",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Nhập nội dung...",
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      console.log("Editor content updated:", editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: (e) => {
      const toolbar = document.querySelector('.tiptap-toolbar');
      if (toolbar && !toolbar.contains(e.event?.relatedTarget as Node)) {
        setIsFocused(false);
      }
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-editor-content focus:outline-none text-sm leading-relaxed text-gray-900 h-full",
        "data-placeholder": placeholder || "",
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleFormat = (format: string) => {
    switch (format) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "bulletList":
        editor.chain().focus().toggleBulletList().run();
        break;
    }
  };

  return (
    <div className="relative w-full">
      {/* Editor Container */}
      <div className="group border border-transparent hover:border-gray-300 focus:border-blue-300 rounded">
        <EditorContent
          marginHeight={0}
          marginWidth={0}
          editor={editor}
        //   className="tiptap-wrapper"
          placeholder={placeholder || "Nhập nội dung..."}
        />
      </div>

      {/* Floating Toolbar - Only visible when editor is focused */}
      <div 
        className={`
          tiptap-toolbar
          absolute top-[-40px] right-0 transition-all duration-200 print:hidden flex gap-2 p-[6px] bg-gray-200 backdrop-blur-sm rounded-t
          ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
        `}
        onMouseDown={onToolbarMouseDown}
      >
        <button
          type="button"
          className={`
            flex items-center justify-center w-7 h-7 rounded 
            transition-all duration-200
            ${
              editor.isActive("bold")
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }
            focus:outline-none
          `}
          onClick={() => toggleFormat("bold")}
          title="In đậm"
        >
          <IconBold size={16} />
        </button>
        
        <button
          type="button"
          className={`
            flex items-center justify-center w-7 h-7 rounded
            transition-all duration-200
            ${
              editor.isActive("italic")
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }
            focus:outline-none
          `}
          onClick={() => toggleFormat("italic")}
          title="In nghiêng"
        >
          <IconItalic size={16} />
        </button>
        
        <button
          type="button"
          className={`
            flex items-center justify-center w-7 h-7 rounded
            transition-all duration-200
            ${
              editor.isActive("underline")
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }
            focus:outline-none
          `}
          onClick={() => toggleFormat("underline")}
          title="Gạch chân"
        >
          <IconUnderline size={16} />
        </button>
        
        <button
          type="button"
          className={`
            flex items-center justify-center w-7 h-7 rounded
            transition-all duration-200
            ${
              editor.isActive("bulletList")
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }
            focus:outline-none
          `}
          onClick={() => toggleFormat("bulletList")}
          title="Danh sách chấm"
        >
          <IconList size={16} />
        </button>
      </div>

      {/* Custom styles để đảm bảo bullet points hiển thị */}
      <style jsx global>{`
        /* Màu cho text thường */
        .ProseMirror,
        .tiptap-wrapper,
        .tiptap-editor-content {
          color: #737373; 
        }

        .tiptap-editor-content p {
          line-height: 1.6;
        }

        .tiptap-editor-content[data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
          position: absolute;
          font-style: italic;
        }

        /* Bullet List Styles */
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
        }

        .ProseMirror ul li {
          display: list-item !important;
        }

        /* Nested lists */
        .ProseMirror ul ul {
          list-style-type: circle !important;
        }

        .ProseMirror ul ul ul {
          list-style-type: square !important;
        }

        /* Đảm bảo không có pseudo-elements can thiệp */
        .ProseMirror ul li::before {
          display: none !important;
        }

        /* Text formatting */
        .ProseMirror strong,
        .tiptap-wrapper strong,
        .tiptap-editor-content strong {
          font-weight: 600;
          color: #737373; /* Màu cho text đậm */
        }

        .ProseMirror em,
        .tiptap-wrapper em,
        .tiptap-editor-content em {
          font-style: italic;
        }

        .ProseMirror u,
        .tiptap-wrapper u,
        .tiptap-editor-content u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;
