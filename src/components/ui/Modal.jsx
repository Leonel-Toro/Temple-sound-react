import React from "react";

export default function Modal({
  show,
  title,
  onClose,
  size = "md",
  children,
  footer,
  dark = true,
}) {
  if (!show) return null;

  const sizeClass =
    size === "modal";

  return (
    <div
      className="modal fade show"
      style={{ 
        display: "block", 
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.3s ease-out"
      }}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-dialog modal-dialog-centered ${sizeClass}`}
        role="document"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "slideInUp 0.3s ease-out"
        }}
      >
        <div
          className={`modal-content shadow-lg ${
            dark ? "bg-black text-white" : ""
          }`}
          style={{
            border: dark ? "1px solid rgba(102, 126, 234, 0.3)" : "",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div 
            className="modal-header border-0 pb-0"
            style={{
              background: dark ? "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)" : "",
              borderBottom: "none"
            }}
          >
            <h5 
              className="modal-title fw-bold"
              style={{
                fontSize: "1.5rem",
                background: "linear-gradient(135deg, #5b5b5bff 0%, #ffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              {title}
            </h5>
            <button
              type="button"
              className={`btn-close ${dark ? "btn-close-white" : ""}`}
              aria-label="Cerrar"
              onClick={onClose}
              style={{
                opacity: 0.8,
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.opacity = 1}
              onMouseLeave={(e) => e.target.style.opacity = 0.8}
            />
          </div>

          <div className="modal-body pt-2">{children}</div>

          {footer && <div className="modal-footer border-0">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
