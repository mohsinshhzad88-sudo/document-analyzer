function Navbar({ showComparison, setShowComparison }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        📄 Document Analyzer AI
      </div>

      <div className="nav-links">
        <button
          className={!showComparison ? "active" : ""}
          onClick={() => setShowComparison(false)}
        >
          📄 Analyze
        </button>

        <button
          className={showComparison ? "active" : ""}
          onClick={() => setShowComparison(true)}
        >
          📊 Compare
        </button>
      </div>
    </nav>
  );
}

export default Navbar;