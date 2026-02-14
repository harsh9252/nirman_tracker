import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { TranslationProvider } from './services/translationService.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './assets/CSS/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TranslationProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          backgroundColor: '#dc2626', // red-600 for error toasts
          color: '#ffffff'
        }}
        progressStyle={{
          backgroundColor: '#ffffff' // white progress bar
        }}
        closeButtonStyle={{
          color: '#ffffff' // white close button
        }}
      />
    </TranslationProvider>
  </React.StrictMode>,
)
