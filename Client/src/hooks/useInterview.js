import { useContext } from 'react';
import { InterviewContext } from '../context/InterviewContext';

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider');
  }
  return context;
};
