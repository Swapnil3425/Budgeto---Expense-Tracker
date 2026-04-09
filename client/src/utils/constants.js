export const CATEGORIES = [
  { id: 'Food', label: 'Food', icon: '🍔', color: '#FF7733' },
  { id: 'Transport', label: 'Transport', icon: '🚕', color: '#FF5D73' },
  { id: 'Shopping', label: 'Shopping', icon: '🛒', color: '#A855F7' },
  { id: 'Bills', label: 'Bills', icon: '💡', color: '#3B82F6' },
  { id: 'Entertainment', label: 'Entertainment', icon: '🎬', color: '#EC4899' },
  { id: 'Health', label: 'Health', icon: '💊', color: '#10B981' },
  { id: 'Education', label: 'Education', icon: '📚', color: '#F59E0B' },
  { id: 'Travel', label: 'Travel', icon: '✈️', color: '#06B6D4' },
  { id: 'Investment', label: 'Investment', icon: '📈', color: '#22C55E' },
  { id: 'Other', label: 'Other', icon: '📦', color: '#6B7280' },
];

export const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Other'];

export const getCategoryInfo = (id) =>
  CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// Multi-currency formatter: converts from INR to target currency
export const formatAmount = (amountInINR, currencyCode = 'INR', rates = {}, symbol = '₹') => {
  const rate = rates[currencyCode] ?? 1;
  const converted = amountInINR * rate;
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2 }).format(converted);
  return `${symbol}${formatted}`;
};


export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Generate mock data for demo
export const generateMockExpenses = () => {
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'];
  const methods = ['UPI', 'Card', 'Cash'];
  const descriptions = {
    Food: ['Swiggy Order', 'Zomato', 'Grocery Store', 'Restaurant', 'Coffee'],
    Transport: ['Ola Ride', 'Uber', 'Metro Card', 'Petrol', 'Auto'],
    Shopping: ['Amazon', 'Flipkart', 'Myntra', 'Local Shop'],
    Bills: ['Electricity Bill', 'Internet', 'Mobile Recharge', 'Water Bill'],
    Entertainment: ['Netflix', 'Amazon Prime', 'Movie Ticket', 'Spotify'],
    Health: ['Pharmacy', 'Doctor Visit', 'Gym Membership'],
  };
  const now = new Date();
  const expenses = [];
  for (let i = 0; i < 30; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    expenses.push({
      _id: `mock-${i}`,
      amount: Math.floor(Math.random() * 3000) + 100,
      category: cat,
      description: descriptions[cat][Math.floor(Math.random() * descriptions[cat].length)],
      paymentMethod: methods[Math.floor(Math.random() * methods.length)],
      type: 'expense',
      date: d.toISOString(),
      notes: '',
    });
  }
  // Add some income
  expenses.push(
    { _id: 'mock-inc-1', amount: 65000, category: 'Other', description: 'Salary', paymentMethod: 'Net Banking', type: 'income', date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString() },
    { _id: 'mock-inc-2', amount: 8000, category: 'Other', description: 'Freelance', paymentMethod: 'UPI', type: 'income', date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString() },
  );
  return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
};
