"use client";

import { useRef, useState } from "react";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  folder?: string;
  aspect?: "avatar" | "banner";
  helpText?: string;
};

export function ImageUploadField({
  label,
  name,
  defaultValue = "",
  folder = "theatres",
  aspect = "avatar",
  helpText,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setError("");
    setUploading(true);

    // Immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setUrl(previewUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      // Revert back if failed
      setUrl(defaultValue);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  return (
    <div className="owner-image-field" style={{ gridColumn: aspect === "banner" ? "1 / -1" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--owner-text-sub)" }}>{label}</span>
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          style={{
            background: "none",
            border: "none",
            color: "var(--owner-accent)",
            fontSize: "0.72rem",
            cursor: "pointer",
            padding: "2px 4px",
            textDecoration: "underline",
          }}
        >
          {isUrlMode ? "Switch to file upload" : "Or enter URL manually"}
        </button>
      </div>

      <input type="hidden" name={name} value={url} />

      {isUrlMode ? (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={{
              flex: 1,
              padding: "10px 14px",
              border: "1px solid var(--owner-input-border)",
              borderRadius: "9px",
              background: "var(--owner-input-bg)",
              color: "var(--owner-text-main)",
              fontSize: "0.82rem",
            }}
          />
          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              style={{
                background: "var(--owner-card-hover)",
                border: "1px solid var(--owner-line)",
                color: "var(--owner-text-sub)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {aspect === "avatar" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "10px 12px",
                border: `1px dashed ${isDragging ? "var(--owner-accent)" : "var(--owner-line)"}`,
                borderRadius: "10px",
                background: isDragging ? "var(--owner-accent-light)" : "var(--owner-card-hover)",
                transition: "all 0.2s ease",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "58px",
                  height: "58px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--owner-line-subtle)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  border: "2px solid var(--owner-line)",
                }}
              >
                {url ? (
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.4rem", opacity: 0.6 }}>📷</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                      background: "var(--owner-card-bg)",
                      border: "1px solid var(--owner-line)",
                      color: "var(--owner-text-main)",
                      padding: "6px 12px",
                      borderRadius: "7px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {uploading ? "Uploading…" : url ? "Change photo" : "Upload photo"}
                  </button>
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#dc2626",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <small style={{ color: "var(--owner-text-muted)", fontSize: "0.7rem" }}>
                  PNG, JPG or WebP up to 10MB
                </small>
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                minHeight: "110px",
                border: `1px dashed ${isDragging ? "var(--owner-accent)" : "var(--owner-line)"}`,
                borderRadius: "10px",
                background: isDragging ? "var(--owner-accent-light)" : "var(--owner-card-hover)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                padding: "16px",
                transition: "all 0.2s ease",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {url ? (
                <>
                  <img
                    src={url}
                    alt="Cover preview"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      opacity: 0.92,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading}
                      style={{
                        background: "#ffffff",
                        border: "none",
                        color: "#1a0f09",
                        padding: "7px 14px",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {uploading ? "Uploading…" : "Change cover image"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUrl("");
                      }}
                      style={{
                        background: "rgba(220, 38, 38, 0.9)",
                        border: "none",
                        color: "#ffffff",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>🖼️</div>
                  <strong style={{ fontSize: "0.82rem", color: "var(--owner-text-main)", display: "block" }}>
                    {uploading ? "Uploading cover image…" : "Click or drag here to upload cover image"}
                  </strong>
                  <small style={{ color: "var(--owner-text-muted)", fontSize: "0.72rem" }}>
                    Recommended 1200x500 or 16:9 banner (PNG, JPG, WebP up to 10MB)
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.72rem", margin: "4px 0 0", fontWeight: 600 }}>{error}</p>
      )}
      {helpText && (
        <p style={{ color: "var(--owner-text-muted)", fontSize: "0.7rem", margin: "4px 0 0" }}>{helpText}</p>
      )}
    </div>
  );
}
