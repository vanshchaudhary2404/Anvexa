import React from 'react';

const About = () => {
  const pageStyle = {
    minHeight: 'calc(100vh - 120px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    background:
      'radial-gradient(circle at 10% 10%, rgba(249, 115, 22, 0.16), transparent 35%), radial-gradient(circle at 90% 20%, rgba(14, 165, 233, 0.14), transparent 30%), #0f172a'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '980px',
    padding: '36px',
    borderRadius: '22px',
    background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.98), rgba(30, 41, 59, 0.96))',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 22px 70px rgba(0,0,0,0.5)',
    color: '#e5e7eb',
    backdropFilter: 'blur(8px)'
  };

  const heroStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '26px',
    alignItems: 'center',
    marginBottom: '24px'
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.85rem',
    color: '#fdba74',
    background: 'rgba(249, 115, 22, 0.14)',
    border: '1px solid rgba(249, 115, 22, 0.35)',
    marginBottom: '14px'
  };

  const socialBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 16px',
    background: '#111827',
    color: '#e5e7eb',
    borderRadius: '10px',
    textDecoration: 'none',
    transition: 'all 0.25s ease',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    fontWeight: 500
  };

  const projectCardStyle = {
    padding: '16px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.88), rgba(15, 23, 42, 0.88))',
    border: '1px solid rgba(148, 163, 184, 0.25)'
  };

  const tagStyle = {
    display: 'inline-flex',
    padding: '5px 10px',
    borderRadius: '999px',
    border: '1px solid rgba(56, 189, 248, 0.45)',
    background: 'rgba(56, 189, 248, 0.12)',
    color: '#7dd3fc',
    fontSize: '0.75rem',
    fontWeight: 600
  };

  const aboutPoints = [
    'Computer Science undergrad at G.L. Bajaj Institute of Technology and Management (2023 - 2027).',
    'MERN stack and C++ developer focused on scalable systems and real-world product solving.',
    'Exploring applied AI integrations and actively sharpening DSA through consistent LeetCode practice.'
  ];

  const quickStats = [
    '2+ Years Hands-on Coding',
    '4+ Projects Built',
    '9+ Certifications',
    '3+ Hackathons'
  ];

  const featuredProjects = [
    {
      title: 'Anvexa',
      type: 'SaaS E-Commerce',
      summary:
        'A full-stack MERN commerce platform with secure auth, product and order workflows, analytics, cloud media handling, and admin operations.',
      stack: 'React, Redux Toolkit, Node.js, Express, MongoDB, Cloudinary, JWT',
      link: 'https://github.com/vanshchaudhary2404/Anvexa'
    },
    {
      title: 'CuraID',
      type: 'Health-Tech',
      summary:
        'RFID-based patient identification platform with Firebase and AI modules for real-time data handling and triage workflows.',
      stack: 'React, Firebase, Node.js, RFID, AI',
      link: 'https://github.com/vanshchaudhary2404/CuraID'
    },
    {
      title: 'WanderLust',
      type: 'MERN Platform',
      summary:
        'Full-stack travel listings platform with authentication, image uploads, reviews, and a responsive booking-style experience.',
      stack: 'MongoDB, Express, React, Node.js',
      link: 'https://github.com/vanshchaudhary2404/WanderLust'
    },
    {
      title: 'Campus Bazar',
      type: 'Marketplace',
      summary:
        'Scalable student marketplace with real-time chat, intelligent search, and secure authentication for better product discovery.',
      stack: 'React, Node.js, Express, MongoDB, Socket.io, Firebase',
      link: 'https://github.com/vanshchaudhary2404'
    }
  ];

  return (
    <section style={pageStyle}>
      <div style={cardStyle}>
        <div style={heroStyle}>
          <img
            src="/dp.png"
            alt="Vansh Kumar"
            style={{
              width: '180px',
              height: '180px',
              flexShrink: 0,
              borderRadius: '22px',
              objectFit: 'cover',
              border: '3px solid rgba(249, 115, 22, 0.8)',
              boxShadow: '0 12px 30px rgba(249, 115, 22, 0.28)'
            }}
          />

          <div>
            <span style={badgeStyle}>MERN Developer • AI Enthusiast</span>
            <h1 style={{ fontSize: '2.2rem', margin: '0 0 8px 0', color: '#ffffff', lineHeight: 1.25 }}>
              Vansh Kumar
            </h1>
            <p style={{ margin: '0 0 16px 0', color: '#fb923c', fontWeight: 600 }}>
              Building MERN and AI-powered applications for real-world impact.
            </p>
            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.8, maxWidth: '700px' }}>
              A developer who obsesses over solving real problems. I take ideas from concept to deployed products with clean architecture, fast UI, and reliable backend systems.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '10px',
            marginBottom: '28px',
            padding: '18px 20px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px'
          }}
        >
          {aboutPoints.map((point) => (
            <p key={point} style={{ margin: 0, color: '#d1d5db', lineHeight: 1.6 }}>
              {point}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
          {quickStats.map((stat) => (
            <span
              key={stat}
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(251, 146, 60, 0.45)',
                color: '#fdba74',
                background: 'rgba(251, 146, 60, 0.08)',
                fontSize: '0.86rem'
              }}
            >
              {stat}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '26px',
            padding: '16px 18px',
            background: 'rgba(2, 6, 23, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px'
          }}
        >
          <h3 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '1.03rem', gridColumn: '1 / -1' }}>
            Featured Work
          </h3>
          {featuredProjects.map((project) => (
            <article key={project.title} style={projectCardStyle}>
              <span style={tagStyle}>{project.type}</span>
              <h4 style={{ margin: '10px 0 8px 0', color: '#f8fafc', fontSize: '1rem' }}>{project.title}</h4>
              <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.55, fontSize: '0.93rem' }}>
                {project.summary}
              </p>
              <p style={{ margin: '10px 0 12px 0', color: '#93c5fd', fontSize: '0.82rem' }}>{project.stack}</p>
              <a
                href={project.link}
                target={project.link.startsWith('http') ? '_blank' : undefined}
                rel={project.link.startsWith('http') ? 'noreferrer' : undefined}
                style={{ ...socialBtnStyle, padding: '8px 12px', fontSize: '0.84rem' }}
              >
                View Project
              </a>
            </article>
          ))}
        </div>

        <h2 style={{ marginTop: 0, marginBottom: '14px', color: '#f8fafc', fontSize: '1.15rem' }}>
          Connect with me
        </h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <a href="https://vansh-portfolio-sage.vercel.app/" target="_blank" rel="noreferrer" style={socialBtnStyle}>Portfolio</a>
          <a href="https://www.linkedin.com/in/vanshkumar024" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, borderColor: 'rgba(59, 130, 246, 0.65)', color: '#93c5fd' }}>LinkedIn</a>
          <a href="https://github.com/vanshchaudhary2404" target="_blank" rel="noreferrer" style={{ ...socialBtnStyle, borderColor: 'rgba(148, 163, 184, 0.7)', color: '#cbd5e1' }}>GitHub</a>
          <a href="mailto:vanshkumar.official24@gmail.com" style={{ ...socialBtnStyle, borderColor: 'rgba(251, 146, 60, 0.55)', color: '#fdba74' }}>Email</a>
        </div>

        <p style={{ margin: '16px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
          Open to full-time and freelance opportunities.
        </p>
      </div>
    </section>
  );
};

export default About;