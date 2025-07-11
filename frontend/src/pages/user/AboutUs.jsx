/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { 
  ChevronRight, 
  Zap, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Star,
  Menu,
  X
} from 'lucide-react';
import '../../styles/user/aboutus.css';

const Aboutus = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const teamValues = [
    {
      icon: <Zap className="value-icon value-icon-blue" />,
      title: "Innovation",
      description: "We drive progress by constantly exploring new ideas and technologies to enhance project management."
    },
    {
      icon: <BarChart3 className="value-icon value-icon-green" />,
      title: "Transparency",
      description: "Our tools provide clear, real-time insights to keep teams aligned and informed."
    },
    {
      icon: <Users className="value-icon value-icon-orange" />,
      title: "Collaboration",
      description: "We foster seamless teamwork, empowering groups to achieve their goals together."
    },
    {
      icon: <CheckCircle className="value-icon value-icon-purple" />,
      title: "Adaptability",
      description: "Our solutions are flexible, designed to fit the unique needs of every team."
    }
  ];

  const testimonials = [
    {
      text: "ProjectFlow's vision for intuitive project management has transformed our workflow.",
      author: "Sarah Chen",
      role: "Project Manager at TechCorp",
      rating: 5
    },
    {
      text: "Their commitment to user-focused design makes our team more productive every day.",
      author: "Mike Rodriguez",
      role: "Team Lead at StartupXYZ",
      rating: 5
    }
  ];

  return (
    <div className="about-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <BarChart3 className="logo-icon" />
              <span className="logo-text">ProjectFlow</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <a href="#" className="nav-link">Home</a>
              <a href="#" className="nav-link">About</a>
              <a href="#" className="nav-link">Features</a>
              <a href="#" className="nav-link">Support</a>
            </nav>

            {/* Mobile menu button */}
            <div className="nav-mobile-toggle">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="menu-button"
              >
                {isMenuOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="nav-mobile">
              <nav className="nav-mobile-content">
                <a href="#" className="nav-link">Home</a>
                <a href="#" className="nav-link">About</a>
                <a href="#" className="nav-link">Features</a>
                <a href="#" className="nav-link">Support</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              About ProjectFlow
              <span className="hero-title-accent">Our Mission</span>
            </h1>
            <p className="hero-subtitle">
              At ProjectFlow, we empower teams to create, manage, and succeed in their projects with intuitive tools designed for simplicity and efficiency.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                Join Our Community
                <ChevronRight className="btn-icon" />
              </button>
              <button className="btn btn-secondary">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Our Core Values
            </h2>
            <p className="section-subtitle">
              Discover the principles that drive our mission to revolutionize project management.
            </p>
          </div>

          <div className="values-grid">
            {teamValues.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon-wrapper">
                  {value.icon}
                </div>
                <h3 className="value-title">
                  {value.title}
                </h3>
                <p className="value-description">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              What Our Users Say
            </h2>
            <p className="section-subtitle">
              Hear from teams who trust ProjectFlow to streamline their workflows.
            </p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="star-icon" />
                  ))}
                </div>
                <p className="testimonial-text">
                  "{testimonial.text}"
                </p>
                <div className="testimonial-author">
                  <p className="author-name">{testimonial.author}</p>
                  <p className="author-role">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Join ProjectFlow?
            </h2>
            <p className="cta-subtitle">
              Be part of a community that’s transforming project management. Start today.
            </p>
            <button className="btn btn-white">
              Get Started
              <ChevronRight className="btn-icon" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Aboutus;