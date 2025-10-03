import React, { useEffect, useState } from 'react';
import { matchesAPI } from '../../services/api';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await matchesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  const statusData = {
    labels: ['Active Cases', 'Total Reports', 'Pending Matches', 'Confirmed Matches'],
    datasets: [
      {
        data: [
          stats.activeCases,
          stats.totalReports,
          stats.pendingMatches,
          stats.confirmedMatches
        ],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
      }
    ]
  };

  const caseStatusData = {
    labels: ['Active', 'Found'],
    datasets: [
      {
        label: 'Cases',
        data: [stats.activeCases, stats.totalCases - stats.activeCases],
        backgroundColor: ['#3b82f6', '#10b981']
      }
    ]
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statCardBlue }}>
          <div style={styles.statValue}>{stats.totalCases}</div>
          <div style={styles.statLabel}>Total Cases</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardGreen }}>
          <div style={styles.statValue}>{stats.activeCases}</div>
          <div style={styles.statLabel}>Active Cases</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardYellow }}>
          <div style={styles.statValue}>{stats.totalReports}</div>
          <div style={styles.statLabel}>Public Reports</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardPurple }}>
          <div style={styles.statValue}>{stats.pendingMatches}</div>
          <div style={styles.statLabel}>Pending Matches</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardRed }}>
          <div style={styles.statValue}>{stats.confirmedMatches}</div>
          <div style={styles.statLabel}>Confirmed Matches</div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statCardTeal }}>
          <div style={styles.statValue}>{stats.successRate}%</div>
          <div style={styles.statLabel}>Success Rate</div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>System Overview</h3>
          <div style={styles.chartContainer}>
            <Pie data={statusData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Case Status</h3>
          <div style={styles.chartContainer}>
            <Bar
              data={caseStatusData}
              options={{
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '30px'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderLeft: '4px solid'
  },
  statCardBlue: {
    borderLeftColor: '#3b82f6'
  },
  statCardGreen: {
    borderLeftColor: '#10b981'
  },
  statCardYellow: {
    borderLeftColor: '#f59e0b'
  },
  statCardPurple: {
    borderLeftColor: '#8b5cf6'
  },
  statCardRed: {
    borderLeftColor: '#ef4444'
  },
  statCardTeal: {
    borderLeftColor: '#14b8a6'
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px'
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '20px'
  },
  chartContainer: {
    maxWidth: '400px',
    margin: '0 auto'
  }
};

export default Dashboard;
