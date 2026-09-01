const fs = require('fs');
let code = fs.readFileSync('app/create/CreateEventForm.tsx', 'utf-8');

// Faster animation
code = code.replace(/animation: 'fadeIn 0\.3s ease'/g, "animation: 'fadeIn 0.15s ease-out'");

// Replace buttons
const oldButtonsRegex = /\{\/\* Action Buttons \*\/\}[\\s\\S]*?<\/div>\s*<\/div>\s*\);\s*\}/;

const newButtons = `{/* Action Buttons */}
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
      </div>
    </div>
  );
}`;

code = code.replace(oldButtonsRegex, newButtons);
fs.writeFileSync('app/create/CreateEventForm.tsx', code);
console.log("Updated buttons in CreateEventForm");
