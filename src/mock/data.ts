export const mockWatchlist = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', last: 2889.5, change: 0.42 },
  { symbol: 'TCS', name: 'Tata Consultancy', last: 4051.0, change: -0.31 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', last: 1621.3, change: 0.12 },
  { symbol: 'INFY', name: 'Infosys Ltd', last: 1512.7, change: -0.28 },
  { symbol: 'ITC', name: 'ITC Ltd', last: 442.9, change: 0.65 },
  { symbol: 'SBIN', name: 'State Bank of India', last: 875.1, change: 0.39 },
]

export const mockHoldings = [
  { symbol: 'RELIANCE', qty: 25, avg: 2600.40, ltp: 2889.5, pnl: 7237.5 },
  { symbol: 'TCS', qty: 5, avg: 3900.00, ltp: 4051.0, pnl: 755.0 },
  { symbol: 'INFY', qty: 12, avg: 1480.20, ltp: 1512.7, pnl: 390.0 },
  { symbol: 'ITC', qty: 200, avg: 410.00, ltp: 442.9, pnl: 6599.9 },
  { symbol: 'SBIN', qty: 60, avg: 810.50, ltp: 875.1, pnl: 3870.0 },
]

export const mockOrders = [
  { id: 'o1', time: '09:23:10', symbol: 'RELIANCE', side: 'BUY', qty: 10, price: 2890.0, status: 'COMPLETE' },
  { id: 'o2', time: '09:25:45', symbol: 'TCS', side: 'SELL', qty: 2, price: 4050.0, status: 'COMPLETE' },
  { id: 'o3', time: '10:05:12', symbol: 'HDFCBANK', side: 'BUY', qty: 20, price: 1620.5, status: 'PENDING' },
  { id: 'o4', time: '11:14:07', symbol: 'SBIN', side: 'SELL', qty: 10, price: 874.0, status: 'COMPLETE' },
  { id: 'o5', time: '12:03:58', symbol: 'INFY', side: 'BUY', qty: 5, price: 1510.2, status: 'REJECTED' },
  { id: 'o6', time: '12:30:40', symbol: 'ITC', side: 'BUY', qty: 100, price: 443.1, status: 'COMPLETE' },
]

export const mockIndices = [
  { name: 'NIFTY 50', value: 24211.15, change: 0.56 },
  { name: 'NIFTY BANK', value: 52412.30, change: -0.21 },
  { name: 'SENSEX', value: 79501.89, change: 0.43 },
  { name: 'FINNIFTY', value: 23211.11, change: 0.18 },
  { name: 'MIDCAP', value: 5132.91, change: -0.11 },
]