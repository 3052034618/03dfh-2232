import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VehicleInspection } from './pages/VehicleInspection';
import { SealRecordPage } from './pages/SealRecordPage';
import { ReturnCheckPage } from './pages/ReturnCheckPage';
import { mockDoorMagnetStatuses } from './data/mockData';
import type { TabType } from './types';
import './components/styles.css';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inspection');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onlineCount = mockDoorMagnetStatuses.filter(d => d.isOnline).length;
  const totalCount = mockDoorMagnetStatuses.length;
  const alertCount = mockDoorMagnetStatuses.filter(d => !d.isDoorClosed || !d.isOnline).length;

  const handleSealVehicle = (vehicleId: string) => {
    setPreselectedVehicleId(vehicleId);
    setActiveTab('seal');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inspection':
        return <VehicleInspection onSealVehicle={handleSealVehicle} />;
      case 'seal':
        return <SealRecordPage preselectedVehicleId={preselectedVehicleId} />;
      case 'return':
        return <ReturnCheckPage />;
      default:
        return <VehicleInspection onSealVehicle={handleSealVehicle} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        currentTime={currentTime}
        onlineCount={onlineCount}
        totalCount={totalCount}
        alertCount={alertCount}
      />
      <div className="app-main">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="app-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
