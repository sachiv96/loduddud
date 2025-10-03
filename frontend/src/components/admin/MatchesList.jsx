import React, { useEffect, useState } from 'react';
import { matchesAPI } from '../../services/api';

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'pending', min_confidence: 60 });
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    loadMatches();
  }, [filter]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await matchesAPI.getAll(filter);
      setMatches(response.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (matchId, status, notes) => {
    try {
      await matchesAPI.reviewMatch(matchId, { status, notes });
      setSelectedMatch(null);
      loadMatches();
    } catch (error) {
      console.error('Error reviewing match:', error);
      alert('Failed to update match status');
    }
  };

  if (selectedMatch) {
    return (
      <MatchDetail
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onReview={handleReview}
      />
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Face Matches</h1>

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={styles.select}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Min Confidence</label>
          <input
            type="number"
            value={filter.min_confidence}
            onChange={(e) => setFilter({ ...filter, min_confidence: e.target.value })}
            style={styles.input}
            min="0"
            max="100"
          />
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading matches...</div>
      ) : matches.length === 0 ? (
        <div style={styles.empty}>No matches found</div>
      ) : (
        <div style={styles.matchesGrid}>
          {matches.map((match) => (
            <div
              key={match.id}
              style={styles.matchCard}
              onClick={() => setSelectedMatch(match)}
            >
              <div style={styles.matchHeader}>
                <span style={styles.caseNumber}>{match.case_number}</span>
                <span
                  style={{
                    ...styles.confidenceBadge,
                    backgroundColor: match.confidence >= 80 ? '#10b981' : match.confidence >= 70 ? '#f59e0b' : '#ef4444'
                  }}
                >
                  {match.confidence.toFixed(1)}%
                </span>
              </div>

              <div style={styles.matchInfo}>
                <h3 style={styles.personName}>{match.full_name}</h3>
                <p style={styles.infoText}>
                  {match.age && `Age: ${match.age}`}
                  {match.gender && ` | ${match.gender}`}
                </p>
              </div>

              <div style={styles.reportInfo}>
                <p style={styles.reportText}>
                  <strong>Report:</strong> {match.report_id}
                </p>
                <p style={styles.reportText}>
                  <strong>Location:</strong> {match.found_location}
                </p>
                <p style={styles.reportText}>
                  <strong>Reporter:</strong> {match.reporter_name || 'Anonymous'}
                </p>
              </div>

              <div style={styles.matchFooter}>
                <span style={styles.date}>
                  {new Date(match.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MatchDetail = ({ match, onClose, onReview }) => {
  const [notes, setNotes] = useState('');
  const [detailedMatch, setDetailedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetailedMatch();
  }, []);

  const loadDetailedMatch = async () => {
    try {
      const response = await matchesAPI.getById(match.id);
      setDetailedMatch(response.data);
    } catch (error) {
      console.error('Error loading match details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !detailedMatch) {
    return <div style={styles.loading}>Loading details...</div>;
  }

  return (
    <div style={styles.detailContainer}>
      <div style={styles.detailHeader}>
        <h2 style={styles.detailTitle}>Match Details</h2>
        <button onClick={onClose} style={styles.closeButton}>Close</button>
      </div>

      <div style={styles.detailContent}>
        <div style={styles.comparisonSection}>
          <div style={styles.imageColumn}>
            <h3 style={styles.columnTitle}>Missing Person</h3>
            <img
              src={detailedMatch.matched_photo}
              alt="Missing person"
              style={styles.comparisonImage}
            />
            <div style={styles.personDetails}>
              <p><strong>Case:</strong> {detailedMatch.case_number}</p>
              <p><strong>Name:</strong> {detailedMatch.full_name}</p>
              <p><strong>Age:</strong> {detailedMatch.age}</p>
              <p><strong>Gender:</strong> {detailedMatch.gender}</p>
              <p><strong>Phone:</strong> {detailedMatch.phone}</p>
              <p><strong>Email:</strong> {detailedMatch.email}</p>
            </div>
          </div>

          <div style={styles.matchIndicator}>
            <div style={styles.confidenceCircle}>
              {detailedMatch.confidence.toFixed(1)}%
            </div>
            <p style={styles.matchLabel}>Match Confidence</p>
          </div>

          <div style={styles.imageColumn}>
            <h3 style={styles.columnTitle}>Found Person Report</h3>
            <img
              src={detailedMatch.report_photo_path}
              alt="Found person"
              style={styles.comparisonImage}
            />
            <div style={styles.personDetails}>
              <p><strong>Report:</strong> {detailedMatch.report_id}</p>
              <p><strong>Location:</strong> {detailedMatch.found_location}</p>
              <p><strong>Address:</strong> {detailedMatch.found_address}</p>
              <p><strong>Reporter:</strong> {detailedMatch.reporter_name}</p>
              <p><strong>Contact:</strong> {detailedMatch.phone_number}</p>
              <p><strong>Notes:</strong> {detailedMatch.additional_notes}</p>
            </div>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h3 style={styles.sectionTitle}>Review Match</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this match..."
            style={styles.notesTextarea}
            rows="4"
          />

          <div style={styles.actionButtons}>
            <button
              onClick={() => onReview(match.id, 'confirmed', notes)}
              style={{ ...styles.actionButton, ...styles.confirmButton }}
            >
              Confirm Match
            </button>
            <button
              onClick={() => onReview(match.id, 'rejected', notes)}
              style={{ ...styles.actionButton, ...styles.rejectButton }}
            >
              Reject Match
            </button>
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
    marginBottom: '20px'
  },
  filters: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333'
  },
  select: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none'
  },
  input: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    width: '100px'
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
  matchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  matchHeader: {
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
  confidenceBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  matchInfo: {
    marginBottom: '15px'
  },
  personName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '5px'
  },
  infoText: {
    fontSize: '14px',
    color: '#666'
  },
  reportInfo: {
    borderTop: '1px solid #eee',
    paddingTop: '15px',
    marginBottom: '15px'
  },
  reportText: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '5px'
  },
  matchFooter: {
    borderTop: '1px solid #eee',
    paddingTop: '10px'
  },
  date: {
    fontSize: '12px',
    color: '#999'
  },
  detailContainer: {
    padding: '20px'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  detailTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  closeButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  detailContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  comparisonSection: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  imageColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  columnTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '15px'
  },
  comparisonImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '8px',
    marginBottom: '15px',
    border: '1px solid #ddd'
  },
  personDetails: {
    fontSize: '14px',
    lineHeight: '1.8'
  },
  matchIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confidenceCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '10px'
  },
  matchLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
    textAlign: 'center'
  },
  reviewSection: {
    borderTop: '2px solid #eee',
    paddingTop: '30px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '15px'
  },
  notesTextarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '20px'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px'
  },
  actionButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'white'
  },
  confirmButton: {
    backgroundColor: '#10b981'
  },
  rejectButton: {
    backgroundColor: '#ef4444'
  }
};

export default MatchesList;
