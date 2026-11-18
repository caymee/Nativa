import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        nativa<span>.</span>
      </Link>

      <div className="nav-links">
        <Link to="/">Início</Link>
        <Link to="/explorar">Explorar oportunidades</Link>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="nav-login">
          Entrar
        </Link>

        <Link to="/login" className="nav-button">
          Começar agora
        </Link>
      </div>
    </nav>
  );
}