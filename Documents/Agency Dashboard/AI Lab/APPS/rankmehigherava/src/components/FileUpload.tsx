import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, FileImage } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compressImage, formatFileSize } from "@/utils/imageCompression";

interface FileUploadProps {
  label: string;
  description?: string;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  folder: string;
  onFilesChange: (urls: string[]) => void;
  existingUrls?: string[];
}

interface UploadingFile {
  name: string;
  progress: number;
  status: "optimizing" | "uploading";
}

const FileUpload = ({
  label,
  description,
  required = false,
  accept = "image/*",
  multiple = true,
  folder,
  onFilesChange,
  existingUrls = [],
}: FileUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(existingUrls);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Sync internal state with external existingUrls prop when it changes
  useEffect(() => {
    setUploadedUrls(existingUrls);
  }, [existingUrls.length, existingUrls.join(',')]);

  // Compute display URLs - prefer internal state, fall back to prop  
  const displayUrls = uploadedUrls.length > 0 ? uploadedUrls : existingUrls;

  const uploadFile = async (
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data: urlData } = supabase.storage
            .from("website-submissions-files")
            .getPublicUrl(fileName);
          resolve(urlData.publicUrl);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      // Get the upload URL from Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      xhr.open("POST", `${supabaseUrl}/storage/v1/object/website-submissions-files/${fileName}`);
      xhr.setRequestHeader("Authorization", `Bearer ${supabaseKey}`);
      xhr.setRequestHeader("apikey", supabaseKey);
      xhr.setRequestHeader("x-upsert", "true");
      
      xhr.send(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    const filesToUpload = Array.from(files);
    let totalSaved = 0;
    
    // Initialize uploading files state with optimizing status
    setUploadingFiles(filesToUpload.map(f => ({ name: f.name, progress: 0, status: "optimizing" as const })));

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        let file = filesToUpload[i];
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 10MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // Compress image files
        const compressionResult = await compressImage(file);
        file = compressionResult.file;
        
        if (compressionResult.wasCompressed) {
          totalSaved += compressionResult.originalSize - compressionResult.compressedSize;
        }

        // Update status to uploading
        setUploadingFiles(prev => 
          prev.map((f, idx) => 
            idx === i ? { ...f, status: "uploading" as const } : f
          )
        );

        const url = await uploadFile(file, (progress) => {
          setUploadingFiles(prev => 
            prev.map((f, idx) => 
              idx === i ? { ...f, progress } : f
            )
          );
        });
        
        if (url) {
          newUrls.push(url);
        }
      }

      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      onFilesChange(allUrls);

      if (newUrls.length > 0) {
        const savedMessage = totalSaved > 0 
          ? ` (saved ${formatFileSize(totalSaved)})` 
          : "";
        toast({
          title: "Upload successful",
          description: `${newUrls.length} file(s) uploaded${savedMessage}`,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadingFiles([]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (urlToRemove: string) => {
    const newUrls = uploadedUrls.filter((url) => url !== urlToRemove);
    setUploadedUrls(newUrls);
    onFilesChange(newUrls);
  };

  return (
    <div>
      <label className="text-base font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      
      <div
        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="w-full max-w-xs space-y-2">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <span className="font-medium text-primary">
                      {file.status === "optimizing" ? "Optimizing..." : `${file.progress}%`}
                    </span>
                  </div>
                  <Progress value={file.status === "optimizing" ? 0 : file.progress} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-primary font-medium">Browse Files</p>
            <p className="text-sm text-muted-foreground">Drag and drop files here</p>
          </>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}

      {/* Preview uploaded files */}
      {displayUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayUrls.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-border bg-card"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-24 object-cover bg-muted"
                onError={(e) => {
                  // Show fallback icon on error
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-24 flex items-center justify-center bg-muted absolute inset-0">
                <FileImage className="w-8 h-8 text-muted-foreground" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(url);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
