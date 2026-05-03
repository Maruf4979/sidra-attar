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
      // 1. Upload to InsForge storage
      const { data, error } = await insforge.storage
        .from("customer-data")
        .uploadAuto(file);

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // 2. Update user profile in our database via an API route
        const res = await fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: data.url }),
        });

        if (!res.ok) throw new Error("Failed to save image URL");

        setImageUrl(data.url);
        alert("Profile picture updated successfully!");
      }
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
