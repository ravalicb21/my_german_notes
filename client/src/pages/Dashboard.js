import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#333' }}>
            My German Notes
          </h1>
          <p style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>
            Welcome back, {user?.username}!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary"
        >
          Logout
        </button>
      </header>

      <main className="container">
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>
            🎉 Welcome to My German Notes!
          </h2>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
            Your authentication system is working perfectly. This is where your German learning journey begins!
          </p>
          
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
              Your Profile
            </h3>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Member since:</strong> {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>

          <div style={{ color: '#666' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#333' }}>
              Coming Soon Features:
            </h3>
            <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
              <li>📝 Create and organize German vocabulary notes</li>
              <li>📚 Study different grammar topics</li>
              <li>🔄 Practice with flashcards</li>
              <li>📊 Track your learning progress</li>
              <li>🎯 Set learning goals</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;