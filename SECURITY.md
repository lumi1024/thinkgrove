# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in ThinkGrove, please report it responsibly.

**Do NOT open a public issue for security vulnerabilities.**

Instead, please send a detailed report to the maintainers via email or GitHub private security advisory:

1. **GitHub Security Advisory** (preferred): Use the "Security" tab on the GitHub repo → "Report a vulnerability"
2. **Email**: Send details to the project maintainers

## What to Include

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 3 business days
- **Initial assessment**: Within 7 business days
- **Fix timeline**: Depends on severity
  - Critical (auth bypass, RCE, data leak): Target 7 days
  - High (XSS, injection, DoS): Target 14 days
  - Medium/Low: Next scheduled release

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x     | Yes       |

## Security Considerations for Self-Hosters

- **API keys**: Store your `.env` file securely. Never commit it.
- **Database**: The SQLite file (`data/forest.db`) should have appropriate filesystem permissions (chmod 600 recommended).
- **Session secrets**: If deploying publicly, set a strong `SESSION_SECRET` environment variable.
- **HTTPS**: Always use a reverse proxy (nginx/Caddy) with TLS in production.
- **Network exposure**: The app is designed for single-instance deployment. Do not expose directly to the internet without a proxy.
