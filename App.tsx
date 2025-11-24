import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Delfin14App from './Delfin14App';
import AnalisisPedidosApp from './AnalisisPedidosApp';
import AdminApp from './AdminApp';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/delfin-14" element={<Delfin14App />} />
                <Route path="/analisis-pedidos" element={<AnalisisPedidosApp />} />
                <Route path="/admin" element={<AdminApp />} />
            </Routes>
        </Router>
    );
};

export default App;
