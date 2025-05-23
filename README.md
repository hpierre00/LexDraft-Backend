# LexDraft AI ⚖️✨

**LexDraft AI** is an innovative AI-powered legal document automation platform designed to streamline the generation, collaboration, and management of legal documents such as contracts, motions, and research reports.

## 🚀 Key Features

### AI-Powered Document Generation
- Integrates GPT-4 to automatically generate precise legal documents.
- Customizable templates for various document types.
- Intelligent document analysis and suggestions for improvements.

### Seamless Collaboration
- Real-time collaborative editing using WebSockets.
- Free email invitations with role-based access (view, edit, admin).

### Secure and Compliant
- Authentication and role management with Supabase.
- Secure storage and management of legal documents using PostgreSQL.
- Full encryption for data at rest and in transit, ensuring compliance with legal privacy standards.

### Integrated Payments
- Accept credit card and ACH payments securely via Stripe.
- Flexible billing options: subscription-based and pay-per-use.

### Digital Signatures
- Canvas-based digital signature creation and verification.
- Supports PNG and SVG signature uploads.

## 🛠️ Tech Stack

- **Frontend:** Next.js, ShadCN UI
- **Backend:** FastAPI, Python-docx, ReportLab
- **Database & Authentication:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **AI Integration:** GPT-4 API (OpenAI)

## 📦 Installation

Clone the repository:
```bash
git clone https://github.com/yourusername/lexdraft-ai.git
cd lexdraft-ai
```

Install frontend dependencies:
```bash
cd frontend
npm install
```

Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## 🚧 Setup

### Environment Variables

Create `.env` files for both frontend and backend using provided `.env.example` files. Configure API keys, Stripe keys, and database credentials.

### Database Initialization

Use Supabase to create a PostgreSQL database and set up authentication. Follow the provided database schema to initialize your tables.

## 🚀 Running the App

Start the backend (FastAPI):
```bash
cd backend
uvicorn main:app --reload
```

Start the frontend (Next.js):
```bash
cd frontend
npm run dev
```

## ✅ Testing & Deployment

- Conduct unit and integration testing before deployment.
- Deploy backend on platforms like Render, AWS, or Heroku.
- Deploy frontend on Vercel or Netlify.

## 💡 Usage

1. **Generate Documents:** Select a template and enter required information to generate a legal document instantly.
2. **Collaborate:** Invite team members via email and collaborate in real-time.
3. **Review & Sign:** Edit, review, and digitally sign documents securely within the platform.
4. **Payment:** Manage subscription or pay-per-document securely through Stripe integration.

## 📞 Support

For support, feature requests, or bug reporting, please create an issue in the GitHub repository.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

