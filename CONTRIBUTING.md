# Contributing to ThesisMap (t-map)

First off, thank you for considering contributing to ThesisMap! It's people like you who make ThesisMap such a great tool for students and researchers.

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for ThesisMap. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Explain which behavior you expected to see and why** and why you think the current behavior is a bug.
* **Include screenshots** if the problem is visual.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for ThesisMap, including completely new features and minor improvements to existing functionality.

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Explain why this enhancement would be useful** to most ThesisMap users.

### Pull Requests

* Fill in the required template (if available).
* Do not include issue numbers in the PR title.
* Include screenshots and animated GIFs in your pull request whenever possible.
* Follow the style guides.
* Changes must be verified by the user who submitted the PR before being merged.

## Development Setup

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by copying `.env.example` to `.env` and filling in the details.
4. Start the server:
   ```bash
   npm start
   ```

## Style Guides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript/React Style Guide

* Use functional components and hooks.
* Follow the existing directory structure for components and pages.
* Use CSS Modules for styling (`*.module.css`).
* Maintain clean and readable code with appropriate comments.

## Bangladesh-Specific Context
Please keep in mind that this project prioritizes:
- **Offline-first architecture**: Core features should work without internet.
- **Performance**: Interactions should feel instant (< 100ms).
- **Accessibility**: Optimized for low-end devices.

## Questions?

If you have any questions, feel free to open an issue or contact the maintainers.

Happy coding! 🚀
