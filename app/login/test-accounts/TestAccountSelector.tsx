'use client'

import React, { useState } from 'react';
import { directTestLogin } from './actions';
import Image from 'next/image';

type TestAccount = {
  id: string;
  name: string | null;
  username: string | null;
  accountType: string;
  roleContext: string | null;
  avatarData: string | null;
};

export default function TestAccountSelector({ accounts }: { accounts: TestAccount[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const tabs = ['All', 'Personal', 'Business', 'Creator', 'Influencer', 'Organization'];

  const filteredAccounts = accounts.filter(acc => {
    if (filter !== 'All') {
      if (filter === 'Personal' && acc.accountType !== 'PERSONAL') return false;
      if (filter === 'Business' && acc.accountType !== 'BUSINESS') return false;
      if (filter === 'Creator' && acc.accountType !== 'CREATOR') return false;
      if (filter === 'Influencer' && acc.accountType !== 'INFLUENCER') return false;
      if (filter === 'Organization' && acc.accountType !== 'ORGANIZATION') return false;
    }
    
    if (search) {
      const q = search.toLowerCase();
      const matchName = acc.name?.toLowerCase().includes(q);
      const matchUsername = acc.username?.toLowerCase().includes(q);
      const matchRole = acc.roleContext?.toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchRole) return false;
    }

    return true;
  });

  const handleLogin = async (id: string) => {
    setLoadingId(id);
    try {
      await directTestLogin(id);
    } catch (err) {
      console.error(err);
      alert('Failed to login. See console.');
      setLoadingId(null);
    }
  };

  return (
    <div className="test-selector-container">
      {/* Background Texture Overlay (same as login page) */}
      <div className="login-bg-texture"></div>

      <div className="test-selector-content">
        <div className="test-selector-header">
          <Image 
            src="/amerigam-logo-transparent.png" 
            alt="Amerigam Logo" 
            width={60} 
            height={27} 
            style={{ objectFit: 'contain', marginBottom: '16px' }}
          />
          <h1 className="login-headline" style={{ fontSize: '28px', marginBottom: '8px' }}>Choose an account</h1>
          <p className="login-subtext" style={{ marginBottom: '24px' }}>Select a testing account to continue as.</p>
        </div>

        <div className="test-selector-controls">
          <input 
            type="text" 
            placeholder="Search accounts (name, @username, role)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="test-selector-search"
          />

          <div className="test-selector-tabs">
            {tabs.map(t => (
              <button 
                key={t}
                onClick={() => setFilter(t)}
                className={`test-tab ${filter === t ? 'active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="test-selector-list">
          {filteredAccounts.map(acc => (
            <div key={acc.id} className="test-account-card" onClick={() => handleLogin(acc.id)}>
              <div className="test-account-avatar">
                {acc.avatarData ? (
                  <img src={acc.avatarData} alt={acc.name || ''} />
                ) : (
                  <div className="test-avatar-placeholder">
                    {acc.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="test-account-info">
                <div className="test-account-name">{acc.name}</div>
                <div className="test-account-meta">
                  <span className="test-account-username">@{acc.username}</span>
                  <span className="test-account-type">{acc.accountType}</span>
                </div>
                {acc.roleContext && (
                  <div className="test-account-role">{acc.roleContext}</div>
                )}
              </div>
              <div className="test-account-action">
                {loadingId === acc.id ? (
                  <div className="spinner"></div>
                ) : (
                  <span>Log in &rarr;</span>
                )}
              </div>
            </div>
          ))}

          {filteredAccounts.length === 0 && (
            <div className="test-no-results">
              No accounts found for your search.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .test-selector-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 100;
          background-color: #000000;
          color: #ffffff;
          overflow: hidden;
          display: flex;
          justify-content: center;
          font-family: "Inter", sans-serif;
        }
        .test-selector-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 600px;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }
        .test-selector-header {
          text-align: center;
          flex-shrink: 0;
        }
        .test-selector-controls {
          margin-bottom: 24px;
          flex-shrink: 0;
        }
        .test-selector-search {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 20px;
          color: white;
          font-size: 15px;
          margin-bottom: 16px;
          outline: none;
          transition: border-color 0.2s;
        }
        .test-selector-search:focus {
          border-color: rgba(255, 255, 255, 0.3);
        }
        .test-selector-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        .test-selector-tabs::-webkit-scrollbar {
          display: none;
        }
        .test-tab {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #A1A1AA;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .test-tab.active, .test-tab:hover {
          background: white;
          color: black;
          border-color: white;
        }
        .test-selector-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 40px;
        }
        .test-selector-list::-webkit-scrollbar {
          width: 6px;
        }
        .test-selector-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .test-account-card {
          display: flex;
          align-items: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .test-account-card:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .test-account-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 16px;
          flex-shrink: 0;
          background: #1A1A1A;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .test-account-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .test-avatar-placeholder {
          font-size: 20px;
          font-weight: 600;
          color: #A1A1AA;
        }
        .test-account-info {
          flex: 1;
          min-width: 0;
        }
        .test-account-name {
          font-weight: 600;
          font-size: 15px;
          color: #ffffff;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .test-account-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #A1A1AA;
          margin-bottom: 4px;
        }
        .test-account-type {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        .test-account-role {
          font-size: 12px;
          color: #E4E4E7;
          background: rgba(255, 255, 255, 0.05);
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          margin-top: 4px;
        }
        .test-account-action {
          font-size: 13px;
          font-weight: 600;
          color: #A1A1AA;
          padding-left: 16px;
        }
        .test-account-card:hover .test-account-action {
          color: #ffffff;
        }
        .test-no-results {
          text-align: center;
          color: #A1A1AA;
          padding: 40px;
          font-size: 14px;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
