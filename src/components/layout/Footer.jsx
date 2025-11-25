import React from "react";

export default function Footer() {
  return (
    <footer className="d-flex justify-content-around border-top bg-black">
      <div className="py-3 text-light small">
        {new Date().getFullYear()} Temple Sound
      </div>
      <div className="py-3 text-light small">
        Siguenos en nuestras redes sociales:
        <a
          href="https://www.facebook.com/templesound"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light mx-2"
        >
          <i className="bi bi-facebook"></i>
        </a>
        |
        <a
          href="https://www.instagram.com/templesound"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light mx-2"
        >
          <i className="bi bi-instagram"></i>
        </a>
        |
        <a
          href="https://www.twitter.com/templesound"
          target="_blank"
          rel="noopener noreferrer"
          className="text-light mx-2"
        >
          <i className="bi bi-twitter"></i>
        </a>
      </div>
    </footer>
  );
}
