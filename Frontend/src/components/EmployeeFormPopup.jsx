import React, { useState, useEffect } from "react";
import { FiX, FiUser } from "react-icons/fi";
import apiService from "../services/api";
import { toast } from 'react-toastify';
import ConfirmationPopup from './ConfirmationPopup';
import { useTranslation } from "../services/translationService.jsx";
import InputField from "./common/InputField";
import SelectField from "./common/SelectField";

export default function EmployeeFormPopup({ isOpen, onClose, onSubmit, editEmployee }) {
    const { t } = useTranslation();
    const initialFormData = {
        name: "",
        designation: "",
        department: "",
        phone: "",
        email: "",
        joining_date: "",
        salary: "",
        salary_type_id: 1, // Default to Monthly
        status: "Active",
        project_id: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        employment_type: "Monthly",
        aadhaar_number: "",
        pan_number: "",
        profile_image: "",
        role: "Employee"
    };

    const [formData, setFormData] = useState(initialFormData);
    const [projects, setProjects] = useState([]);
    const [salaryTypes, setSalaryTypes] = useState([]);
    const [projectRates, setProjectRates] = useState([]);
    const [newRate, setNewRate] = useState({ project_id: "", rate: "", rate_type: "Monthly", effective_from: new Date().toISOString().split('T')[0] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [projectPermission, setProjectPermission] = useState(true);

    // Confirmation Popup State
    const [confirmPopup, setConfirmPopup] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Salary Types independently
            try {
                const stResults = await apiService.getSalaryTypes();
                setSalaryTypes(stResults || []);
            } catch (err) {
                console.error("Error fetching salary types:", err);
            }

            // Fetch Projects independently
            try {
                const projResults = await apiService.getProjects();
                setProjects(projResults || []);
                setProjectPermission(true);
            } catch (err) {
                console.error("Error fetching projects:", err);
                // If it's a 403 Forbidden, we just leave projects empty
                if (err.response?.status === 403) {
                    setProjects([]);
                    setProjectPermission(false);
                }
            }

            // Fetch Project Rates if editing
            if (editEmployee) {
                try {
                    const rates = await apiService.getProjectRatesByEmployee(editEmployee.id);
                    setProjectRates(rates || []);
                } catch (err) {
                    console.error("Error fetching project rates:", err);
                }
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, editEmployee]);

    useEffect(() => {
        if (editEmployee) {
            setFormData({
                ...initialFormData,
                ...editEmployee,
                joining_date: editEmployee.joining_date ? editEmployee.joining_date.split('T')[0] : "",
                salary_type_id: editEmployee.salary_type_id || 1
            });
        } else {
            setFormData(initialFormData);
        }
        setErrors({});
        setError("");
    }, [editEmployee, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = t("Name is required");

        if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = t("Phone must be exactly 10 digits");
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t("Invalid email format");
        }

        if (formData.salary && (isNaN(formData.salary) || Number(formData.salary) < 0)) {
            newErrors.salary = t("Invalid salary amount");
        }

        if (formData.aadhaar_number && !/^[0-9]{12}$/.test(formData.aadhaar_number)) {
            newErrors.aadhaar_number = t("Aadhaar must be 12 digits");
        }

        if (formData.pan_number && !/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(formData.pan_number.toUpperCase())) {
            newErrors.pan_number = t("Invalid PAN format");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddProjectRate = async () => {
        if (!newRate.project_id || !newRate.rate) {
            toast.warning(t("Project and Rate are required"));
            return;
        }

        if (editEmployee) {
            try {
                await apiService.upsertProjectRate({
                    ...newRate,
                    employee_id: editEmployee.id
                });
                const rates = await apiService.getProjectRatesByEmployee(editEmployee.id);
                setProjectRates(rates || []);
                setNewRate({ project_id: "", rate: "", rate_type: "Monthly", effective_from: new Date().toISOString().split('T')[0] });
            } catch (err) {
                console.error("Error adding project rate:", err);
                toast.error(t("Failed to add project rate"));
            }
        } else {
            // Creation mode: add to local state
            const project = projects.find(p => p.id === newRate.project_id);
            const localRate = {
                ...newRate,
                id: `temp-${Date.now()}`,
                project_name: project ? project.project_name : ""
            };
            setProjectRates(prev => [...prev, localRate]);
            setNewRate({ project_id: "", rate: "", rate_type: "Monthly", effective_from: new Date().toISOString().split('T')[0] });
        }
    };

    const handleDeleteProjectRate = async (rateId) => {
        setConfirmPopup({
            isOpen: true,
            title: t("Delete Rate"),
            message: t("Are you sure you want to delete this specific rate?"),
            onConfirm: async () => {
                if (editEmployee && !String(rateId).startsWith('temp-')) {
                    try {
                        await apiService.deleteProjectRate(rateId);
                        const rates = await apiService.getProjectRatesByEmployee(editEmployee.id);
                        setProjectRates(rates || []);
                        toast.success(t("Rate deleted successfully"));
                    } catch (err) {
                        console.error("Error deleting project rate:", err);
                        toast.error(t("Failed to delete rate"));
                    }
                } else {
                    // Creation mode or temp rate: remove from local state
                    setProjectRates(prev => prev.filter(r => r.id !== rateId));
                    toast.success(t("Rate removed"));
                }
            }
        });
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError("");

        try {
            let employeeId = editEmployee?.id;
            if (editEmployee) {
                await apiService.updateEmployee(editEmployee.id, formData);
            } else {
                const response = await apiService.createEmployee(formData);
                employeeId = response.id;
            }

            // Save project rates if any were added during creation or if they are local
            const localRates = projectRates.filter(r => String(r.id).startsWith('temp-'));
            if (localRates.length > 0 && employeeId) {
                for (const rate of localRates) {
                    await apiService.upsertProjectRate({
                        employee_id: employeeId,
                        project_id: rate.project_id,
                        rate_type: rate.rate_type,
                        rate: rate.rate,
                        effective_from: rate.effective_from
                    });
                }
            }

            onSubmit();
        } catch (err) {
            console.error("Error saving employee:", err);
            setError(err.message || t("Failed to save employee"));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4 overflow-auto">
            <div className="w-full max-w-4xl bg-white rounded-xl flex flex-col max-h-[95vh] shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b-2 sticky top-0 bg-white z-10 rounded-t-xl" style={{ borderBottomColor: 'var(--primary-color)' }}>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <FiX size={24} />
                        </button>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>
                            {editEmployee ? t('EDIT LABOUR/EMPLOYEE') : t('ADD LABOUR/EMPLOYEE')}
                        </h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 rounded-xl text-white font-medium shadow-md transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                        {loading ? t('Saving...') : t('Save')}
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        <div className="md:col-span-2 space-y-2 mb-4">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t("PROFILE IMAGE")}</label>
                            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    {formData.profile_image ? (
                                        <div className="relative w-full h-full">
                                            <img src={formData.profile_image} alt="Preview" className="w-full h-full rounded-xl object-cover shadow-sm border border-gray-200" />
                                            <button onClick={() => setFormData(p => ({ ...p, profile_image: "" }))} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"><FiX size={12} /></button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400"><FiUser size={32} className="opacity-20" /></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700 mb-1">{t("Upload profile photo")}</p>
                                    <input type="file" id="profile-image-upload" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.size < 2 * 1024 * 1024) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => setFormData(p => ({ ...p, profile_image: ev.target.result }));
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                    <label htmlFor="profile-image-upload" className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer">{formData.profile_image ? t("CHANGE PHOTO") : t("CHOOSE FILE")}</label>
                                </div>
                            </div>
                        </div>

                        <InputField label={t("NAME")} name="name" required value={formData.name} onChange={handleInputChange} error={errors.name} />
                        <InputField label={t("DESIGNATION")} name="designation" value={formData.designation} onChange={handleInputChange} />
                        <InputField label={t("DEPARTMENT")} name="department" value={formData.department} onChange={handleInputChange} />
                        <SelectField
                            label={t("ROLE")}
                            name="role"
                            value={formData.role}
                            onChange={(value) => handleSelectChange("role", value)}
                            options={[
                                { id: "Employee", name: t("Employee") },
                                { id: "Office Member", name: t("Office Member") },
                                { id: "Admin", name: t("Admin") },
                                { id: "Manager", name: t("Manager") }
                            ]}
                            error={errors.role}
                        />
                        <InputField label={t("PHONE")} name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} />
                        <InputField label={t("EMAIL")} name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} />
                        <InputField label={t("JOINING DATE")} name="joining_date" type="date" value={formData.joining_date} onChange={handleInputChange} />
                        <SelectField
                            label={t("SALARY TYPE")}
                            options={salaryTypes}
                            value={formData.salary_type_id}
                            onChange={(v) => handleSelectChange("salary_type_id", v)}
                            valueKey="id"
                            labelKey="name"
                            placeholder={t("Select Salary Type")}
                        />

                        <InputField
                            label={
                                formData.salary_type_id === 1 ? t("MONTHLY SALARY") :
                                    formData.salary_type_id === 2 ? t("DAILY WAGE") :
                                        formData.salary_type_id === 3 ? t("HOURLY RATE") : t("SALARY/RATE")
                            }
                            name="salary"
                            type="number"
                            value={formData.salary}
                            onChange={handleInputChange}
                            error={errors.salary}
                        />
                        <div className="relative">
                            <SelectField
                                label={t("ASSIGN PROJECT")}
                                options={projects}
                                value={formData.project_id}
                                onChange={(v) => handleSelectChange("project_id", v)}
                                valueKey="id"
                                labelKey="project_name"
                                placeholder={projectPermission ? t("Select Project") : t("Project Access Denied")}
                                error={projectPermission ? null : t("You don't have permission to assign projects")}
                            />
                        </div>

                        <div className="md:col-span-2 pt-4 pb-2"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">{t("BANK DETAILS")}</h3></div>
                        <InputField label={t("BANK NAME")} name="bank_name" value={formData.bank_name} onChange={handleInputChange} />
                        <InputField label={t("ACCOUNT NUMBER")} name="account_number" value={formData.account_number} onChange={handleInputChange} />
                        <InputField label={t("IFSC CODE")} name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} />


                        <div className="md:col-span-2 pt-4 pb-2"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">{t("PERSONAL IDENTIFICATION")}</h3></div>
                        <InputField label={t("AADHAAR NUMBER")} name="aadhaar_number" value={formData.aadhaar_number} onChange={handleInputChange} error={errors.aadhaar_number} />
                        <InputField label={t("PAN NUMBER")} name="pan_number" value={formData.pan_number} onChange={handleInputChange} error={errors.pan_number} />

                        <div className="md:col-span-2 mt-8">
                            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-widest">{t("SITE SPECIFIC RATES")}</h3>

                            {/* Current Rates List */}
                            <div className="space-y-3 mb-6">
                                {projectRates.length > 0 ? (
                                    <div className="overflow-hidden border border-gray-100 rounded-xl">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-4 py-2">Project</th>
                                                    <th className="px-4 py-2">Rate</th>
                                                    <th className="px-4 py-2">Type</th>
                                                    <th className="px-4 py-2">From</th>
                                                    <th className="px-4 py-2 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {projectRates.map((rate) => (
                                                    <tr key={rate.id} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{rate.project_name}</td>
                                                        <td className="px-4 py-2 font-bold text-blue-600">₹{rate.rate}</td>
                                                        <td className="px-4 py-2">
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500">{rate.rate_type}</span>
                                                        </td>
                                                        <td className="px-4 py-2 text-xs text-gray-500">{new Date(rate.effective_from).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button onClick={() => handleDeleteProjectRate(rate.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                <FiX size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("No project-specific rates defined")}</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Rate Form */}
                            <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                                <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest mb-3">{t("Define New Site Rate")}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t("Select Project")}</label>
                                        <select
                                            value={newRate.project_id}
                                            onChange={(e) => setNewRate({ ...newRate, project_id: e.target.value ? parseInt(e.target.value) : "" })}
                                            disabled={!projectPermission}
                                            className={`w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500 ${!projectPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="">{projectPermission ? t("Select Project") : t("Access Denied")}</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t("Rate (₹)")}</label>
                                        <input
                                            type="number"
                                            value={newRate.rate}
                                            onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-indigo-600 outline-none focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{t("Rate Type")}</label>
                                        <select
                                            value={newRate.rate_type}
                                            onChange={(e) => setNewRate({ ...newRate, rate_type: e.target.value })}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-blue-500"
                                        >
                                            {salaryTypes.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleAddProjectRate}
                                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-100 transition-all uppercase tracking-widest"
                                    >
                                        {t("Add Rate")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
                </div>

                {/* Central Confirmation Popup */}
                <ConfirmationPopup
                    isOpen={confirmPopup.isOpen}
                    title={confirmPopup.title}
                    message={confirmPopup.message}
                    onConfirm={confirmPopup.onConfirm}
                    onClose={() => setConfirmPopup(prev => ({ ...prev, isOpen: false }))}
                />
            </div>
        </div>
    );
}
