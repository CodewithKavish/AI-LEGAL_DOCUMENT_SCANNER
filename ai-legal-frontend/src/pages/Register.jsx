import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0e0e10;
    color: #e8e6e0;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-page::before {
    content: '';
    position: absolute;
    top: -180px;
    right: -120px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(126,159,200,0.08) 0%, transparent 70%);
    pointer-events: none;
    animation: drift 12s ease-in-out infinite alternate;
  }
  .auth-page::after {
    content: '';
    position: absolute;
    bottom: -140px;
    left: -100px;
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(200,169,126,0.06) 0%, transparent 70%);
    pointer-events: none;
    animation: drift 14s ease-in-out infinite alternate-reverse;
  }
  @keyframes drift {
    from { transform: translate(0, 0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.08); }
  }

  .auth-card {
    position: relative;
    z-index: 1;
    width: 420px;
    max-width: 92vw;
    background: #16161a;
    border: 1px solid #2a2a32;
    border-radius: 16px;
    padding: 40px 36px;
    animation: cardIn 0.4s ease;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .auth-brand {
    text-align: center;
    margin-bottom: 32px;
  }
  .auth-brand .label {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7e9fc8;
    margin-bottom: 6px;
  }
  .auth-brand h1 {
    font-family: 'Lora', serif;
    font-size: 26px;
    font-weight: 600;
    color: #e8e6e0;
    line-height: 1.2;
  }
  .auth-brand .subtitle {
    font-size: 11px;
    color: #6b6b7a;
    margin-top: 8px;
    line-height: 1.5;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #6b6b7a;
  }
  .field input {
    width: 100%;
    padding: 12px 14px;
    background: #1e1e24;
    border: 1px solid #2a2a32;
    border-radius: 9px;
    color: #e8e6e0;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field input::placeholder { color: #4a4a56; }
  .field input:focus {
    border-color: rgba(126,159,200,0.5);
    box-shadow: 0 0 0 3px rgba(126,159,200,0.08);
  }

  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .btn-auth {
    width: 100%;
    padding: 13px;
    background: #7e9fc8;
    color: #0e0e10;
    border: none;
    border-radius: 9px;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
    margin-top: 6px;
  }
  .btn-auth:hover {
    opacity: 0.9;
    box-shadow: 0 4px 20px rgba(126,159,200,0.2);
  }
  .btn-auth:active { transform: scale(0.98); }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 4px 0;
  }
  .auth-divider::before,
  .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #2a2a32;
  }
  .auth-divider span {
    font-size: 10px;
    color: #4a4a56;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .auth-footer {
    text-align: center;
    margin-top: 24px;
    font-size: 12px;
    color: #6b6b7a;
  }
  .auth-footer a {
    color: #c8a97e;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s;
  }
  .auth-footer a:hover {
    color: #e0c9a0;
    text-decoration: underline;
  }

  .auth-decoration {
    position: absolute;
    top: -1px;
    left: 36px;
    right: 36px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #7e9fc8, #c8a97e, transparent);
    border-radius: 0 0 2px 2px;
    opacity: 0.6;
  }
`;

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-decoration" />

          <div className="auth-brand">
            <div className="label">DocReader</div>
            <h1>Create Account</h1>
            <div className="subtitle">Start analysing legal documents with AI-powered insights</div>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="name-row">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-auth">
              Create Account
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}
