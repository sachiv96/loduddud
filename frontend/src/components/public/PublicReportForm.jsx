import React, { useState } from 'react';
import { publicAPI } from '../../services/api';

const PublicReportForm = () => {
  const [formData, setFormData] = useState({
    reporter_name: '',
    phone_number: '',
    found_location: '',
    found_address: '',
    additional_notes: ''
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setPhoto(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!photo) {
      setError('Please upload a photo');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('photo', photo);
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await publicAPI.submitReport(data);
      setResult(response.data);
      setFormData({
        reporter_name: '',
        phone_number: '',
        found_location: '',
        found_address: '',
        additional_notes: ''
      });
      setPhoto(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Report Submitted Successfully!</h2>
          <p style={styles.successText}>Your report ID is:</p>
          <div style={styles.reportId}>{result.reportId}</div>
          <p style={styles.infoText}>
            Please save this ID for future reference. Our system will automatically
            match your photo against our database of missing persons.
          </p>
          <button
            onClick={() => setResult(null)}
            style={styles.newReportButton}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Report a Found Person</h1>
        <p style={styles.subtitle}>
          Help reunite missing persons with their families. Upload a photo and location details.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Photo *</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handlePhotoChange}
              style={styles.fileInput}
              required
            />
            {preview && (
              <div style={styles.previewContainer}>
                <img src={preview} alt="Preview" style={styles.preview} />
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              name="reporter_name"
              value={formData.reporter_name}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Enter your name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Location Where Found *</label>
            <input
              type="text"
              name="found_location"
              value={formData.found_location}
              onChange={handleInputChange}
              style={styles.input}
              placeholder="e.g., Railway Station, Bus Stop"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Complete Address</label>
            <textarea
              name="found_address"
              value={formData.found_address}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Enter complete address with landmarks"
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Additional Notes</label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleInputChange}
              style={styles.textarea}
              placeholder="Any additional information that might help"
              rows="4"
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submitButton,
              ...(submitting ? styles.submitButtonDisabled : {})
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '40px 20px'
  },
  card: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px'
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  textarea: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  fileInput: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  previewContainer: {
    marginTop: '10px'
  },
  preview: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px'
  },
  submitButton: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px'
  },
  successCard: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '60px 40px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#059669',
    marginBottom: '20px'
  },
  successText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '10px'
  },
  reportId: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    backgroundColor: '#f0f9ff',
    padding: '20px',
    borderRadius: '8px',
    margin: '20px 0'
  },
  infoText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  newReportButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: 'white',
    border: '2px solid #2563eb',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
};

export default PublicReportForm;
