import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatPanel = ({ pdfId, fileName }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hello! I'm your AI tutor. Ask me anything about "${fileName || 'your document'}"!`, 
      sender: 'ai' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const userMessage = { 
      id: messages.length + 1, 
      text: inputMessage, 
      sender: 'user' 
    };
    
    setMessages([...messages, userMessage]);
    const sentMessage = inputMessage; // Store the sent message
    setInputMessage('');
    setIsLoading(true);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), 30000) // Increased timeout to 30s
    );
    
    try {
      console.log('Preparing chat request with data:', {
        pdfId,
        message: sentMessage
      });
      
      // Try the REAL chat endpoint FIRST - this is the one that uses the PDF content
      let response;
      
      try {
        console.log('Trying real chat endpoint first...');
        response = await Promise.race([
          axios.post('/api/pdf/chat', {
            pdfId,
            message: sentMessage
          }),
          timeoutPromise
        ]);
        console.log('Real chat call succeeded:', response.data);
      } catch (err) {
        console.error('Real chat endpoint failed:', err.message);
        
        // Only if the real chat fails, try the direct URL approach
        try {
          console.log('Falling back to direct port approach...');
          response = await Promise.race([
            axios.post('http://localhost:5001/api/pdf/chat', {
              pdfId,
              message: sentMessage
            }),
            timeoutPromise
          ]);
          console.log('Direct port call succeeded');
        } catch (err2) {
          console.error('Direct port call failed too:', err2.message);
          
          // Last resort - use the simple test endpoint
          console.log('Using simple test endpoint as last resort');
          response = await axios.post('/api/pdf/chat-simple', {
            pdfId,
            message: sentMessage
          });
          
          console.log('Test endpoint succeeded - but this is just a generic response');
        }
      }
      
      if (response && response.data && response.data.reply) {
        console.log('Chat response received:', response.data);
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            id: prevMessages.length + 1, 
            text: response.data.reply, 
            sender: 'ai' 
          }
        ]);
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid API response format');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response',
        request: error.request ? 'Request made but no response' : 'No request made'
      });
      
      // Display a more helpful error message
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          id: prevMessages.length + 1, 
          text: `Sorry, I couldn't process your question. Please check the developer console for details. Error: ${error.message}`, 
          sender: 'ai' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article 
      aria-label="AI Tutor Chat" 
      data-theme="dark"
      style={{ 
        height: "100%", // Take full height of parent
        width: "100%",  // Take full width of parent
        display: "flex", 
        flexDirection: "column",
        margin: 0,
        padding: 0,
        borderRadius: "var(--border-radius)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        overflow: "hidden" // Prevent any content from spilling out
      }}
    >
      <header style={{ 
        padding: "1rem", 
        borderBottom: "1px solid var(--card-border-color)",
        flexShrink: 0 // Prevent header from shrinking
      }}>
        <div className="headings">
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>
            <i className="fas fa-robot" aria-hidden="true"></i> 
            <span style={{ marginLeft: "0.5rem" }}>AI Tutor</span>
          </h3>
          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", opacity: 0.8 }}>
            Ask questions about {fileName || 'your document'}
          </p>
        </div>
      </header>
      
      <div style={{ 
        flex: 1, 
        overflowY: "auto", // Make only this div scrollable 
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        height: "0", // Allow this to take available space and scroll
      }}>
        {messages.map((message) => (
          <blockquote 
            key={message.id} 
            className={message.sender === 'user' ? 'contrast' : 'secondary'}
            style={{ 
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              margin: "0.5rem 0",
              padding: "0.75rem 1rem",
              borderRadius: "var(--border-radius)"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              {message.sender === 'user' ? (
                <i className="fas fa-user" aria-hidden="true"></i>
              ) : (
                <i className="fas fa-robot" aria-hidden="true"></i>
              )}
              <div>{message.text}</div>
            </div>
          </blockquote>
        ))}
        
        {isLoading && (
          <blockquote 
            className="secondary"
            style={{ 
              alignSelf: 'flex-start',
              maxWidth: '80%',
              margin: "0.5rem 0",
              padding: "0.75rem 1rem"
            }}
            aria-busy="true"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <i className="fas fa-robot" aria-hidden="true"></i>
              <span>Thinking...</span>
            </div>
          </blockquote>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <footer style={{ 
        padding: "0.75rem", 
        borderTop: "1px solid var(--card-border-color)",
        flexShrink: 0 // Prevent footer from shrinking
      }}>
        <form onSubmit={handleSendMessage} style={{ margin: 0 }}>
          <div className="grid" style={{ padding: 0, margin: 0 }}>
            <div style={{ gridColumn: "span 10" }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about the document..."
                disabled={isLoading}
                aria-label="Message"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputMessage.trim()) handleSendMessage(e);
                  }
                }}
                style={{ 
                  margin: 0, 
                  minHeight: "3.5rem", 
                  resize: "none",
                  borderRadius: "var(--border-radius)",
                  lineHeight: "1.5"
                }}
              />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "flex-end" }}>
              <button 
                type="submit" 
                className="primary"
                disabled={isLoading || !inputMessage.trim()}
                aria-label="Send message"
                style={{ 
                  margin: 0, 
                  height: "3.5rem",
                  width: "100%"
                }}
              >
                <i className="fas fa-paper-plane" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </form>
      </footer>
    </article>
  );
};

export default ChatPanel;
