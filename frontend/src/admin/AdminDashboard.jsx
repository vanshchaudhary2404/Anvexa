import React , { useEffect , useState } from 'react';
import AuthContext from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import '../styles/adminDashboard.css';

const EMPTY_SALES = {
  summary: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
  monthlyRevenue: [],
  categoryPerformance: [],
  topProducts: [],
  periodComparison: { revenueChangePercent: 0, orderChangePercent: 0 }
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const AdminDashboard = () => {
  const { user } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState(EMPTY_SALES);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiHasBeenRequested, setAiHasBeenRequested] = useState(false);

  useEffect(() => {
    if(!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await response.json();
        if(response.ok){
          setStats(data);
        }else{
          if(response.status === 401){
            navigate('/login');
          }
          setStats({ totalOrders: 0, totalProducts:0 , totalUsers: 0 ,totalRevenue: 0  });
        } 
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setStats({ totalOrders: 0, totalProducts:0 , totalUsers: 0 ,totalRevenue: 0  });
      }
    };

    fetchStats();
  }, [user, navigate]);

  const buildDateQuery = () => {
    const params = new URLSearchParams();
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    return params.toString();
  };

  const isDateRangeValid = () => !fromDate || !toDate || fromDate <= toDate;

  const fetchSalesAnalytics = async () => {
    if (!isDateRangeValid()) {
      setSalesError('The from date must be earlier than or equal to the to date.');
      return false;
    }

    setSalesLoading(true);
    setSalesError('');
    try {
      const query = buildDateQuery();
      const response = await fetch(`/api/analytics/sales${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) navigate('/login');
        throw new Error(data.message || 'Unable to load sales analytics.');
      }

      setSales({ ...EMPTY_SALES, ...data });
      return true;
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      setSales(EMPTY_SALES);
      setSalesError(error.message || 'Unable to load sales analytics.');
      return false;
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchInitialSalesAnalytics = async () => {
      setSalesLoading(true);
      setSalesError('');
      try {
        const response = await fetch('/api/analytics/sales', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) navigate('/login');
          throw new Error(data.message || 'Unable to load sales analytics.');
        }
        setSales({ ...EMPTY_SALES, ...data });
      } catch (error) {
        console.error('Error fetching initial sales analytics:', error);
        setSales(EMPTY_SALES);
        setSalesError(error.message || 'Unable to load sales analytics.');
      } finally {
        setSalesLoading(false);
      }
    };

    fetchInitialSalesAnalytics();
  }, [user, navigate]);

  const handleDateSubmit = (event) => {
    event.preventDefault();
    fetchSalesAnalytics();
    setAiInsights(null);
    setAiHasBeenRequested(false);
    setAiError('');
  };

  const generateAiInsights = async () => {
    if (!isDateRangeValid() || aiLoading) {
      if (!isDateRangeValid()) setAiError('The from date must be earlier than or equal to the to date.');
      return;
    }

    setAiLoading(true);
    setAiHasBeenRequested(true);
    setAiError('');
    try {
      const body = {};
      if (fromDate) body.from = fromDate;
      if (toDate) body.to = toDate;

      const response = await fetch('/api/analytics/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        if (response.status === 401) navigate('/login');
        throw new Error(result.message || 'Unable to generate AI sales insights.');
      }

      setAiInsights(result.data);
    } catch (error) {
      console.error('Error generating AI sales insights:', error);
      setAiInsights(null);
      setAiError(error.message || 'Unable to generate AI sales insights.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  const cardStyle = {
    padding: '25px',
    background: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  };

  const numberStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#f97316'
  };

  const monthlyMax = Math.max(...sales.monthlyRevenue.map((item) => Number(item.revenue) || 0), 1);
  const topProduct = sales.topProducts[0];
  const topCategory = sales.categoryPerformance[0];

 return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
        <img src="/AnvexaLogoo.png" alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'cover', filter: 'drop-shadow(0 0px 10px rgba(249, 115, 22, 0.3))' }} />
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>
      <p style={{ color: '#a1a1aa', marginBottom: '30px', fontSize: '1.1rem' }}>Welcome back, <span style={{color: '#fff'}}>{user?.name}</span></p>
      
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Orders</h4>
            <div style={numberStyle}>{stats.totalOrders}</div>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Products</h4>
            <div style={numberStyle}>{stats.totalProducts}</div>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Users</h4>
            <div style={numberStyle}>{stats.totalUsers}</div>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Revenue</h4>
            <div style={numberStyle}>₹{stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '50px 0', color: '#f97316' }}>Loading metrics...</div>
      )}

      <section className="analytics-section" aria-labelledby="sales-analytics-heading">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Decision support</p>
            <h3 id="sales-analytics-heading">Sales Analytics</h3>
          </div>
          <span className="data-badge">Backend metrics</span>
        </div>

        <form className="analytics-filters" onSubmit={handleDateSubmit}>
          <label>
            From
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
          <button className="btn analytics-filter-button" type="submit" disabled={salesLoading}>
            {salesLoading ? 'Loading...' : 'Apply dates'}
          </button>
        </form>

        {salesError && <div className="analytics-message error-message" role="alert">{salesError}</div>}
        {salesLoading && <div className="analytics-message">Loading sales analytics...</div>}

        {!salesLoading && !salesError && (
          <>
            <div className="sales-summary-grid">
              <div className="sales-stat-card"><span>Total Orders</span><strong>{sales.summary.totalOrders}</strong></div>
              <div className="sales-stat-card"><span>Total Revenue</span><strong>{formatCurrency(sales.summary.totalRevenue)}</strong></div>
              <div className="sales-stat-card"><span>Average Order Value</span><strong>{formatCurrency(sales.summary.averageOrderValue)}</strong></div>
              <div className="sales-stat-card"><span>Top Product</span><strong className="stat-text">{topProduct?.product || 'No data'}</strong></div>
              <div className="sales-stat-card"><span>Top Category</span><strong className="stat-text">{topCategory?.category || 'No data'}</strong></div>
            </div>

            {sales.summary.totalOrders === 0 ? (
              <div className="analytics-empty">No completed sales were found for this period.</div>
            ) : (
              <div className="analytics-detail-grid">
                <div className="analytics-panel monthly-panel">
                  <div className="panel-title-row">
                    <h4>Monthly Revenue</h4>
                    <span>{formatPercent(sales.periodComparison.revenueChangePercent)} vs prior period</span>
                  </div>
                  {sales.monthlyRevenue.length ? (
                    <div className="monthly-chart" aria-label="Monthly revenue chart">
                      {sales.monthlyRevenue.map((item) => (
                        <div className="chart-column" key={item.month}>
                          <span className="chart-value">{formatCurrency(item.revenue)}</span>
                          <div className="chart-track"><div className="chart-bar" style={{ height: `${Math.max((item.revenue / monthlyMax) * 100, 4)}%` }} /></div>
                          <span className="chart-label">{item.month}</span>
                          <small>{item.orders} orders</small>
                        </div>
                      ))}
                    </div>
                  ) : <div className="panel-empty">No monthly sales data available.</div>}
                </div>

                <div className="analytics-panel">
                  <div className="panel-title-row"><h4>Category Performance</h4><span>{formatPercent(sales.periodComparison.orderChangePercent)} orders</span></div>
                  {sales.categoryPerformance.length ? (
                    <div className="metric-list">
                      {sales.categoryPerformance.map((item) => (
                        <div className="metric-row" key={item.category}>
                          <div><strong>{item.category}</strong><small>{item.orders} orders</small></div>
                          <strong>{formatCurrency(item.revenue)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <div className="panel-empty">No category data available.</div>}
                </div>

                <div className="analytics-panel product-performance-panel">
                  <div className="panel-title-row"><h4>Top Products</h4><span>By revenue</span></div>
                  {sales.topProducts.length ? (
                    <div className="metric-list">
                      {sales.topProducts.map((item) => (
                        <div className="metric-row" key={item.productId || item.product}>
                          <div><strong>{item.product}</strong><small>{item.quantity} units</small></div>
                          <strong>{formatCurrency(item.revenue)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : <div className="panel-empty">No product data available.</div>}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="ai-section" aria-labelledby="ai-insights-heading">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">Interpretation layer</p>
            <h3 id="ai-insights-heading">AI Sales Intelligence</h3>
          </div>
          <button className="btn ai-button" type="button" onClick={generateAiInsights} disabled={aiLoading || salesLoading || Boolean(salesError)}>
            {aiLoading ? 'Generating...' : aiHasBeenRequested ? 'Refresh AI Insights' : 'Generate AI Insights'}
          </button>
        </div>
        <p className="ai-caption">Insights are generated from the selected backend-calculated sales period.</p>

        {aiError && <div className="analytics-message error-message" role="alert">{aiError}</div>}
        {aiLoading && <div className="analytics-message">Analyzing your sales signals...</div>}
        {!aiLoading && !aiInsights && !aiError && <div className="ai-placeholder">Generate insights to see trends, opportunities, and supported business risks.</div>}
        {!aiLoading && aiInsights && (
          <div className="insights-grid">
            <div className="insight-summary"><span>AI Summary</span><p>{aiInsights.summary}</p></div>
            <InsightList title="Key Trends" items={aiInsights.keyTrends} />
            <InsightList title="Top Performers" items={aiInsights.topPerformers} />
            <InsightList title="Recommendations" items={aiInsights.recommendations} />
            <InsightList title="Risks" items={aiInsights.risks} risk />
          </div>
        )}
      </section>

      <div style={{ marginTop: '40px', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ marginBottom: '25px', color: '#f97316' }}>Administrative Controls</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => navigate('/admin/add-product')}>+ Add Product</button>
          <button className="btn" onClick={() => navigate('/admin/products')} style={{ background: '#3f3f46' }}>📦 Manage Products</button>
          <button className="btn" onClick={() => navigate('/admin/orders')} style={{ background: '#3f3f46' }}>🚚 Manage Orders</button>
          <button className="btn" onClick={() => navigate('/admin/users')} style={{ background: '#3f3f46' }}>👥 Users Directory</button>
        </div>
      </div>
    </div>
  );
};

const InsightList = ({ title, items, risk = false }) => (
  <div className={`insight-card${risk ? ' risk-card' : ''}`}>
    <h4>{title}</h4>
    {items.length ? <ul>{items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}</ul> : <p className="panel-empty">No supported items identified.</p>}
  </div>
);

export default AdminDashboard;