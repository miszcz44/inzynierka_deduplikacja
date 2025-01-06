import React from 'react';

const Loading = () => {
  return (
    <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000, // Ensure the modal is above everything
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            width: '300px',
            height: '150px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p>Loading...</p>
        </div>
      </div>
    );
};
    
export default Loading;