import toast from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
}

const useToast = () => {
  const showSuccessToast = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      style: {
        background: '#4CAF50',
        color: '#fff',
      },
    });
  };

  const showErrorToast = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 3000,
      style: {
        background: '#F44336',
        color: '#fff',
      },
    });
  };

  return {showSuccessToast, showErrorToast};
};

export default useToast;