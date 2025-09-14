'use client';
export const dynamic = 'force-dynamic';
import React from 'react';
import EquipmentReservationSystem from '../../components/EquipmentReservationSystem';

const Reservations: React.FC = () => {
  return (
    <div className="p-6">
      <EquipmentReservationSystem />
    </div>
  );
};

export default function ReservationsPage() {
  if (typeof window === 'undefined') {
    return null;
  }
  return <Reservations />;
}
