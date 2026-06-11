"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { toast } from "@/components/ui/toast";
import { Upload, FileText, Image, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatFileSize } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
  uploader: { id: string; name: string | null; image: string | null };
}

export default function FilesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    const res = await fetch(`/api/files?workspaceId=${workspaceId}`);
    const data = await res.json();
    setFiles(data);
  }, [workspaceId]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceId", workspaceId);

    const res = await fetch("/api/files", { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      const uploaded = await res.json();
      setFiles(prev => [uploaded, ...prev]);
      toast("File uploaded successfully", "success");
    } else {
      toast("Upload failed", "error");
    }
    e.target.value = "";
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Files" subtitle="Shared files and documents" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{files.length} files</p>
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
        </div>

        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
            <Upload className="mb-3 h-10 w-10 text-gray-400" />
            <p className="font-medium text-gray-600 dark:text-gray-400">No files yet</p>
            <p className="text-sm text-gray-400">Upload files to share with your team</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <Card key={file.id} className="group overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {isImage(file.type) ? (
                    <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Avatar src={file.uploader.image} name={file.uploader.name || ""} size="sm" />
                      <span className="text-xs text-gray-500 truncate">{file.uploader.name}</span>
                    </div>
                    <a href={file.url} download={file.name} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
