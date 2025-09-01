import React from 'react';
import { useCart } from './CartContext';
import { useUser } from './UserContext';
import './CartSyncIndicator.css';

const CartSyncIndicator = () => {
  const { isLoading, isSynced, forceSync, lastSync } = useCart();
  const { user } = useUser();

  // Don't show for guest users
  if (!user) return null;

  const getSyncStatus = () => {
    if (isLoading) return 'syncing';
    if (isSynced()) return 'synced';
    return 'out-of-sync';
  };

  const getStatusText = () => {
    switch (getSyncStatus()) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'out-of-sync':
        return 'Out of sync';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = () => {
    switch (getSyncStatus()) {
      case 'syncing':
        return '🔄';
      case 'synced':
        return '✅';
      case 'out-of-sync':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const handleSyncClick = async () => {
    if (!isLoading) {
      await forceSync();
    }
  };

  return (
    <div className={`cart-sync-indicator ${getSyncStatus()}`}>
      <button
        onClick={handleSyncClick}
        disabled={isLoading}
        className="sync-button"
        title={getStatusText()}
      >
        <span className="sync-icon">{getStatusIcon()}</span>
        <span className="sync-text">{getStatusText()}</span>
      </button>

      {lastSync && (
        <div className="last-sync">
          Last sync: {new Date(lastSync).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default CartSyncIndicator; 