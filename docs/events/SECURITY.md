# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Active support  |
| 0.x.x   | ❌ No longer supported |

## Reporting a Vulnerability

We take the security of MakrX.events seriously. If you believe you have found a security vulnerability, please report it to us through coordinated disclosure.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please send an email to [security@makrx.events](mailto:security@makrx.events) with:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Your contact information for follow-up

### What to Include

**Vulnerability Details:**
- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Location of the vulnerability in the codebase
- Any special configuration required to reproduce

**Proof of Concept:**
- Step-by-step instructions to reproduce
- Screenshots or videos if applicable
- Sample payloads or exploit code (if safe to share)

**Impact Assessment:**
- What data could be accessed/modified
- What systems could be compromised
- Potential business impact

### Response Timeline

We aim to respond to security reports within:

- **24 hours**: Initial acknowledgment
- **72 hours**: Preliminary assessment
- **7 days**: Detailed response and timeline
- **30 days**: Resolution or mitigation

### Disclosure Policy

We follow coordinated disclosure principles:

1. **Report received**: We acknowledge receipt within 24 hours
2. **Investigation**: We investigate and validate the report
3. **Resolution**: We develop and test a fix
4. **Release**: We release the security fix
5. **Disclosure**: After users have had time to update, we may publicly disclose the vulnerability

### Responsible Disclosure Guidelines

**Please:**
- Give us reasonable time to fix the issue before public disclosure
- Avoid accessing or modifying data that doesn't belong to you
- Don't perform actions that could harm our users or systems
- Don't spam or flood our systems during testing

**We commit to:**
- Respond promptly to your report
- Keep you updated on our progress
- Credit you for the discovery (if desired)
- Not pursue legal action for good faith security research

## Security Measures

### Authentication & Authorization
- **Keycloak Integration**: Enterprise-grade identity management
- **Role-Based Access Control**: Granular permissions system
- **Session Management**: Secure session handling with proper expiration
- **Password Security**: Delegated to Keycloak with configurable policies

### Data Protection
- **Input Validation**: All user input is validated and sanitized
- **SQL Injection Prevention**: Parameterized queries using Drizzle ORM
- **XSS Prevention**: Input sanitization and Content Security Policy
- **CSRF Protection**: Built-in CSRF tokens for state-changing operations

### Infrastructure Security
- **HTTPS Enforcement**: TLS encryption for all communications
- **Environment Isolation**: Separate development and production environments
- **Database Security**: Encrypted connections and access controls
- **Secrets Management**: Environment-based secret handling

### API Security
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Authentication Required**: Protected endpoints require valid authentication
- **Input Validation**: Schema-based validation for all API requests
- **Error Handling**: Secure error responses without information disclosure

### Development Security
- **Dependency Scanning**: Regular security updates for dependencies
- **Code Review**: Security-focused code review process
- **Static Analysis**: Automated security scanning in CI/CD
- **Security Headers**: Proper security headers configuration

## Security Best Practices for Contributors

### Code Security
```typescript
// ✅ Good: Parameterized queries
const user = await db.select().from(users).where(eq(users.id, userId));

// ❌ Bad: String concatenation (vulnerable to SQL injection)
const user = await db.execute(sql`SELECT * FROM users WHERE id = '${userId}'`);
```

### Input Validation
```typescript
// ✅ Good: Schema validation
const schema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
});
const validatedData = schema.parse(input);

// ❌ Bad: No validation
const { email, name } = request.body;
```

### Authentication
```typescript
// ✅ Good: Proper authentication check
const user = await getAuthenticatedUser(request);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// ❌ Bad: Trusting client-side data
const userId = request.headers.get('user-id');
```

### Error Handling
```typescript
// ✅ Good: Safe error messages
catch (error) {
  console.error('Database error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// ❌ Bad: Exposing internal details
catch (error) {
  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
```

## Vulnerability Categories

### High Priority
- Remote code execution
- SQL injection
- Authentication bypass
- Authorization flaws
- Sensitive data exposure

### Medium Priority
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Server-side request forgery (SSRF)
- Path traversal
- Information disclosure

### Low Priority
- Denial of service (rate limiting bypass)
- Clickjacking
- Missing security headers
- Verbose error messages
- Insecure direct object references

## Security Updates

Security updates will be:

1. **Released promptly**: Critical issues within 24-48 hours
2. **Clearly documented**: Security advisories with details
3. **Backward compatible**: When possible, without breaking changes
4. **Well communicated**: Through GitHub Security Advisories and email

## Hall of Fame

We recognize security researchers who help improve our security:

<!-- Security researchers who have responsibly disclosed vulnerabilities -->
<!-- will be listed here with their permission -->

*No vulnerabilities reported yet.*

## Contact

For security-related questions or concerns:

- **Security issues**: [security@makrx.events](mailto:security@makrx.events)
- **General support**: [support@makrx.events](mailto:support@makrx.events)
- **GitHub Security**: [GitHub Security Advisories](https://github.com/your-org/makrx-events/security/advisories)

---

Thank you for helping keep MakrX.events secure! 🔒