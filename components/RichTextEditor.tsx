"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link as LinkIcon, Image as ImageIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose-blog min-h-[300px] px-5 py-4 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("URL");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Image URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  const tools = [
    { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
    { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
    { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), title: "Heading 2" },
    { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), title: "Heading 3" },
    { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet list" },
    { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Numbered list" },
    { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: "Divider" },
    { icon: LinkIcon, action: setLink, active: editor.isActive("link"), title: "Link" },
    { icon: ImageIcon, action: addImage, active: false, title: "Image" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50">
        {tools.map(({ icon: Icon, action, active, title }) => (
          <button
            key={title}
            type="button"
            onClick={action}
            title={title}
            className={cn(
              "p-2 rounded-lg text-sm transition-colors",
              active
                ? "bg-brand text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
