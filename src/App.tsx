import React, { useState } from 'react';
import { Camera, Site, DeviceNVR, SecurityEvent, PlaybackRecording, MediaSnapshot, UserProfile } from './types';
import { 
  INITIAL_USER, INITIAL_SITES, INITIAL_CAMERAS, 
  INITIAL_NVRS, INITIAL_EVENTS, INITIAL_RECORDINGS, INITIAL_SNAPSHOTS 
} from './data/mockData';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LiveCameraGrid } from './components/LiveCameraGrid';
import { SingleCameraView } from './components/SingleCameraView';
import { PlaybackTimeline } from './components/PlaybackTimeline';
import { AIDetectionManager } from './components/AIDetectionManager';
import { SiteMapManager } from './components/SiteMapManager';
import { DeviceManager } from './components/DeviceManager';
import { AlertsCenter } from './components/AlertsCenter';
import { MediaGallery } from './components/MediaGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { AddCameraModal } from './components/AddCameraModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [sites, setSites] = useState<Site[]>(INITIAL_SITES);
  const [cameras, setCameras] = useState<Camera[]>(INITIAL_CAMERAS);
  const [nvrs, setNvrs] = useState<DeviceNVR[]>(INITIAL_NVRS);
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [recordings, setRecordings] = useState<PlaybackRecording[]>(INITIAL_RECORDINGS);
  const [snapshots, setSnapshots] = useState<MediaSnapshot[]>(INITIAL_SNAPSHOTS);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  // Modals
  const [singleCameraModal, setSingleCameraModal] = useState<Camera | null>(null);
  const [isAddCameraModalOpen, setIsAddCameraModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Unread Alerts Count
  const unreadAlertsCount = events.filter((e) => !e.read).length;

  // Camera Updates
  const handleUpdateCamera = (updatedCam: Camera) => {
    setCameras((prev) => prev.map((c) => (c.id === updatedCam.id ? updatedCam : c)));
    if (singleCameraModal?.id === updatedCam.id) {
      setSingleCameraModal(updatedCam);
    }
  };

  const handleUpdatePTZ = (cameraId: string, pan: number, tilt: number, zoom: number) => {
    setCameras((prev) =>
      prev.map((c) => {
        if (c.id === cameraId) {
          return {
            ...c,
            ptzState: { pan, tilt, zoom },
          };
        }
        return c;
      })
    );
    if (singleCameraModal && singleCameraModal.id === cameraId) {
      setSingleCameraModal((prev) => (prev ? { ...prev, ptzState: { pan, tilt, zoom } } : null));
    }
  };

  const handleAddCamera = (newCam: Camera) => {
    setCameras((prev) => [newCam, ...prev]);
  };

  const handleAddSnapshot = (title: string, cam: Camera) => {
    const newSnap: MediaSnapshot = {
      id: `snap-${Date.now()}`,
      cameraId: cam.id,
      cameraName: cam.name,
      siteName: cam.siteName,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'photo',
      thumbnailPreset: cam.canvasPreset,
      title: title,
      fileSize: '2.1 MB',
    };
    setSnapshots((prev) => [newSnap, ...prev]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleMarkEventRead = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  };

  const handleMarkAllEventsRead = () => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
  };

  // Filter cameras by site if selected
  const displayedCameras = cameras.filter((c) => selectedSiteId === 'all' || c.siteId === selectedSiteId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans dir-rtl select-none">
      {/* Top Header */}
      <Header
        user={user}
        sites={sites}
        unreadAlertsCount={unreadAlertsCount}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAddCameraModal={() => setIsAddCameraModalOpen(true)}
        onNavigateTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          unreadAlertsCount={unreadAlertsCount}
        />

        {/* View Workspace Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              cameras={displayedCameras}
              sites={sites}
              nvrs={nvrs}
              events={events}
              onSelectCamera={(cam) => setSingleCameraModal(cam)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'live' && (
            <LiveCameraGrid
              cameras={displayedCameras}
              sites={sites}
              onSelectCamera={(cam) => setSingleCameraModal(cam)}
              onAddSnapshot={handleAddSnapshot}
            />
          )}

          {activeTab === 'playback' && (
            <PlaybackTimeline
              cameras={displayedCameras}
              recordings={recordings}
              onAddSnapshot={handleAddSnapshot}
            />
          )}

          {activeTab === 'ai' && (
            <AIDetectionManager
              cameras={displayedCameras}
              onUpdateCamera={handleUpdateCamera}
            />
          )}

          {activeTab === 'map' && (
            <SiteMapManager
              sites={sites}
              cameras={cameras}
              onSelectCamera={(cam) => setSingleCameraModal(cam)}
            />
          )}

          {activeTab === 'devices' && (
            <DeviceManager
              nvrs={nvrs}
              sites={sites}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsCenter
              events={events}
              cameras={cameras}
              onMarkRead={handleMarkEventRead}
              onMarkAllRead={handleMarkAllEventsRead}
            />
          )}

          {activeTab === 'gallery' && (
            <MediaGallery
              snapshots={snapshots}
              cameras={cameras}
              onDeleteSnapshot={handleDeleteSnapshot}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel />
          )}
        </main>
      </div>

      {/* Expanded Single Camera Player Modal */}
      {singleCameraModal && (
        <SingleCameraView
          camera={singleCameraModal}
          onClose={() => setSingleCameraModal(null)}
          onUpdateCamera={handleUpdateCamera}
          onAddSnapshot={handleAddSnapshot}
          onUpdatePTZ={handleUpdatePTZ}
        />
      )}

      {/* Add Camera Modal */}
      {isAddCameraModalOpen && (
        <AddCameraModal
          sites={sites}
          onClose={() => setIsAddCameraModalOpen(false)}
          onAddCamera={handleAddCamera}
        />
      )}

      {/* User Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          user={user}
          onClose={() => setIsAuthModalOpen(false)}
          onUpdateUser={setUser}
        />
      )}
    </div>
  );
}
