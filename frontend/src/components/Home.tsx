import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-screen h-screen bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1608500211164-3f7eb5f2f35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')` }}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center px-4">
        <h1 className="text-white text-4xl md:text-6xl font-bold text-center mb-6 drop-shadow-lg">
          Welcome to the Chess Arena
        </h1>

        <button
          onClick={() => navigate('/play')}
          className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-6 py-3 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Home;
