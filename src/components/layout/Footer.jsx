import React from "react";

export default function Footer() {
  return (
    <footer className="border-top bg-black">
      <div className="container py-3 text-center text-light small">
        {new Date().getFullYear()} Temple Sound
      </div>
    </footer>
  );
}
