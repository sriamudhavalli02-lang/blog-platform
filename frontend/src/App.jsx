
import { useState, useEffect } from "react";
import "./App.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import CreatePost from "./pages/CreatePost";

function App() {
  const [page, setPage] = useState("home");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLoggedIn = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/posts");

      if (!response.ok) {
        throw new Error("Posts load aagala");
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError("Posts load aagala. Backend running-ah check pannu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("home");
  };

  const handlePostCreated = () => {
    setPage("home");
    fetchPosts();
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">📝 BlogSpace</div>

        <div className="nav-links">
          <button onClick={() => {
            setPage("home");
            fetchPosts();
          }}>
            Home
          </button>

          {isLoggedIn ? (
            <>
              <button onClick={() => setPage("create")}>
                ✍️ Create Post
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setPage("login")}>Login</button>
              <button onClick={() => setPage("register")}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && (
        <>
          <main className="hero">
            <p className="tagline">WELCOME TO BLOGSPACE</p>
            <h1>Share Your<span> Stories.</span></h1>
            <p className="description">
              Write, share and discover amazing stories from people around the world.
            </p>

            <button
              className="start-btn"
              onClick={() => setPage(isLoggedIn ? "create" : "register")}
            >
              Start Writing ✍️
            </button>
          </main>

          <section className="posts-section">
            <h2>📚 Latest Stories</h2>

            {loading && <p>Loading posts...</p>}

            {error && (
              <p>
                {error}
                <button onClick={fetchPosts}>Try Again</button>
              </p>
            )}

            {!loading && !error && posts.length === 0 && (
              <p>No posts yet. Be the first to share your story! ✨</p>
            )}

            <div className="posts-grid">
              {posts.map((post) => (
                <article className="post-card" key={post._id}>
                  <h3>{post.title}</h3>
                  <p className="post-author">
                    By {post.author?.name || "Unknown Author"}
                  </p>
                  <p className="post-content">{post.content}</p>
                  <small>
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString("en-IN")
                      : ""}
                  </small>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {page === "register" && <Register />}
      {page === "login" && <Login />}
      {page === "create" && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}
    </div>
  );
}

export default App;
