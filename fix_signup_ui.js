const fs = require('fs');
const path = 'app/signup/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

if (!content.includes('checkEmailExists')) {
    content = content.replace("import { signupNewUser } from './actions';", "import { signupNewUser, checkEmailExists } from './actions';");
}

const oldHandler = `  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) return setError('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');

    setStep(2);
  };`;

const newHandler = `  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const handleStep1Continue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) return setError('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');

    setIsCheckingEmail(true);
    const exists = await checkEmailExists(formData.email);
    setIsCheckingEmail(false);
    
    if (exists) {
      setError('Email already registered. Please sign in.');
      return;
    }

    setStep(2);
  };`;
content = content.replace(oldHandler, newHandler);

const oldBtn = `<button type="submit" className="login-btn-primary">
                  Continue
                </button>`;
const newBtn = `<button type="submit" className="login-btn-primary" disabled={isCheckingEmail}>
                  {isCheckingEmail ? 'Checking...' : 'Continue'}
                </button>`;
content = content.replace(oldBtn, newBtn);

fs.writeFileSync(path, content);
console.log("signup fixed");
