import React, { useEffect, useState } from 'react';
import { 
  Github, 
  Bot, 
  Code2, 
  Share2, 
  Terminal, 
  Wallet,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

function Navbar() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate()
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`bg-gray-900 p-4 shadow-md flex items-center justify-between fixed top-0 w-full transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="text-2xl font-bold text-white">Strato.dev</div>
      <button onClick={()=>navigate('/signup')} className="cursor-pointer px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2">
                Get Started <ChevronRight className="w-5 h-5" />
      </button>
    </nav>
  );
}
function Chat() {
  const [messages, setMessages] = useState([
    { sender: 'User', text: 'Hello!' },
    { sender: 'AI', text: 'Hi! How can I help you?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim() !== '') {
      setMessages([...messages, { sender: 'User', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="bg-gray-800 p-4 text-white w-1/4 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'User' ? 'text-right' : 'text-left'}`}>
            <span className="bg-gray-700 p-2 rounded-lg inline-block">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 p-2 bg-gray-700 text-white rounded-l"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="bg-blue-500 p-2 rounded-r" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}


function Editor() {
  const fileContents = {
    'index.js': `// Example AI-assisted code generation
const project = await ai.createProject({
  name: "My Awesome Project",
  template: "react-ts"
});

// Clone repository
await git.clone("https://github.com/user/repo");

// Make AI-powered changes
const changes = await ai.suggest({
  file: "src/App.tsx",
  prompt: "Add a dark mode toggle"
});

// Deploy with WebContainers
await project.deploy();`,
    'App.js': "function App() { return <h1>Hello</h1>; }",
    'styles.css': "body { background-color: black; }"
  };

  return (
    <div className="bg-gray-900 p-4 text-white flex-1 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Editor</h2>
      <textarea 
        className="w-full h-full bg-gray-800 text-white p-2 rounded font-mono"
        value={fileContents['index.js']}
        readOnly
      />
    </div>
  );
}

function App() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-800">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-800">
          <Navbar/>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Code Collaboration
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent"> in Web3</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, collaborate, and deploy projects using AI assistance powered by web3 payments. 
              Run your code directly in the browser with WebContainers.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={()=>navigate('/signup')} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2">
                Get Started <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Bot className="w-8 h-8 text-blue-400" />}
            title="AI-Powered Development"
            description="Leverage advanced AI to write, review, and optimize your code efficiently."
          />
          <FeatureCard 
            icon={<Wallet className="w-8 h-8 text-violet-400" />}
            title="Web3 Integration"
            description="Seamless web3 payments for AI services and collaborative features."
          />
          <FeatureCard 
            icon={<Terminal className="w-8 h-8 text-blue-400" />}
            title="Browser-Based IDE"
            description="Full development environment running directly in your browser."
          />
          <FeatureCard 
            icon={<Github className="w-8 h-8 text-violet-400" />}
            title="Git Integration"
            description="Clone, modify, and push to GitHub repositories seamlessly."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-8 h-8 text-blue-400" />}
            title="Real-time Collaboration"
            description="Chat and collaborate with team members in real-time."
          />
          <FeatureCard 
            icon={<Share2 className="w-8 h-8 text-violet-400" />}
            title="Instant Deployment"
            description="Deploy your projects instantly with WebContainers technology."
          />
        </div>
      </div>

      {/* Code Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-gray-900 rounded-xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="text-sm text-gray-300 font-mono">
          
            <code className='flex'>
            <Chat/>
            <Editor/>
            </code>
          </pre>
        </div>
      </div>
      

      {/* Footer */}
      <footer className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-blue-400" />
              <span className="text-white font-semibold text-xl">WebAI IDE</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;