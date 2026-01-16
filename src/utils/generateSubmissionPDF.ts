import DOMPurify from 'dompurify';

// Sanitize all user input to prevent XSS attacks
const sanitizeValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  // Use DOMPurify to strip all HTML tags
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

export const generateSubmissionPDF = (submission: any) => {
  const formData = submission.form_data;
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "Not provided";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
      if (value.length === 0) return "Not provided";
      return value.map(v => typeof v === "object" ? sanitizeValue(JSON.stringify(v)) : sanitizeValue(v)).join(", ");
    }
    if (typeof value === "object") {
      // Handle checkbox objects (like emergencyServices, insuranceHelp)
      const selected = Object.entries(value)
        .filter(([_, v]) => v === true)
        .map(([k]) => sanitizeValue(k));
      if (selected.length > 0) return selected.join(", ");
      
      // Handle operating hours
      if (value.monday !== undefined) {
        return Object.entries(value)
          .filter(([_, v]: [string, any]) => v.open)
          .map(([day, v]: [string, any]) => `${sanitizeValue(day)}: ${sanitizeValue(v.openTime)} - ${sanitizeValue(v.closeTime)}`)
          .join("; ") || "Not provided";
      }
      
      return sanitizeValue(JSON.stringify(value));
    }
    return sanitizeValue(String(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sanitize company name and email for header display
  const safeCompanyName = sanitizeValue(formData.companyName) || 'Unknown';
  const safeBusinessEmail = sanitizeValue(formData.businessEmail) || 'Not provided';

  const sections = [
    {
      title: "Section 1: Business Information",
      fields: [
        { label: "1.1 Official company name", value: formData.companyName },
        { label: "1.2 Do you own a domain name?", value: formData.ownsDomain },
        { label: "1.3 Domain name", value: formData.domainName },
        { label: "1.4 Business Phone Number", value: formData.businessPhone },
        { label: "1.5 Business email", value: formData.businessEmail },
        { label: "1.6 Email for job requests", value: formData.jobRequestEmail },
      ]
    },
    {
      title: "Section 2: Location & Hours",
      fields: [
        { label: "2.1 Main City / Primary Service Location", value: formData.mainCity },
        { label: "2.2 Service Areas", value: formData.serviceAreas },
        { label: "2.3 Show physical address on website?", value: formData.showAddress },
        { label: "2.4 Street Address", value: formData.streetAddress },
        { label: "2.5 City", value: formData.city },
        { label: "2.6 State/Province", value: formData.stateProvince },
        { label: "2.7 Postal Code", value: formData.postalCode },
        { label: "2.8 Show hours on website?", value: formData.showHours },
        { label: "2.9 Operating Hours", value: formData.operatingHours },
      ]
    },
    {
      title: "Section 3: Services",
      fields: [
        { label: "3.1 Service Category", value: formData.serviceCategory },
        { label: "3.2 Services List", value: formData.services },
        { label: "3.3 Include service page?", value: formData.includeServicePage },
        { label: "3.4 Show pricing?", value: formData.showPricing },
        { label: "3.5 Service page type", value: formData.servicePageType },
        { label: "3.6 Free estimates?", value: formData.freeEstimates },
        { label: "3.7 Customer action", value: formData.customerAction },
        { label: "3.8 Client type", value: formData.clientType },
      ]
    },
    {
      title: "Section 4: Operations",
      fields: [
        { label: "4.1 Emergency services", value: formData.emergencyServices },
        { label: "4.2 Homeowner challenges", value: formData.homeownerChallenges },
        { label: "4.3 Service process", value: formData.serviceProcess },
        { label: "4.4 Service options", value: formData.serviceOptions },
        { label: "4.5 Guarantees", value: formData.guarantees },
        { label: "4.6 What makes your business unique?", value: formData.businessUnique },
      ]
    },
    {
      title: "Section 5: Trust & Credentials",
      fields: [
        { label: "5.1 Quality & trust factors", value: formData.qualityTrust },
        { label: "5.2 Insurance help", value: formData.insuranceHelp },
        { label: "5.3 Accreditations", value: formData.accreditations },
        { label: "5.4 Insurance elaboration", value: formData.insuranceElaboration },
      ]
    },
    {
      title: "Section 6: Team & Story",
      fields: [
        { label: "6.1 Founder message", value: formData.founderMessage },
        { label: "6.2 Founder photos", value: formData.founderPhotos },
        { label: "6.3 Team members", value: formData.teamMembers },
        { label: "6.4 Team photos", value: formData.teamPhotos },
        { label: "6.5 Community giving", value: formData.communityGiving },
        { label: "6.6 Core values", value: formData.coreValues },
      ]
    },
    {
      title: "Section 7: Branding",
      fields: [
        { label: "7.1 Logo files", value: formData.logoFiles },
        { label: "7.2 Website colors", value: formData.websiteColors },
        { label: "7.3 Has specific font?", value: formData.hasSpecificFont },
        { label: "7.4 Font name", value: formData.fontName },
        { label: "7.5 Has brand book?", value: formData.hasBrandBook },
        { label: "7.6 Brand book link", value: formData.brandBookLink },
      ]
    },
    {
      title: "Section 8: Online Presence",
      fields: [
        { label: "8.1 Has Google Business Profile?", value: formData.hasGoogleProfile },
        { label: "8.2 Google Business Profile link", value: formData.googleBusinessProfileLink },
        { label: "8.3 Google reviews", value: formData.googleReviews },
        { label: "8.4 Other reviews link", value: formData.otherReviewsLink },
        { label: "8.5 Yelp link", value: formData.yelpLink },
        { label: "8.6 Instagram link", value: formData.instagramLink },
        { label: "8.7 Facebook link", value: formData.facebookLink },
        { label: "8.8 TikTok link", value: formData.tiktokLink },
        { label: "8.9 Work photos link", value: formData.workPhotosLink },
      ]
    },
    {
      title: "Section 9: Offers & Financing",
      fields: [
        { label: "9.1 Has special offers?", value: formData.hasSpecialOffers },
        { label: "9.2 Special offers explanation", value: formData.specialOffersExplanation },
        { label: "9.3 Has financing?", value: formData.hasFinancing },
        { label: "9.4 Financing explanation", value: formData.financingExplanation },
      ]
    },
    {
      title: "Section 10: Final Notes",
      fields: [
        { label: "10.1 Competitor websites", value: formData.competitorWebsites },
        { label: "10.2 Additional notes", value: formData.additionalNotes },
        { label: "10.3 Work photos", value: formData.workPhotos },
      ]
    },
  ];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'unsafe-inline';">
      <title>Website Submission - ${safeCompanyName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #dc2626;
        }
        .header h1 { font-size: 28px; color: #dc2626; margin-bottom: 8px; }
        .header p { color: #666; font-size: 14px; }
        .meta { 
          background: #f9fafb; 
          padding: 16px; 
          border-radius: 8px; 
          margin-bottom: 32px;
        }
        .meta-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .meta-label { color: #666; font-size: 14px; }
        .meta-value { font-weight: 600; }
        .section { margin-bottom: 32px; }
        .section-title { 
          font-size: 18px; 
          font-weight: 700; 
          color: #dc2626; 
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        .field { 
          display: flex; 
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .field-label { 
          flex: 0 0 45%; 
          color: #6b7280; 
          font-size: 14px;
        }
        .field-value { 
          flex: 1; 
          font-weight: 500;
          word-break: break-word;
        }
        .field-value.empty { color: #9ca3af; font-style: italic; }
        @media print {
          body { padding: 20px; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Website Submission</h1>
        <p>Ernest Marketing - Website Onboarding Form</p>
      </div>
      
      <div class="meta">
        <div class="meta-row">
          <span class="meta-label">Company:</span>
          <span class="meta-value">${safeCompanyName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Email:</span>
          <span class="meta-value">${safeBusinessEmail}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Submitted:</span>
          <span class="meta-value">${formatDate(submission.created_at)}</span>
        </div>
      </div>

      ${sections.map(section => `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          ${section.fields.map(field => {
            const value = formatValue(field.value);
            const isEmpty = value === "Not provided";
            return `
              <div class="field">
                <span class="field-label">${field.label}</span>
                <span class="field-value ${isEmpty ? 'empty' : ''}">${value}</span>
              </div>
            `;
          }).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};
