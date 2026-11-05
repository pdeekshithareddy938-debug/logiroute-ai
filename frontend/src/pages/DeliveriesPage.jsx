import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpDown, 
  ThermometerSnowflake, 
  Phone, 
  Mail, 
  Compass, 
  Layers, 
  RefreshCw,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';
import DeliveryStatusBadge from '../components/DeliveryStatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import DeliveryModal from '../components/DeliveryModal';
import dispatchAPI from '../services/api';

export default function DeliveriesPage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Load orders from Express + Prisma backend
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await dispatchAPI.getOrders({
        search: searchQuery || undefined,
        status: statusFilter,
        priority: priorityFilter
      });
      setOrders(data || []);
    } catch (err) {
      console.warn('Fallback to dashboard orders on error:', err.message);
      try {
        const dashData = await dispatchAPI.getDashboard();
        setOrders(dashData.orders || []);
      } catch (e) {
        console.error('Failed to load orders:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  // Quick Status change from slide-over drawer
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatchAPI.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus.toLowerCase() } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus.toLowerCase() }));
      }
      setToast({
        type: 'success',
        message: `Order #${orderId} telemetry updated to ${newStatus.toUpperCase()}`
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateOrder = async (orderData) => {
    try {
      await dispatchAPI.createOrder(orderData);
      setIsModalOpen(false);
      fetchOrders();
      setToast({
        type: 'success',
        message: `New order for ${orderData.customer} staged into active corridor queue.`
      });
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Failed to create order:', err);
    }
  };

  // Cold chain detection
  const isColdChain = (desc) => {
    const text = (desc || '').toLowerCase();
    return text.includes('chilled') || text.includes('ice') || text.includes('gelato') || text.includes('cold') || text.includes('medical');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-950/95 text-slate-100 px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.3)] border border-cyan-500/50 flex items-center gap-3 backdrop-blur-xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header — Midnight Glassmorphic Cockpit Card with Blue/Cyan Accent */}
      <div 
        className="rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.75) 0%, rgba(10, 16, 32, 0.88) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-black text-white tracking-wide">DELIVERIES MASTER QUEUE</h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {orders.length} ACTIVE NODES
            </span>
          </div>
          <p className="text-xs font-mono text-slate-300/80 mt-1">
            Real-time telemetry stream across San Francisco micro-fulfillment corridors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-pointer shadow-md"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-black shadow-[0_0_16px_rgba(6,182,212,0.5)] border border-cyan-400/60 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE ORDER</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar with Glowing Chips */}
      <div 
        className="rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(56, 189, 248, 0.22)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer, address, or tote descriptor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-all"
          />
        </form>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/90 text-xs font-mono">
            {['ALL', 'PENDING', 'IN-TRANSIT', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Priority Filter Chips */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/90 text-xs font-mono">
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM'].map((pr) => (
              <button
                key={pr}
                onClick={() => setPriorityFilter(pr)}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                  priorityFilter === pr
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {pr === 'ALL' ? 'All Priority' : pr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Master Order Table — Glassmorphic Table with Neon Glow */}
      <div 
        className="rounded-2xl shadow-2xl overflow-hidden border transition-all"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.72) 0%, rgba(10, 16, 32, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(56, 189, 248, 0.22)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800/80 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Order ID & Corridor</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Delivery Address</th>
                <th className="py-3.5 px-4">Payload Specs</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="font-mono text-cyan-400 font-bold">Scanning dispatch matrix...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-16 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-bold text-slate-300">NO DELIVERIES FOUND</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Adjust filter criteria to view active nodes</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const cold = isColdChain(order.packageDesc || order.package_details);
                  const isAlpha = order.waveId === 'wave-alpha';
                  const isBeta = order.waveId === 'wave-beta';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="bg-slate-900/60 hover:bg-slate-800/60 border-b border-slate-800/50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isAlpha ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.25)]' :
                            isBeta ? 'bg-cyan-950/70 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]' :
                            'bg-amber-950/70 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                          }`}>
                            {isAlpha ? 'Alpha' : isBeta ? 'Beta' : 'Gamma'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-100 font-sans text-sm">
                        {order.customer || order.customer_name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 max-w-[260px] truncate" title={order.address || order.delivery_address}>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{order.address || order.delivery_address}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">
                            {order.packageDesc || order.package_details || 'Express Tote'}
                          </span>
                          <span className="text-slate-500 font-bold">
                            ({order.weightKg ?? order.weight_kg ?? 2.5}kg)
                          </span>
                          {cold && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/60 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                              <ThermometerSnowflake className="w-2.5 h-2.5" />
                              Chilled
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={order.priority} />
                      </td>

                      <td className="py-3.5 px-4">
                        <DeliveryStatusBadge status={order.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/40 transition-all inline-flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>Telemetry</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Slide-Over Drawer — Obsidian Background with Neon Cyan Accents */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dark Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#070d19] border-l border-cyan-500/40 shadow-[0_0_50px_rgba(0,0,0,0.95)] flex flex-col justify-between animate-slideInRight text-slate-100">
              {/* Drawer Header */}
              <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
                      #{selectedOrder.id}
                    </span>
                    <DeliveryStatusBadge status={selectedOrder.status} />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2 font-sans">
                    {selectedOrder.customer || selectedOrder.customer_name}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 font-mono text-xs">
                {/* Cold Chain Alert Card */}
                {isColdChain(selectedOrder.packageDesc || selectedOrder.package_details) && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 flex items-center gap-2.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <ThermometerSnowflake className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold block">COLD-CHAIN SLA ACTIVE</span>
                      <span className="text-[11px] text-slate-400">Insulated dark store thermal tote. Sub-4°C required.</span>
                    </div>
                  </div>
                )}

                {/* Delivery Location & Geo Point */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Destination Geopoint</h4>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2.5">
                    <div className="flex items-start gap-2.5 text-slate-200">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-sans font-medium text-white">{selectedOrder.address || selectedOrder.delivery_address}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">San Francisco Dispatch Corridor</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">GPS Coordinates:</span>
                      <span className="font-bold text-cyan-400">
                        {(selectedOrder.lat ?? selectedOrder.latitude)?.toFixed(4)}, {(selectedOrder.lng ?? selectedOrder.longitude)?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cargo & Payload Specs */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payload Telemetry</h4>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Package Spec:</span>
                      <span className="font-sans font-semibold text-slate-200 text-right">
                        {selectedOrder.packageDesc || selectedOrder.package_details || 'Standard Express Parcel'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Weight:</span>
                      <span className="font-bold text-white">
                        {selectedOrder.weightKg ?? selectedOrder.weight_kg ?? 2.5} kg
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Priority:</span>
                      <PriorityBadge priority={selectedOrder.priority} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Assigned Corridor:</span>
                      <span className="font-bold text-cyan-400">
                        {selectedOrder.waveId?.toUpperCase() || 'WAVE ALPHA'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps & SLA Matrix */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Execution Window</h4>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Ingestion Stamp:
                      </span>
                      <span className="text-slate-300">
                        {new Date(selectedOrder.createdAt || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                        Target Fulfillment:
                      </span>
                      <span className="font-bold text-emerald-400">
                        10-Min Dark Store Window
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Status Updates */}
              <div className="p-6 border-t border-slate-800/80 bg-slate-950/90 space-y-2.5 font-mono">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Update Node Status:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'pending')}
                    className="py-2 px-2 rounded-xl text-xs font-bold bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 shadow-[0_0_8px_rgba(245,158,11,0.2)] cursor-pointer text-center transition-all"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'in-transit')}
                    className="py-2 px-2 rounded-xl text-xs font-bold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.2)] cursor-pointer text-center transition-all"
                  >
                    In-Transit
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered')}
                    className="py-2 px-2 rounded-xl text-xs font-bold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.2)] cursor-pointer text-center transition-all"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Modal */}
      {isModalOpen && (
        <DeliveryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateOrder}
        />
      )}
    </div>
  );
}
