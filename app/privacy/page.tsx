import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back 
      </Link>
      <h1 className="text-3xl font-bold mb-8">Privacy Policy of ideacloner</h1>
      <p className="mb-4">
        Welcome to ideacloner. This Privacy Policy explains how we collect, use, and share information about you when you visit or use our website, https://ideacloner.xyz. We strive to be transparent and clear in our data practices and to respect your privacy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Data Collection and Use</h2>
      <ul className="list-disc pl-6 space-y-2 mb-4">
        <li>
          <strong>Personal Data:</strong> We do not collect personal data unless you voluntarily provide it, for example, by subscribing to our newsletter or contacting us directly.
        </li>
        <li>
          <strong>Newsletter:</strong> If you sign up for our newsletter, provided by Resend, we will collect your email address. You can unsubscribe at any time.
        </li>
        <li>
          <strong>Usage Data:</strong> We use Vercel Analytics/Upstash, cookie-free and privacy-friendly analytics tools, to collect anonymized data about website usage to improve our services.
        </li>
        <li>
          <strong>Cookies:</strong> Our website uses cookies to enhance user experience. You may refuse the use of cookies by selecting the appropriate settings on your browser.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">Sharing of Information</h2>
      <p className="mb-4">
        We do not sell, trade, or rent your personal identification information to others. However, we may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Security</h2>
      <p className="mb-4">
        We are committed to ensuring that your information is secure. We have put in place suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Age Restrictions</h2>
      <p className="mb-4">
        Our website does not have age restrictions. However, we do not knowingly collect personal information from children under the age of 13.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Changes to This Privacy Policy</h2>
      <p className="mb-4">
        ideacloner reserves the right to update this privacy policy at any time. When we do, we will revise the updated date at the bottom of this page. We encourage users to frequently check this page for any changes to stay informed.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Contacting Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, the practices of this site, or your dealings with this site, please contact us at:
      </p>
      <address className="not-italic mb-4">
        ideacloner<br />
        support@ideacloner.xyz
      </address>
      <p className="text-sm text-gray-500 mt-8">
        This document was last updated on December 31, 2025.
      </p>
    </div>
  );
}
