# 🐛 MissBug - Bug Management System

A full-stack bug management application built with Node.js, Express, and React. MissBug allows users to create, manage, and track software bugs with features like filtering, sorting, pagination, and user authentication.

## 🌐 Live Demo

**Live Application**: [https://missbugs-ew1e.onrender.com/#/bug](https://missbugs-ew1e.onrender.com/#/bug)

## ✨ Features

### 🔐 User Authentication
- User signup and login system
- Session management with cookies
- Role-based access control (Admin/User)

### 🐛 Bug Management
- Create, read, update, and delete bugs
- Bug ownership system (only creators can edit/delete)
- Admin override for all bug operations
- Rich bug metadata (title, description, severity, labels, creation date)

### 🔍 Advanced Filtering & Sorting
- Text-based search across bug titles and descriptions
- Filter by severity level (1-5)
- Filter by labels and date ranges
- Sort by title, severity, or creation date
- Pagination support

### 👥 User Management
- User profiles showing created bugs
- Admin panel for user management
- User deletion capabilities

### 📱 Responsive Design
- Modern, clean UI with hover effects
- Mobile-friendly interface
- Consistent styling with CSS variables

## 🏗️ Architecture

### Backend
- **Node.js** with Express.js framework
- **RESTful API** design
- **File-based data storage** (JSON files)
- **Cookie-based authentication**
- **CORS handling** for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **In-browser Babel** for JSX compilation
- **HashRouter** for client-side routing
- **Session storage** for user persistence
- **Responsive CSS** with modern design patterns

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amiravni16/lesson-38---missbugs.git
   cd lesson-38---missbugs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://127.0.0.1:3030`

### Production Build
```bash
npm start
```

## 📁 Project Structure

```
missbugs/
├── public/                 # Frontend React components
│   ├── cmps/              # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # Frontend services
│   └── assets/            # CSS and static assets
├── services/               # Backend services
│   ├── bug.service.js     # Bug CRUD operations
│   ├── user.service.js    # User management
│   ├── auth.service.js    # Authentication logic
│   └── logger.service.js  # Logging utilities
├── data/                   # JSON data files
│   ├── bug.json           # Bug data storage
│   └── user.json          # User data storage
├── server.js              # Express server entry point
└── package.json           # Project dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Bugs
- `GET /api/bug` - List bugs with filtering/sorting/pagination
- `POST /api/bug` - Create new bug (requires auth)
- `PUT /api/bug` - Update bug (requires auth + ownership)
- `DELETE /api/bug/:id` - Delete bug (requires auth + ownership)
- `GET /api/bug/:id` - Get bug details

### Users
- `GET /api/user` - List users (admin only)
- `GET /api/user/:id` - Get user details
- `POST /api/user` - Create user
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user (admin only)

## 👤 Default Users

### Admin User
- **Username**: `admin`
- **Password**: `admin`
- **Access**: Full system access, can manage all bugs and users

### Regular Users
- Create an account through the signup form
- Can only manage their own bugs
- Limited access to user management features

## 🎨 Customization

### CSS Variables
The application uses CSS custom properties for consistent theming:
```css
:root {
  --clr1: #0079bf;        /* Primary color */
  --gray1: #172b4d;       /* Dark text */
  --gray2: #f4f5f7;       /* Light background */
  --gray3: #6b778c;       /* Secondary text */
}
```

### Adding New Features
- **New bug fields**: Update `data/bug.json` structure and related services
- **New user properties**: Modify `data/user.json` and user services
- **Additional filters**: Extend the filter logic in `BugFilter` component

## 🚀 Deployment

### Render.com (Current)
The application is deployed on [Render.com](https://render.com) with:
- Automatic deployments from GitHub
- Environment variable management
- Health check monitoring
- Global CDN distribution

### Environment Variables
- `PORT`: Automatically set by Render
- `NODE_ENV`: Set to `production`
- `SECRET1`: Encryption key for authentication

## 🐛 Known Issues & Limitations

- **Data Persistence**: Uses file-based storage (JSON files) - data resets on deployment
- **Browser Compatibility**: Requires modern browsers with ES6+ support
- **Session Management**: Uses cookies for authentication tokens

## 🔮 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time notifications
- [ ] Bug assignment and workflow management
- [ ] File attachments for bugs
- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Amir Avni** - [GitHub Profile](https://github.com/amiravni16)

## 🙏 Acknowledgments

- Built as part of the Coding Academy curriculum
- Inspired by real-world bug tracking systems like Jira and GitHub Issues
- Uses modern web development best practices and patterns

---

**Live Demo**: [https://missbugs-ew1e.onrender.com/#/bug](https://missbugs-ew1e.onrender.com/#/bug)

For questions or support, please open an issue on GitHub.
