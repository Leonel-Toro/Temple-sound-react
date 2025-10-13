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
    size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : "";

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-dialog modal-dialog-centered ${sizeClass}`}
        role="document"
      >
        <div
          className={`modal-content shadow ${
            dark ? "bg-black text-white border border-light" : ""
          }`}
        >
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className={`btn-close ${dark ? "btn-close-white" : ""}`}
              aria-label="Cerrar"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">{children}</div>

          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
