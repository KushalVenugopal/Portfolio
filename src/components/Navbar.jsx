import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bookshelf">
      <Link to="/" className="home">
        Home
      </Link>
      <nav>
        <h2>Work Experience</h2>
        <div className="experience">
          <Link to="/uqwork">
            UQ
            <br />
            Work
          </Link>
          <Link to="/techm">TechM</Link>
        </div>

        <h2>Education</h2>
        <div className="education">
          <Link to="/nhce">NHCE</Link>
          <Link to="/uq">UQ</Link>
        </div>

        <h2>Skills</h2>
        <div className="skills">
          <Link to="/skills">Skills</Link>
        </div>
      </nav>
      <Link to="/attributes" className="attributes">
        Attributions
      </Link>
    </div>
  );
}
