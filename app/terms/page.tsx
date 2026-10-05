import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back 
      </Link>
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions for "ideacloner" Software</h1>

      <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
      <p className="mb-4">
        Welcome to ideacloner. These terms and conditions govern your use of our software, ideacloner.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">2. Acceptance of Terms</h2>
      <p className="mb-4">
        By purchasing and using ideacloner, you agree to these terms. If you do not agree, please refrain from using our software.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">3. License to Use</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>
          <strong>Grant:</strong> Upon purchase, we grant you a perpetual, non-exclusive license to use and modify ideacloner's code.
        </li>
        <li>
          <strong>Scope:</strong> You are permitted to use the code to develop new software, including for commercial purposes.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">4. User Responsibilities</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>
          <strong>Code Use:</strong> You are responsible for any software created using ideacloner’s code.
        </li>
        <li>
          <strong>Compliance:</strong> You agree to comply with all applicable laws and regulations in your use and development of new software with ideacloner’s code.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>
          <strong>Original Software:</strong> All rights in the original ideacloner software remain our property.
        </li>
        <li>
          <strong>New Creations:</strong> You retain rights to the new software you create using ideacloner’s code, subject to these terms.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">6. Privacy and Data Use</h2>
      <p className="mb-4">
        Please refer to our Privacy Policy to understand how we handle your data.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">7. Modifications to Terms</h2>
      <p className="mb-4">
        We may revise these terms. We will notify you of significant changes, but you should review them periodically.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">8. Termination of License</h2>
      <p className="mb-4">
        We may revoke your license if you violate these terms, without prejudice to any other rights.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">9. Warranty Disclaimer</h2>
      <p className="mb-4">
        ideacloner is provided "as is". We do not warrant that it will be suitable for your intended use or that it will be uninterrupted or error-free.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
      <p className="mb-4">
        Our liability to you is limited to the amount you paid for ideacloner. We are not liable for any consequences arising from your use or modification of the software.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">11. Governing Law</h2>
      <p className="mb-4">
        These terms are governed by [Your Jurisdiction] and any disputes will be subject to the jurisdiction of [Your Jurisdiction] courts.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">12. Contact Information</h2>
      <p className="mb-4">
        For inquiries or concerns about these terms, please contact us at support@ideacloner.xyz.
      </p>

      <p className="mt-8 font-semibold">
        By purchasing and using ideacloner, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
      </p>

      <p className="text-sm text-gray-500 mt-8">
        This document was last updated on December 31, 2025.
      </p>
    </div>
  );
}
