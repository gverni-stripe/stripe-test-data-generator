// Helper function to generate random order number
export const generateOrderNumber = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Helper function to sleep/delay execution
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
