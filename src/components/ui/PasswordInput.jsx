import React from "react";

export default function PasswordInput({
  id,
  placeholder = "••••••••",
  className = "form-control",
  ...rest
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="input-group">
      <input
        id={id}
        type={show ? "text" : "password"}
        className={className}
        placeholder={placeholder}
        {...rest}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
      </button>
    </div>
  );
}
