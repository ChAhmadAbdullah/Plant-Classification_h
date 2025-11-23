# Agriculture Chat Frontend

Modern React frontend for Agriculture Chat Assistant with Tailwind CSS, JWT authentication, and OTP verification.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔐 JWT Authentication
- 📧 OTP Email Verification
- 💬 Real-time Chat Interface
- 📤 Image & Voice Upload
- 📱 Fully Responsive Design
- 🌐 Bilingual Support (English/Urdu)
- 🛡️ Protected Routes

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_NODE_ENV=development
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

Application will run on `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── chat/         # Chat components
│   │   ├── common/       # Common components
│   │   └── upload/       # Upload components
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Chat.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Upload.jsx
│   │   ├── History.jsx
│   │   └── About.jsx
│   ├── services/        # API services
│   │   ├── api.js
│   │   ├── chatService.js
│   │   └── imageService.js
│   ├── utils/          # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Tailwind CSS
├── .env.example        # Environment variables template
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Authentication Flow

### Registration
1. User enters email
2. System sends OTP to email (valid for 2 minutes)
3. User verifies OTP
4. User completes registration with name and password
5. User is automatically logged in

### Login
1. User enters email and password
2. System validates credentials
3. JWT token is stored in localStorage
4. User is redirected to home page

### Protected Routes
- `/chat` - Requires authentication
- `/upload` - Requires authentication
- `/history` - Requires authentication

## API Integration

The frontend communicates with the backend API through:

- **Auth API**: `/api/auth/*`
- **Chat API**: `/api/chat/*`
- **Upload API**: `/api/upload/*`

All API calls include JWT token in Authorization header when user is authenticated.

## Key Features

### OTP Verification
- OTP sent via email
- Valid for 2 minutes
- Maximum 5 requests per day per email
- 6-digit numeric code

### Chat Interface
- Real-time message display
- Support for text, image, and voice messages
- Message history persistence
- Loading states and error handling

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Adaptive layouts

### Bilingual Support
- English and Urdu languages
- RTL layout for Urdu
- Language switching
- Translated UI elements

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_NODE_ENV` | Environment mode | `development` |

## Dependencies

### Core
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `axios` - HTTP client

### Styling
- `tailwindcss` - Utility-first CSS
- `@tailwindcss/vite` - Tailwind Vite plugin
- `autoprefixer` - CSS vendor prefixes
- `postcss` - CSS processing

### Icons
- `lucide-react` - Icon library
- Bootstrap Icons (CDN)

## Development

### Code Structure
- Components are organized by feature
- Services handle API communication
- Contexts manage global state
- Utils contain helper functions

### Styling Guidelines
- Use Tailwind utility classes
- Custom components defined in `index.css`
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- RTL support for Urdu: `urdu-layout` class

### State Management
- React Context API for global state
- Local state with `useState` for component state
- `useEffect` for side effects

## Building for Production

1. **Set environment variables:**
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   VITE_NODE_ENV=production
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Deploy the `dist` folder** to your hosting service

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check CORS configuration in backend

### Authentication Issues
- Clear localStorage and try again
- Check JWT token expiration
- Verify backend authentication endpoints

### Build Issues
- Clear `node_modules` and reinstall
- Check Node.js version (v18+)
- Verify all environment variables

## License

ISC
