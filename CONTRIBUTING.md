# 🤝 Contributing to AgriGPT-PK

Thank you for your interest in contributing to AgriGPT-PK! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Race
- Religion
- Nationality

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before submitting a bug report:
1. Check existing issues to avoid duplicates
2. Verify it's not a configuration problem
3. Collect information about your environment

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen.

**Screenshots**
If applicable.

**Environment:**
- OS: [e.g., Windows 11]
- Node.js: [e.g., 16.14.0]
- Python: [e.g., 3.9.7]
- Browser: [e.g., Chrome 120]
```

### 💡 Suggesting Features

Feature requests are welcome! Please provide:
- Clear use case
- Expected behavior
- Why this benefits users
- Potential implementation approach (optional)

### 🔧 Code Contributions

Areas where we welcome contributions:
- **ML Models**: Improve accuracy, add new disease classes
- **Frontend**: UI/UX enhancements, accessibility improvements
- **Backend**: Performance optimizations, new API endpoints
- **Documentation**: Tutorials, API examples, translations
- **Testing**: Unit tests, integration tests, E2E tests
- **Localization**: Add support for more languages (Punjabi, Sindhi, etc.)

## 🛠️ Development Setup

### Prerequisites

```bash
Node.js 16+
Python 3.8+
MongoDB 4.4+
Git
```

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Plant-Classification_h.git
cd Plant-Classification_h

# Add upstream remote
git remote add upstream https://github.com/ChAhmadAbdullah/Plant-Classification_h.git
```

### Install Dependencies

**Backend:**
```bash
cd backend
npm install

# Python dependencies
pip install -r ml_model/requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Environment Configuration

```bash
# Copy example environment files
cp .env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your credentials
```

### Running Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - MongoDB (if local):**
```bash
mongod
```

## 📝 Coding Standards

### JavaScript/React

- Use ES6+ syntax
- Follow Airbnb style guide
- Use meaningful variable names
- Add JSDoc comments for functions
- Use functional components with hooks
- Keep components small and focused

**Example:**
```javascript
/**
 * Predicts plant disease from uploaded image
 * @param {File} imageFile - The image file to analyze
 * @param {number} threshold - Confidence threshold (0-1)
 * @returns {Promise<Object>} Prediction result
 */
async function predictDisease(imageFile, threshold = 0.60) {
  // Implementation
}
```

### Python

- Follow PEP 8 style guide
- Use type hints
- Add docstrings
- Keep functions pure when possible

**Example:**
```python
def predict_image(image: Image, conf_thresh: float = 0.60) -> dict:
    """
    Predict plant disease from PIL Image.
    
    Args:
        image: PIL Image object
        conf_thresh: Confidence threshold (default 0.60)
    
    Returns:
        dict: Prediction results with class, confidence, and alternatives
    """
    # Implementation
```

### File Naming

- JavaScript/React: camelCase for variables, PascalCase for components
- Python: snake_case for everything
- Files: kebab-case or PascalCase for components

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, tooling changes

### Examples

```bash
feat(ml): add confidence threshold configuration

Allow users to set custom confidence thresholds for predictions.
Defaults to 0.60 but can be adjusted per request.

Closes #123
```

```bash
fix(auth): resolve OTP expiration bug

OTP tokens were not expiring correctly due to timezone issue.
Now using UTC consistently across the application.
```

```bash
docs(readme): update installation instructions

Added troubleshooting section for MongoDB Atlas connectivity.
Clarified Python version requirements.
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feat/your-feature-name
   ```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (README, API docs, etc.)
- [ ] No new warnings introduced
- [ ] Tests added/updated (if applicable)
- [ ] All tests passing
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] Tests passing
```

### Review Process

1. Maintainers will review within 2-3 days
2. Address feedback and update PR
3. Once approved, maintainers will merge
4. Your contribution will be credited in release notes

## 🧪 Testing

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**Python ML:**
```bash
cd backend/ml_model
pytest
```

### Writing Tests

- Aim for 80%+ code coverage
- Test edge cases and error conditions
- Use descriptive test names

**Example:**
```javascript
describe('predictDisease', () => {
  it('should return prediction with valid image', async () => {
    // Test implementation
  });

  it('should throw error with invalid file type', async () => {
    // Test implementation
  });

  it('should respect confidence threshold', async () => {
    // Test implementation
  });
});
```

## 🌐 Localization

To add a new language:

1. Add translations to `frontend/src/utils/constants.js`:
   ```javascript
   export const UI_TEXT = {
     punjabi: {
       appName: 'ਐਗਰੀ-ਜੀਪੀਟੀ-ਪੀਕੇ',
       // ... other translations
     }
   };
   ```

2. Update `LANGUAGES` constant
3. Test all UI elements
4. Submit PR with screenshots

## 📚 Documentation

Good documentation is crucial! Please update:
- **README.md**: If changing features or setup
- **API Documentation**: For new endpoints
- **Code Comments**: For complex logic
- **ARCHITECTURE.md**: For structural changes

## 🙏 Recognition

All contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in the About page (if significant contribution)

## 📞 Questions?

- Open a discussion on GitHub
- Check existing issues/PRs
- Contact maintainers: ahsankhizar1075@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AgriGPT-PK! Together we're making agricultural expertise accessible to millions of farmers. 🌱**
