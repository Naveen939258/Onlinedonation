import React, { useState } from "react";
import "./CSS/Impact.css";
import educationImg from "../assets/education.jpeg";
import healthcareImg from "../assets/healthcare.jpg";
import womenImg from "../assets/Women.jpeg";
const Impact = () => {
  const [stats] = useState([
    { label: "Meals Served", value: "250,000+" },
    { label: "Children Educated", value: "10,000+" },
    { label: "Healthcare Camps", value: "500+" },
    { label: "Volunteers", value: "2,000+" },
  ]);

  const [stories] = useState([
    {
      title: "Bringing Education to Rural Areas",
      desc: "Your donations helped us build 15 new classrooms and provide learning kits for over 1,200 children.",
      image:
        educationImg,
    },
    {
      title: "Healthcare for All",
      desc: "Our mobile clinics reached remote villages offering free health check-ups and medicines.",
      image:
        healthcareImg,
    },
    {
      title: "Empowering Women",
      desc: "Through vocational training, 500+ women now run successful small businesses.",
      image:
        womenImg,
    },
  ]);
 
  return (
    <div className="impact-page">
      {/* Header Section */}
      <section className="impact-hero">
        <h1>Our Impact 🌍</h1>
        <p>Every donation you make creates a real difference in someone's life.</p>
      </section>

      {/* Statistics Section */}
      <section className="impact-stats">
        <div className="impact-grid">
          {stats.map((s, i) => (
            <div key={i} className="impact-card">
              <h2>{s.value}</h2>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="impact-stories">
        <h2>Success Stories</h2>
        <div className="story-grid">
          {stories.map((story, i) => (
            <div key={i} className="story-card">
              <img
                src={story.image}
                alt={story.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="story-content">
                <h3>{story.title}</h3>
                <p>{story.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Impact;
