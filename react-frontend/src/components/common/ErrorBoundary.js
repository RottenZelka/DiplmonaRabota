import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ children }) => {
  const navigate = useNavigate();

  const handleError = (error) => {
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          navigate('/400');
          break;
        case 401:
          navigate('/401');
          break;
        case 404:
          navigate('/404');
          break;
        case 500:
          navigate('/500');
          break;
        default:
          navigate('/500');
          break;
      }
    } else {
      navigate('/500');
    }
  };

  return <React.Fragment>{children}</React.Fragment>;
};

export default ErrorBoundary;
