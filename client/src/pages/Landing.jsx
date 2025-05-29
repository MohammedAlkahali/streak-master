import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="bg-gradient-to-tr from-blue-100 via-purple-200 to-pink-100 min-h-screen text-gray-800">
      <header className="container mx-auto flex justify-between items-center py-6 px-4">
      <img src="/images/streakmaster-logo-updated.png" alt="Streak Master Logo" className="h-16" />
      <nav className="space-x-4 text-purple-700 font-semibold">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <section id="home" className="text-center py-20 px-4 bg-white">
        <h1 className="text-5xl font-extrabold text-purple-700">Build Your Habits. Break Your Limits.</h1>
        <p className="text-lg mt-4 text-gray-600">Welcome to Streak Master - your personal streak-tracking partner for better consistency and success.</p>
        <Link
          to="/register"
          className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded text-lg shadow"
        >
          Start Tracking
        </Link>
      </section>

      <section id="about" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">About Us</h2>
          <p className="text-gray-700 max-w-3xl">
            Streak Master is designed to help you stay committed to your habits by tracking your daily progress in a fun and visual way. Whether it's exercise, reading, or drinking more water, we help you stay consistent.
          </p>
        </div>
      </section>

      <section id="features" className="py-16 px-4 bg-purple-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">What You'll Love</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>✅ Beautifully designed dashboard to monitor habit streaks</li>
            <li>✅ Friendly user experience with motivating visuals</li>
            <li>✅ Works on desktop and mobile</li>
            <li>✅ Free to use, always</li>
          </ul>
        </div>
      </section>

      <section id="faq" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Frequently Asked Questions</h2>
          <div className="text-gray-700 space-y-4">
            <p><strong>Q:</strong> Do I need an account to track habits?<br /><strong>A:</strong> Yes, register to save your streaks.</p>
            <p><strong>Q:</strong> Is Streak Master free?<br /><strong>A:</strong> 100% free for all users.</p>
            <p><strong>Q:</strong> Can I use it on my phone?<br /><strong>A:</strong> Yes! It’s fully responsive.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 px-4 bg-purple-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Contact Us</h2>
          <p>Email: support@streakmaster.com</p>
          <p>Phone: +968-9460-9441</p>
          <p>Location: Muscat, Oman</p>
        </div>
      </section>

      <footer className="text-center py-6 text-gray-600">
        &copy; 2025 Streak Master. All rights reserved.
      </footer>
    </div>
  );
}

export default Landing;
