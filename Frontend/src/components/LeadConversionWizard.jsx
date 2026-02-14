import React, { useState, useEffect } from "react";
import { FiX, FiCheck, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import apiService from "../services/api";

const StepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {isCompleted ? <FiCheck size={16} /> : stepNumber}
              </div>
              <span className={`mt-2 text-xs font-medium ${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                }`}>
                {stepNumber === 1 ? 'Confirm' : stepNumber === 2 ? 'Convert' : 'Complete'}
              </span>
            </div>
            {stepNumber < totalSteps && (
              <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Step1Confirm = ({ leadData, onNext, onCancel }) => {
  // Debug: Log the lead data to understand the structure
  console.log('Lead data in conversion wizard:', leadData);

  // Handle different data structures - some components pass different field names
  const getLeadValue = (primaryField, fallbackField) => {
    return leadData[primaryField] || leadData[fallbackField] || 'N/A';
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Convert Lead to Client</h3>
        <p className="text-gray-600">You are about to convert this lead to a client. Please review the details below.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h4 className="font-semibold text-gray-800 mb-4">Lead Details</h4>

        {/* Debug info - remove this after testing */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Contact Name</span>
            <p className="font-medium">{getLeadValue('contact_name', 'name')}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Company</span>
            <p className="font-medium">{getLeadValue('company_name', 'company')}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Phone</span>
            <p className="font-medium">{leadData.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Email</span>
            <p className="font-medium">{leadData.email || 'N/A'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Lead Type</span>
            <p className="font-medium">{getLeadValue('lead_type', 'leadType')}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <p className="font-medium">{getLeadValue('lead_status', 'leadStatus')}</p>
          </div>
          {(leadData.address || leadData.source || leadData.lead_assignee || leadData.leadAssignee) && (
            <>
              {(leadData.address) && (
                <div>
                  <span className="text-sm text-gray-500">Address</span>
                  <p className="font-medium">{leadData.address}</p>
                </div>
              )}
              {(leadData.source) && (
                <div>
                  <span className="text-sm text-gray-500">Source</span>
                  <p className="font-medium">{leadData.source}</p>
                </div>
              )}
              {(leadData.lead_assignee || leadData.leadAssignee) && (
                <div>
                  <span className="text-sm text-gray-500">Assignee</span>
                  <p className="font-medium">{getLeadValue('lead_assignee', 'leadAssignee')}</p>
                </div>
              )}
            </>
          )}
        </div>
        {(leadData.description) && (
          <div className="mt-4">
            <span className="text-sm text-gray-500">Description</span>
            <p className="font-medium text-sm mt-1">{leadData.description}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          Continue <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const Step2Convert = ({ leadData, onNext, onBack, onCancel }) => {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    setIsConverting(true);
    setError('');

    try {
      const result = await apiService.convertLeadToClient(leadData.id);
      onNext(result);
    } catch (error) {
      console.error("Error converting lead:", error);
      setError(error.message || "Failed to convert lead. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Converting Lead</h3>
        <p className="text-gray-600">
          {isConverting ? 'Please wait while we convert your lead to a client...' : 'Ready to convert this lead to a client.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
        <ul className="text-left text-blue-700 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <FiCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
            Lead status will be updated to "Close - Converted"
          </li>
          <li className="flex items-start gap-2">
            <FiCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
            A new client record will be created
          </li>
          <li className="flex items-start gap-2">
            <FiCheck className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
            You can create projects for this client
          </li>
        </ul>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          disabled={isConverting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <FiArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onCancel}
          disabled={isConverting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isConverting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Converting...
            </>
          ) : (
            <>
              Convert to Client <FiArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const Step3Complete = ({ conversionResult, leadData, onClose, onCreateProject }) => {
  // Handle different data structures
  const clientName = leadData.contact_name || leadData.name || 'Unknown';

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Conversion Successful!</h3>
        <p className="text-gray-600">The lead has been successfully converted to a client.</p>
      </div>

      <div className="bg-green-50 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-800 mb-4">Conversion Summary</h4>
        <div className="text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-green-700">Client Name:</span>
            <span className="font-medium text-green-800">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Client ID:</span>
            <span className="font-medium text-green-800">#{conversionResult.clientId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Status:</span>
            <span className="font-medium text-green-800">Active Client</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => onCreateProject(conversionResult.clientId, leadData)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Project
        </button>
      </div>
    </div>
  );
};

export default function LeadConversionWizard({ isOpen, onClose, leadData, onConversionComplete, onCreateProject }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [conversionResult, setConversionResult] = useState(null);
  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setConversionResult(null);
    }
  }, [isOpen]);

  const handleNext = (result = null) => {
    if (result) {
      setConversionResult(result);
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setConversionResult(null);
    onClose();
    if (onConversionComplete) {
      onConversionComplete();
    }
  };

  const handleCreateProject = (clientId, leadData) => {
    setCurrentStep(1);
    setConversionResult(null);
    onClose();
    if (onCreateProject) {
      onCreateProject(clientId, leadData);
    }
  };

  if (!isOpen || !leadData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">Lead Conversion</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {currentStep === 1 && (
            <Step1Confirm
              leadData={leadData}
              onNext={handleNext}
              onCancel={handleClose}
            />
          )}

          {currentStep === 2 && (
            <Step2Convert
              leadData={leadData}
              onNext={handleNext}
              onBack={handleBack}
              onCancel={handleClose}
            />
          )}

          {currentStep === 3 && (
            <Step3Complete
              conversionResult={conversionResult}
              leadData={leadData}
              onClose={handleClose}
              onCreateProject={handleCreateProject}
            />
          )}
        </div>
      </div>
    </div>
  );
}