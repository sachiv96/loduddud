import React, { useEffect, useState } from 'react';
import { missingPersonsAPI } from '../../services/api';

const CasesList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadCases();
  }, [filter]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const response = await missingPersonsAPI.getAll(filter);
      setCases(response.data);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await missingPersonsAPI.updateStatus(id, status);
      loadCases();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update case status');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Missing Person Cases</h1>

      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('active')}
          style={{
            ...styles.filterButton,
            ...(filter === 'active' ? styles.filterButtonActive : {})
          }}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('found')}
          style={{
            ...styles.filterButton,
            ...(filter === 'found' ? styles.filterButtonActive : {})
          }}
        >
          Found
        </button>
        <button
          onClick={() => setFilter('closed')}
          style={{
            ...styles.filterButton,
            ...(filter === 'closed' ? styles.filterButtonActive : {})
          }}
        >
          Closed
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading cases...</div>
      ) : cases.length === 0 ? (
        <div style={styles.empty}>No cases found</div>
      ) : (
        <div style={styles.casesGrid}>
          {cases.map((caseItem) => (
            <div key={caseItem.id} style={styles.caseCard}>
              <div style={styles.caseHeader}>
                <span style={styles.caseNumber}>{caseItem.case_number}</span>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor:
                      caseItem.status === 'active'
                        ? '#3b82f6'
                        : caseItem.status === 'found'
                        ? '#10b981'
                        : '#6b7280'
                  }}
                >
                  {caseItem.status}
                </span>
              </div>

              <div style={styles.caseInfo}>
                <h3 style={styles.personName}>{caseItem.full_name}</h3>
                <p style={styles.infoText}>
                  {caseItem.age && `Age: ${caseItem.age}`}
                  {caseItem.gender && ` | ${caseItem.gender}`}
                </p>
                <p style={styles.infoText}>
                  <strong>Last Seen:</strong> {caseItem.last_seen_location}
                </p>
                <p style={styles.infoText}>
                  <strong>Date:</strong>{' '}
                  {caseItem.last_seen_date
                    ? new Date(caseItem.last_seen_date).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p style={styles.infoText}>
                  <strong>Registered:</strong>{' '}
                  {new Date(caseItem.created_at).toLocaleDateString()}
                </p>
              </div>

              <div style={styles.caseActions}>
                <select
                  value={caseItem.status}
                  onChange={(e) => handleStatusChange(caseItem.id, e.target.value)}
                  style={styles.statusSelect}
                >
                  <option value="active">Active</option>
                  <option value="found">Found</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
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
    marginBottom: '20px'
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px'
  },
  filterButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  filterButtonActive: {
    color: 'white',
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#666'
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    fontSize: '16px',
    color: '#666',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  casesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  caseCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  caseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  caseNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase'
  },
  caseInfo: {
    marginBottom: '15px'
  },
  personName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '10px'
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px'
  },
  caseActions: {
    borderTop: '1px solid #eee',
    paddingTop: '15px'
  },
  statusSelect: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    cursor: 'pointer'
  }
};

export default CasesList;
