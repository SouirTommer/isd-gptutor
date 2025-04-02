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

  // Auto-scroll to bottom of messages whenever messages change
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
    <div className="bg-github-medium border border-github-border rounded-lg shadow-md flex flex-col h-full overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-github-border bg-github-light">
        <h3 className="text-lg font-semibold flex items-center">
          <i className="fas fa-robot text-primary-500 mr-2"></i> AI Tutor
        </h3>
        <p className="text-sm text-github-text-secondary">
          Ask questions about {fileName || 'your document'}
        </p>
      </div>
      
      {/* Messages container - fixed height with scrolling */}
      <div 
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 h-[400px] md:h-[500px]"
        style={{ 
          maxHeight: 'calc(100vh - 350px)', 
          scrollbarWidth: 'thin',
          scrollbarColor: '#30363d #161b22'
        }}
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.sender === 'user' 
                ? 'bg-primary-700 text-white self-end' 
                : 'bg-github-light text-github-text-primary self-start'
            }`}
          >
            <div className="flex items-start gap-2">
              {message.sender === 'user' ? (
                <i className="fas fa-user mt-1 text-white"></i>
              ) : (
                <i className="fas fa-robot mt-1 text-github-text-secondary"></i>
              )}
              <div>{message.text}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="max-w-[80%] rounded-lg p-3 bg-github-light self-start">
            <div className="flex items-center gap-2">
              <i className="fas fa-robot text-github-text-secondary"></i>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-github-text-secondary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-github-text-secondary animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-github-text-secondary animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-3 border-t border-github-border bg-github-light">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about the document..."
            disabled={isLoading}
            className="w-full resize-none border border-github-border rounded-lg p-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-github-dark text-github-text-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputMessage.trim()) handleSendMessage(e);
              }
            }}
            rows="2"
          />
          <button 
            type="submit" 
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
