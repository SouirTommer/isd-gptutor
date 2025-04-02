import React from 'react';

const About = () => {
  return (
    <div className="container">
      <article>
        <header>
          <h1>About GPTutor</h1>
        </header>
        <p>
          GPTutor is an AI-powered educational tool designed to transform your PDF documents 
          into effective study materials. Using advanced natural language processing, 
          GPTutor analyzes your documents and generates customized learning resources.
        </p>
        <h2>How It Works</h2>
        <ol>
          <li><strong>Upload</strong> - Submit any PDF document containing your study material</li>
          <li><strong>Process</strong> - Our AI extracts and analyzes the text content</li>
          <li><strong>Transform</strong> - The content is restructured into various study formats</li>
          <li><strong>Learn</strong> - Use the generated materials to enhance your learning</li>
        </ol>
        <h2>Available Formats</h2>
        <ul>
          <li><strong>Flashcards</strong> - Question and answer pairs for active recall practice</li>
          <li><strong>Summaries</strong> - Concise overviews highlighting key concepts</li>
          <li><strong>Cornell Notes</strong> - Structured notes with cues and summaries</li>
        </ul>
        <footer>
          <small><strong>Version: </strong> 1.0.0</small>
        </footer>
      </article>
    </div>
  );
};

export default About;
