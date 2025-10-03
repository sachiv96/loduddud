import React, { useState } from 'react';
import { missingPersonsAPI } from '../../services/api';

const RegisterCase = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    aadhar: '',
    phone: '',
    email: '',
    last_seen_location: '',
    last_seen_date: '',
    physical_description: ''
  });
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
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
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      setError('Maximum 10 photos allowed');
      return;
    }

    setPhotos(files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    photos.forEach((photo) => {
      data.append('photos', photo);
    });

    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await missingPersonsAPI.create(data);
      setResult(response.data);
      setFormData({
        full_name: '',
        age: '',
        gender: '',
        aadhar: '',
        phone: '',
        email: '',
        last_seen_location: '',
        last_seen_date: '',
        physical_description: ''
      });
      setPhotos([]);
      setPreviews([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register case');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Case Registered Successfully!</h2>
          <p style={styles.successText}>Case Number:</p>
          <div style={styles.caseNumber}>{result.caseNumber}</div>
          <button
            onClick={() => setResult(null)}
            style={styles.newCaseButton}
          >
            Register Another Case
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register Missing Person</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={styles.input}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Aadhar Number</label>
              <input
                type="text"
                name="aadhar"
                value={formData.aadhar}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="12 digit number"
              />
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Seen Location</label>
            <input
              type="text"
              name="last_seen_location"
              value={formData.last_seen_location}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Last Seen Date</label>
            <input
              type="date"
              name="last_seen_date"
              value={formData.last_seen_date}
              onChange={handleInputChange}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Physical Description</label>
            <textarea
              name="physical_description"
              value={formData.physical_description}
              onChange={handleInputChange}
              style={styles.textarea}
              rows="4"
              placeholder="Height, weight, distinguishing features, clothing, etc."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Photos (Max 10) *</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handlePhotoChange}
              style={styles.fileInput}
              required
            />
            {previews.length > 0 && (
              <div style={styles.previewGrid}>
                {previews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={styles.previewImage}
                  />
                ))}
              </div>
            )}
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
            {submitting ? 'Registering...' : 'Register Case'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
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
    outline: 'none'
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
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '15px'
  },
  previewImage: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  submitButton: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
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
    fontSize: '24px',
    fontWeight: '600',
    color: '#059669',
    marginBottom: '20px'
  },
  successText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '10px'
  },
  caseNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    backgroundColor: '#f0f9ff',
    padding: '15px',
    borderRadius: '8px',
    margin: '20px 0'
  },
  newCaseButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: 'white',
    border: '2px solid #2563eb',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default RegisterCase;
