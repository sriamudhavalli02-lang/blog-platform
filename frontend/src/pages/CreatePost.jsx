
import { useState } from "react";

function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login first!");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter both title and content.");
      return;
    }

    setIsPublishing(true);
    setMessage("Publishing your post...");

    try {
      const response = await fetch(
        "https://blog-platform-1-2wds.onrender.com/api/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Post published successfully! 🎉");
        setTitle("");
        setContent("");

        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        setMessage(data.message || "Failed to publish post.");
      }
    } catch (error) {
      console.error("Create Post Error:", error);
      setMessage("Unable to connect to server. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>✍️ Create Post</h1>
        <p>Share your story with the world 🌎</p>

        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            placeholder="Enter your post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={150}
            disabled={isPublishing}
          />

          <textarea
            placeholder="Write your story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={8}
            disabled={isPublishing}
          />

          <button type="submit" disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish Post 🚀"}
          </button>
        </form>

        {message && (
          <p role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
