import React from 'react';
import ball from '../assets/img/ball.png';
import '../styles/Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <img src={ball} alt="Loading" className="loading-ball" />
    </div>
  );
};

export default Loading;