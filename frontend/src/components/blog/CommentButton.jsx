import React from "react";
import "./CommentButton.css";

const CommentButton = ({ commentCount = 0, onClick, size = "medium", disabled = false }) => {
  
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "comment-button--small";
      case "large":
        return "comment-button--large";
      default:
        return "comment-button--medium";
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick && !disabled) {
      onClick();
    }
  };

  return (
    <button
      className={`comment-button ${getSizeClass()}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`${commentCount} comments`}
    >
      <span className="comment-icon">
        <i className="far fa-comment"></i>
      </span>
      <span className="comment-count">{commentCount}</span>
    </button>
  );
};

export default CommentButton;
