import React from 'react';
import App from './App';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <AuthProvider>
      <App />
       <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
    />
    </AuthProvider>
  </Provider>
);
