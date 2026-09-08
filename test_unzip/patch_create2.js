const fs = require('fs');
let code = fs.readFileSync('app/create/CreateEventForm.tsx', 'utf-8');

const oldActions = `      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        {step > 0 ? (
          <button 
            type="button" 
            onClick={prevStep} 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
          >
            <ChevronLeft size={18} />
            Back
          </button>
        ) : (
          <div /> // Spacer
        )}

        {step < STEPS.length - 1 ? (
          <button 
            type="button" 
            onClick={nextStep} 
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: 'var(--accent-primary)' }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => submitCompetition('PUBLISHED')} 
            className="btn-primary" 
            disabled={loading}
            style={{ padding: '10px 24px', backgroundColor: 'var(--accent-primary)' }}
          >
            {loading ? 'Publishing...' : 'Publish Competition'}
          </button>
        )}
      </div>`;

const newActions = `      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '16px',
        marginTop: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)'
      }}>
        {step > 0 ? (
          <button 
            type="button" 
            onClick={prevStep} 
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              flexShrink: 0
            }}
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div style={{ width: '48px', height: '48px', flexShrink: 0 }} />
        )}

        {step < STEPS.length - 1 ? (
          <button 
            type="button" 
            onClick={nextStep} 
            style={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 24px',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              borderRadius: '999px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            type="button" 
            onClick={() => submitCompetition('PUBLISHED')} 
            disabled={loading}
            style={{ 
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 24px',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              borderRadius: '999px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? 'Publishing...' : 'Publish Competition'}
          </button>
        )}
      </div>`;

if (code.includes(oldActions)) {
  code = code.replace(oldActions, newActions);
  fs.writeFileSync('app/create/CreateEventForm.tsx', code);
  console.log("Updated buttons successfully!");
} else {
  console.log("Could not find old actions!");
}
