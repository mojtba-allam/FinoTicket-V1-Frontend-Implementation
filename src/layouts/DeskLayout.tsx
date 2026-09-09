import React from 'react';
import { Outlet } from 'react-router-dom';

export default function DeskLayout() {
  return (
    <div className="flex h-screen bg-surface-alt">
      <Outlet />
    </div>
  );
}
