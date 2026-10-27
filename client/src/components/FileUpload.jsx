import { useState } from 'react';

const API_URL = 'http://localhost:5000';

function FileUpload() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return showMessage(data.error || 'Login failed', true);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      showMessage('Logged in. You can now upload a file.');
    } catch {
      showMessage('Could not reach the server. Is it running?', true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setFile(null);
    setUploadedUrl('');
    showMessage('Logged out.');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return showMessage('Please choose a file first.', true);

    const formData = new FormData();
    formData.append('file', file); // field name must match upload.single('file')

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadedUrl('');
        return showMessage(data.error || 'Upload failed', true);
      }
      setUploadedUrl(`${API_URL}${data.url}`);
      showMessage(`${data.message}: ${data.filename}`);
    } catch {
      showMessage('Could not reach the server. Is it running?', true);
    }
  };

  const isPdf = uploadedUrl.toLowerCase().endsWith('.pdf');

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16, textAlign: 'left' }}>
      <h1>File Upload</h1>

      {!token ? (
        <form onSubmit={handleLogin}>
          <h2>Step 1: Log in</h2>
          <p>
            <label htmlFor="username">Username </label>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </p>
          <p>
            <label htmlFor="password">Password </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </p>
          <button type="submit">Log in</button>
        </form>
      ) : (
        <form onSubmit={handleUpload}>
          <h2>Step 2: Choose a file</h2>
          <p>
            <label htmlFor="file">JPG, PNG or PDF, up to 2 MB </label>
            <br />
            <input id="file" type="file" onChange={(e) => setFile(e.target.files[0] || null)} />
          </p>
          <button type="submit">Upload</button>{' '}
          <button type="button" onClick={handleLogout}>Log out</button>
        </form>
      )}

      {message && (
        <p role={isError ? 'alert' : 'status'} style={{ color: isError ? 'crimson' : 'green' }}>
          {message}
        </p>
      )}

      {uploadedUrl && (
        <div>
          <h3>Uploaded file</h3>
          {isPdf ? (
            <a href={uploadedUrl} target="_blank" rel="noreferrer">Open the uploaded PDF</a>
          ) : (
            <img src={uploadedUrl} alt="Uploaded file preview" style={{ maxWidth: '100%' }} />
          )}
          <p><a href={uploadedUrl} target="_blank" rel="noreferrer">{uploadedUrl}</a></p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;