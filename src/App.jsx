import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UQWork from "./components/books/experience/UQWork";
import NHCE from "./components/books/education/NHCE";
import UQ from "./components/books/education/UQ";
import TechM from "./components/books/experience/TechM";
import Skills from "./components/books/Skills";
import Home from "./components/Home";
import NoPage from "./components/NoPage";
import Attributes from "./components/Attributes";

function App() {
  return (
    <main className="main">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/uqwork" element={<UQWork />} />
          <Route path="/nhce" element={<NHCE />} />
          <Route path="/uq" element={<UQ />} />
          <Route path="/techm" element={<TechM />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/attributes" element={<Attributes />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </Router>
    </main>
  );
}

export default App;
