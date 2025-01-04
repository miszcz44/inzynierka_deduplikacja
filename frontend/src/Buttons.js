import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    const currentPath = location.pathname;
    const isWorkflowDetailPage = /^\/workflows\/\d+$/.test(currentPath);
    const isProjectDetailPage = /^\/projects\/\d+$/.test(currentPath);
    const isProjectPage = /^\/projects$/.test(currentPath);

    if (isProjectDetailPage) {
      navigate('/projects');
    } else if (isWorkflowDetailPage) {
      navigate('/')
    }else if (isProjectPage) {
      navigate('/')
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="div-nav-button back-button" onClick={handleBackClick}>
      <img src="/images/arrow.png" alt="Icon" className="icon" />
    </div>
  );
};

BackButton.propTypes = {
  onClick: PropTypes.func,
};

BackButton.defaultProps = {
  onClick: null,
};

const HomeButton = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="div-nav-button home-button" onClick={handleHomeClick}>
      <img src="/images/home.png" alt="Icon" className="icon" />
    </div>
  );
};

HomeButton.propTypes = {
  onClick: PropTypes.func,
};

HomeButton.defaultProps = {
  onClick: null,
};

export { BackButton, HomeButton } ;