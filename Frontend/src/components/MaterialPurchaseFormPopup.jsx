import React, { useState, useEffect } from 'react';
import { FiX, FiLoader, FiCalendar, FiUser, FiBox, FiPlus, FiTrash2, FiFileText, FiUpload, FiCheck, FiHash, FiDollarSign } from 'react-icons/fi';
import AddMaterialFormPopup from './AddMaterialFormPopup';
import apiService from '../services/api';

const MaterialPurchaseFormPopup = ({ isOpen, onClose, projectName, projectId, clientName, onSuccess }) => {
    const [formData, setFormData] = useState({
        purchaseInvoiceDate: new Date().toISOString().split('T')[0],
        partyName: '',
        materials: [],
        subTotal: '',
        additionalCharges: '',
        discount: '',
        totalAmount: '',
        deductions: [],
        netAmount: '',
        roundOff: false,
        paidAmount: '',
        purchaseInvoiceNo: '',
        billToShipTo: '',
        note: ''
    });

    const [showDeductions, setShowDeductions] = useState(false);
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                purchaseInvoiceDate: new Date().toISOString().split('T')[0],
                partyName: clientName || '',
                materials: [],
                subTotal: '',
                additionalCharges: '',
                discount: '',
                totalAmount: '',
                deductions: [],
                netAmount: '',
                roundOff: false,
                paidAmount: '',
                purchaseInvoiceNo: '',
                billToShipTo: '',
                note: ''
            });
            setSelectedFile(null);
            setShowDeductions(false);
        }
    }, [isOpen]);

    // Calculate totals
    // Calculate total from materials
    useEffect(() => {
        const total = formData.materials.reduce((sum, material) => {
            const amount = parseFloat(material.amount) || 0;
            return sum + amount;
        }, 0);

        setFormData(prev => ({
            ...prev,
            netAmount: total.toFixed(2),
            totalAmount: total.toFixed(2) // keeping this consistent if used elsewhere
        }));
    }, [formData.materials]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size too large. Maximum 5MB allowed.');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleAddDeduction = () => {
        setFormData(prev => ({
            ...prev,
            deductions: [...prev.deductions, { description: '', amount: '' }]
        }));
        setShowDeductions(true);
    };

    const handleDeductionChange = (index, field, value) => {
        const newDeductions = [...formData.deductions];
        newDeductions[index][field] = value;
        setFormData(prev => ({ ...prev, deductions: newDeductions }));
    };

    const handleRemoveDeduction = (index) => {
        const newDeductions = formData.deductions.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, deductions: newDeductions }));
        if (newDeductions.length === 0) {
            setShowDeductions(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.partyName || !formData.totalAmount || !formData.purchaseInvoiceDate) {
            alert('Please fill in all required fields (Party Name, Total Amount, Date)');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('project_id', projectId);
            data.append('type', 'Material Purchase');
            data.append('party_name', formData.partyName);
            data.append('amount', parseFloat(formData.netAmount)); // Using Net Amount as the transaction amount
            data.append('payment_method', 'credit'); // Defaults to credit for material purchase
            data.append('date', formData.purchaseInvoiceDate);
            data.append('reference_no', formData.purchaseInvoiceNo);
            data.append('description', formData.note);

            // You might want to stringify materials and deductions to send them or handle them separately in backend
            // data.append('materials', JSON.stringify(formData.materials)); 
            // data.append('deductions', JSON.stringify(formData.deductions));

            if (selectedFile) {
                data.append('attachment', selectedFile);
            }

            const response = await apiService.createTransaction(data);

            // Log inventory entries for each material
            const inventoryPromises = formData.materials.map(material => {
                return apiService.createInventoryEntry({
                    project_id: projectId,
                    material_name: material.materialName,
                    quantity: material.quantity,
                    unit: material.unit || 'unit',
                    type: 'In',
                    transaction_date: formData.purchaseInvoiceDate,
                    description: `Purchased from ${formData.partyName} (Invoice: ${formData.purchaseInvoiceNo})`
                });
            });
            await Promise.all(inventoryPromises);

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving material purchase:', error);
            alert(error.message || 'Failed to save material purchase');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all";
    const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-family)' }}>Record Material Purchase</h2>
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-0.5 ml-4" style={{ fontFamily: 'var(--font-family)' }}>{projectName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700">
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">

                        {/* Section 1: Invoice Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className={labelStyle}>Party Name <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiUser />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.partyName}
                                        readOnly
                                        className={`${inputStyle} pl-10 bg-gray-100 cursor-not-allowed`}
                                        placeholder="Supplier Name"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Invoice Date <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiCalendar />
                                    </div>
                                    <input
                                        type="date"
                                        value={formData.purchaseInvoiceDate}
                                        onChange={(e) => handleInputChange('purchaseInvoiceDate', e.target.value)}
                                        className={`${inputStyle} pl-10`}
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Invoice No.</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <FiHash />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.purchaseInvoiceNo}
                                        onChange={(e) => handleInputChange('purchaseInvoiceNo', e.target.value)}
                                        className={`${inputStyle} pl-10`}
                                        placeholder="e.g. INV-001"
                                        style={{ fontFamily: 'var(--font-family)' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Materials List */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <FiBox /> Materials List
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowMaterialForm(true)}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    <FiPlus size={16} /> Add Material
                                </button>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3">Item Name</th>
                                            <th className="px-4 py-3 text-right">Qty</th>
                                            <th className="px-4 py-3 text-right">Rate</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {formData.materials.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-gray-400 italic">
                                                    No materials added yet. Click "+ Add Material" to start.
                                                </td>
                                            </tr>
                                        ) : (
                                            formData.materials.map((material, index) => (
                                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{material.materialName}</td>
                                                    <td className="px-4 py-3 text-right font-medium">{material.quantity}</td>
                                                    <td className="px-4 py-3 text-right text-gray-500">{material.rate}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{material.amount}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => {
                                                                const newMaterials = formData.materials.filter((_, i) => i !== index);
                                                                handleInputChange('materials', newMaterials);
                                                            }}
                                                            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Financials & Totals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Extra Details */}
                            <div className="space-y-4">

                                <div>
                                    <label className={labelStyle}>Attachments</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*,.pdf"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            className="px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-2"
                                            style={{ fontFamily: 'var(--font-family)' }}
                                        >
                                            <FiUpload />
                                            {selectedFile ? 'Change File' : 'Upload invoice'}
                                        </button>
                                        {selectedFile && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                                                <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                                                <button onClick={() => setSelectedFile(null)} className="hover:text-rose-600"><FiX /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-white border border-transparent hover:border-gray-200 transition-all uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 uppercase tracking-wide"
                            style={{ fontFamily: 'var(--font-family)' }}
                        >
                            {submitting ? <FiLoader className="animate-spin" /> : <><FiCheck /> Save Purchase</>}
                        </button>
                    </div>
                </div>
            </div>

            <AddMaterialFormPopup
                isOpen={showMaterialForm}
                onClose={() => setShowMaterialForm(false)}
                onSave={(materialData) => {
                    handleInputChange('materials', [...formData.materials, materialData]);
                    setShowMaterialForm(false);
                }}
            />
        </>
    );
};

export default MaterialPurchaseFormPopup;
