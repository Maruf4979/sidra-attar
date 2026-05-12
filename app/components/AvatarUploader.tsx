"use client";

import { useState } from "react";
import { insforge } from "@/app/lib/insforge";

export default function AvatarUploader({
  userId,
  currentImageUrl,
}: {
  userId: string;
  currentImageUrl?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await res.json();
      setImageUrl(data.url);
      
      // Force refresh session to show new avatar everywhere
      // Note: We use window.location.reload() for a hard refresh of the session
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-avatar" style={{ position: "relative", cursor: "pointer", overflow: "hidden" }}>
      {imageUrl ? (
        <img src={imageUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        "U"
      )}
      
      {/* Hidden file input overlay */}
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: loading ? "wait" : "pointer",
        }}
      />
      {loading && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span className="spinner" style={{ width: "20px", height: "20px" }} />
        </div>
      )}
    </div>
  );
}
