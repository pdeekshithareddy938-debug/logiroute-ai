import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, User, Clock, AlertCircle } from 'lucide-react';

const PRESET_SF_LOCATIONS = [
  { name: 'Financial District', address: '550 Montgomery St, San Francisco, CA', lat: 37.7946, lon: -122.4034 },
  { name: 'SoMa / Brannan', address: '850 Brannan St, San Francisco, CA', lat: 37.7719, lon: -122.4048 },
  { name: 'Mission District', address: '2100 Mission St, San Francisco, CA', lat: 37.7632, lon: -122.4192 },
  { name: 'Civic Center / Van Ness', address: '1200 Van Ness Ave, San Francisco, CA', lat: 37.7869, lon: -122.4218 },
  { name: 'Haight-Ashbury', address: '1500 Haight St, San Francisco, CA', lat: 37.7699, lon: -122.4468 },
  { name: 'Fisherman Wharf / Beach', address: '250 Beach St, San Francisco, CA', lat: 37.8078, lon: -122.4145 },
];

export default function DeliveryModal({ isOpen, onClose, onSave, delivery = null }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    latitude: 37.7749,
    longitude: -122.4194,
    package_details: 'Standard Parcel',
    weight_kg: 1.5,
    priority: 'MEDIUM',
    status: 'PENDING',
    time_window_start: '09:00',
    time_window_end: '17:00',
    notes: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (delivery) {
      setFormData({
        customer_name: delivery.customer_name || '',
        customer_phone: delivery.customer_phone || '',
        customer_email: delivery.customer_email || '',
        delivery_address: delivery.delivery_address || '',
        latitude: delivery.latitude || 37.7749,
        longitude: delivery.longitude || -122.4194,
        package_details: delivery.package_details || 'Standard Parcel',
        weight_kg: delivery.weight_kg || 1.5,
        priority: delivery.priority || 'MEDIUM',
        status: delivery.status || 'PENDING',
        time_window_start: delivery.time_window_start || '09:00',
        time_window_end: delivery.time_window_end || '17:00',
        notes: delivery.notes || '',
      });
    } else {
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_address: '',
        latitude: 37.7749,
        longitude: -122.4194,
        package_details: 'Standard Parcel',
        weight_kg: 1.5,
        priority: 'MEDIUM',
        status: 'PENDING',
        time_window_start: '09:00',
        time_window_end: '17:00',
        notes: '',
      });
    }
    setError('');
  }, [delivery, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      delivery_address: preset.address,
      latitude: preset.lat,
      longitude: preset.lon,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!formData.delivery_address.trim()) {
      setError('Delivery address is required.');
      return;
    }
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        latitude: lat,
        longitude: lon,
        weight_kg: parseFloat(formData.weight_kg) || 1.0,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to save delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {delivery ? 'Edit Delivery Order' : 'Add New Delivery'}
            </h3>
            <p className="text-xs text-slate-500">Provide customer destination, coordinates, and parcel details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick preset locations */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Quick Geocoded SF Presets</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SF_LOCATIONS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-md border border-slate-200 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Phone</label>
              <input
                type="text"
                placeholder="+1-415-555-0100"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="Street address, city, state, zip"
                value={formData.delivery_address}
                onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude (-90 to 90) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude (-180 to 180) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Package Details</label>
              <div className="relative">
                <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Fragile Glassware"
                  value={formData.package_details}
                  onChange={(e) => setFormData({ ...formData, package_details: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Time Window</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={formData.time_window_start}
                  onChange={(e) => setFormData({ ...formData, time_window_start: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="time"
                  value={formData.time_window_end}
                  onChange={(e) => setFormData({ ...formData, time_window_end: e.target.value })}
                  className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Instructions / Notes</label>
            <textarea
              rows={2}
              placeholder="Gate code, access hours, contact instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : delivery ? 'Save Changes' : 'Create Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
