import React, { useEffect, useState, useContext } from 'react';
import AuthContext  from '../context/AuthContext';

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    };
    fetchOrders();
  }, [user]);

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify({ status })
    });
    if(res.ok){
      setOrders(prevOrders => prevOrders.map(order => order._id === id ? { ...order, status } : order));
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#f97316', marginBottom: '20px' }}>Manage Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr style={rowStyle}>
              <th style={cellStyle}>Order ID</th>
              <th style={cellStyle}>Customer</th>
              <th style={cellStyle}>Total</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={rowStyle}>
                <td style={cellStyle}>{order._id.substring(0, 8)}...</td>
                <td style={cellStyle}>{order.user?.name || 'Deleted User'}</td>
                <td style={cellStyle}>₹{order.totalAmount.toFixed(2)}</td>
                <td style={cellStyle}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={cellStyle}>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    style={{ background: '#09090b', color: '#fff', padding: '6px', border: '1px solid #27272a', borderRadius: '4px', outline: 'none' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '800px',
  margin: '40px auto',
  background: '#18181b',
  padding: '40px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  color: '#fafafa'
};
const rowStyle = {
  borderBottom: '1px solid rgba(255,255,255,0.1)'
};

const cellStyle = {
  padding: '12px',
  textAlign: 'left'
};

export default AdminOrders;