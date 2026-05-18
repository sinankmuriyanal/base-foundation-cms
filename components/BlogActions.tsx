"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  blogId: string;
  blogTitle: string;
  redirectAfterDelete?: string;
}

export default function BlogActions({ blogId, blogTitle, redirectAfterDelete }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${blogTitle}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/admin/blogs/${blogId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete post.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
      title="Delete"
    >
      <Trash2 size={15} />
    </button>
  );
}
