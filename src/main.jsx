import { createRoot } from 'react-dom/client'
import { AuthProvider} from './AuthContext.jsx';
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App/>
    </AuthProvider>
)
