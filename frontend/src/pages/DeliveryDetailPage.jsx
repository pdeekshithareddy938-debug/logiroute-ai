import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Package, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import DeliveryStatusBadge from '../components/DeliveryStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import RouteMap from '../components/RouteMap';
import DeliveryModal from '../components/DeliveryModal';
import { deliveriesAPI } from '../api/client';

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchDelivery = async () => {
    setIsLoading(true);
    try {
      const data = await deliveriesAPI.getById(id);
      setDelivery(data);
    } catch (err) {
      setError('Delivery order not found or could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await deliveriesAPI.updateStatus(id, newStatus);
      setDelivery(updated);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleSaveEdit = async (formData) => {
    const updated = await deliveriesAPI.update(id, formData);
    setDelivery(updated);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading delivery details...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Delivery Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <button
          onClick={() => navigate('/deliveries')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg"
        >
          Back to Deliveries
        </button>
      </div>
    );
  }

  // Format single stop for RouteMap
  const mapStop = [{
    id: delivery.id,
    sequence_order: 1,
    is_warehouse: 0,
    delivery_id: delivery.id,
    location_name: delivery.customer_name,
    address: delivery.delivery_address,
    latitude: delivery.latitude,
    longitude: delivery.longitude,
  }];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/deliveries')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deliveries</span>
        </button>

        <div className="flex items-center gap-3">
          <select
            value={delivery.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PENDING">Status: Pending</option>
            <option value="SCHEDULED">Status: Scheduled</option>
            <option value="IN_TRANSIT">Status: In Transit</option>
            <option value="DELIVERED">Status: Delivered</option>
            <option value="CANCELLED">Status: Cancelled</option>
          </select>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Order</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-blue-600 font-bold uppercase tracking-wider">
                  ORDER #{delivery.id}
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-1">{delivery.customer_name}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{delivery.delivery_address}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <DeliveryStatusBadge status={delivery.status} />
                <PriorityBadge priority={delivery.priority} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{delivery.customer_phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{delivery.customer_email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>
                    Window: {delivery.time_window_start || '09:00'} - {delivery.time_window_end || '17:00'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>{delivery.package_details || 'Standard Parcel'} ({delivery.weight_kg} kg)</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">
                    Lat: {delivery.latitude.toFixed(5)}, Lon: {delivery.longitude.toFixed(5)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Created: {new Date(delivery.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {delivery.notes && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Delivery Notes & Instructions
                </h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {delivery.notes}
                </p>
              </div>
            )}
          </div>

          {/* Single Stop Location Map */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Destination Coordinates</h3>
            <RouteMap
              stops={mapStop}
              center={[delivery.latitude, delivery.longitude]}
              zoom={14}
              height="340px"
            />
          </div>
        </div>

        {/* Right Column: Routing & Dispatch Status (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Route Dispatch Context</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Primary Dispatch Hub</span>
                <span className="font-semibold text-slate-800 block mt-0.5">Central Distribution Hub</span>
                <span className="text-slate-500 block text-[11px]">100 Market St, San Francisco, CA</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-blue-600 block text-[11px] font-semibold">AI Routing Eligibility</span>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                  This parcel has valid geocoded coordinates and can be added directly into the multi-stop 2-Opt TSP solver.
                </p>
              </div>

              <button
                onClick={() => navigate('/routes/planner', { state: { preSelectedIds: [delivery.id] } })}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors text-center"
              >
                Plan Route for This Delivery
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeliveryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        delivery={delivery}
      />
    </div>
  );
}
