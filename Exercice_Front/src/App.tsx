import { useState } from 'react';
import './App.css';
import PrescriptionForm from './components/PrescriptionForm/PrescriptionForm';
import PrescriptionList from './components/PrescriptionList/PrescriptionList';

function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFormSubmitSuccess = () => {
    // Refresh the list after successful creation
    setRefreshKey(prev => prev + 1)
    setActiveTab('list')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Gestion des Prescriptions Médicales</h1>
        <p>Interface de gestion des prescriptions médicamenteuses</p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 Liste des prescriptions
        </button>
        <button
          className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Créer une prescription
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'list' && (
          <PrescriptionList key={refreshKey} onRefresh={refreshKey > 0} />
        )}
        {activeTab === 'create' && (
          <PrescriptionForm onSubmitSuccess={handleFormSubmitSuccess} />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 Entretiens Cohort360 - API Django REST + React TypeScript</p>
      </footer>
    </div>
  )
}

export default App
