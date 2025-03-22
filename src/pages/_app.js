import "../styles/globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'

import { ToastContainer } from "react-toastify";

export default function App({ Component, pageProps }) {
 
  return (
    <ClerkProvider {...pageProps}>
      <ToastContainer />
      <Component {...pageProps} />
    </ClerkProvider>
)}
