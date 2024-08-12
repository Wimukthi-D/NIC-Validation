
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Upload from "./Pages/Upload";
import Records from "./Pages/Records";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/uploads" element={<Upload/>} />
          <Route path="/records" element={<Records/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
