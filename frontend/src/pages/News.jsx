import React, { useState } from "react";
import "./CSS/News.css";

const News = () => {
  const [news] = useState([
    {
      title: "Donation Platform Crosses ₹1 Crore Milestone",
      date: "Oct 2025",
      content:
        "We’re thrilled to announce that generous donors have contributed over ₹1 crore towards various social causes.",
    },
    {
      title: "New Partnership with Local NGOs",
      date: "Sep 2025",
      content:
        "Collaborating with 15 new NGOs to extend our reach in healthcare and education.",
    },
    {
      title: "Volunteer Stories: Small Actions, Big Impact",
      date: "Aug 2025",
      content:
        "Hear inspiring stories from our volunteers who have transformed communities with dedication and love.",
    },
  ]);

  return (
    <div className="news-page">
      <section className="news-hero">
        <h1>News & Updates 🗞️</h1>
        <p>Stay informed about our latest activities, partnerships, and success stories.</p>
      </section>

      <section className="news-list">
        {news.map((n, i) => (
          <div key={i} className="news-card">
            <h3>{n.title}</h3>
            <p className="news-date">{n.date}</p>
            <p>{n.content}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default News;
