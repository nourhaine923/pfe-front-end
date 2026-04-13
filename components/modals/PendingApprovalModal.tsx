import React from 'react';

const PendingApprovalModal = ({ registeredEmail, onClose, onSignInClick }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] animate-fadeIn p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl transform animate-scaleIn overflow-hidden">
        {/* Decorative Header */}
        <div className="relative bg-gradient-to-r from-green-700 to-green-900 px-6 py-8 text-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-white"></div>
          </div>
          
          {/* Animated Icon */}
          <div className="relative mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm animate-bounce">
            <i className='bx bx-time-five text-white text-5xl'></i>
          </div>
          
          <h3 className="relative text-2xl font-bold text-white mb-2">
            Pending Approval
          </h3><br/><br/>
        </div><br/>
        
        {/* Content - Increased vertical spacing for longer modal */}
        <div className="p-8 py-12 space-y-10">
          {/* Status Timeline - Icons above text */}
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <i className='bx bx-check-circle text-teal-500 text-2xl'></i>
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 mb-1">Account Created</p>
                <p className="text-sm text-gray-500">Your account <span className="text-base font-medium text-teal-800 mb-1">{registeredEmail}</span> has been successfully registered</p>
              </div>
            </div><br/>
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center animate-pulse mb-4">
                <i className='bx bx-loader-alt text-teal-600 text-2xl animate-spin'></i>
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 mb-1">Awaiting Approval</p>
                <p className="text-sm text-gray-500">Administrator review in progress </p>                
                <p className="text-sm text-teal-700">
                  Most accounts are approved within 24-48 hours. 
                </p>
              </div>
            </div>
          </div><br/>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-6">
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 text-teal-600 hover:text-green-900 font-medium  "
            >
              Back to Sign Up
            </button>
          </div>
          </div>
          <br/>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalModal;