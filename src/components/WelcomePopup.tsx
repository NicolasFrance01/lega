"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface WelcomePopupProps {
  id: string;
  imageUrl: string;
}

export default function WelcomePopup({ id, imageUrl }: WelcomePopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem(`hasSeenPopup_${id}`);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [id]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(`hasSeenPopup_${id}`, "true");
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        position: "relative",
        maxWidth: "600px",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "-15px",
            right: "-15px",
            background: "var(--danger, #ef4444)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            zIndex: 10
          }}
        >
          <X size={24} />
        </button>
        <img 
          src={imageUrl} 
          alt="Publicidad" 
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
          }} 
        />
      </div>
    </div>
  );
}
