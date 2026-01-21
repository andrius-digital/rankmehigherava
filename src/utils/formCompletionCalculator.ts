// Utility to calculate per-step completion percentages for the website submission form

interface FormData {
  companyName: string;
  ownsDomain: string;
  domainName: string;
  businessPhone: string;
  businessEmail: string;
  jobRequestEmail: string;
  mainCity: string;
  serviceAreas: string;
  showAddress: string;
  streetAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  showHours: string;
  serviceCategory: string;
  includeServicePage: string;
  showPricing: string;
  servicePageType: string;
  freeEstimates: string;
  customerAction: string;
  clientType: string;
  serviceProcess: string;
  guarantees: string;
  businessUnique: string;
  qualityTrust: string;
  founderMessage: string;
  googleBusinessProfileLink: string;
  competitorWebsites: string;
  additionalNotes: string;
  specialOffersExplanation: string;
  financingExplanation: string;
  websiteColors: string;
  [key: string]: string;
}

interface OperatingHours {
  [day: string]: { open: boolean; openTime: string; closeTime: string };
}

interface Service {
  name: string;
  price: string;
  description: string;
}

export interface FormState {
  formData: FormData;
  hasGoogleProfile: string;
  hasSpecialOffers: string;
  hasFinancing: string;
  emergencyServices: Record<string, boolean>;
  insuranceHelp: Record<string, boolean>;
  hasSpecificFont: string;
  hasBrandBook: string;
  operatingHours: OperatingHours;
  services: Service[];
  logoFiles: string[];
  founderPhotos: string[];
}

// Helper to check if a string field is filled
const isFilled = (value: string | undefined | null): boolean => {
  return Boolean(value && value.trim().length > 0);
};

// Helper to check if at least one service is defined
const hasServices = (services: Service[]): boolean => {
  return services.some(s => isFilled(s.name));
};

// Step 1: Business Info
// Required: companyName, hasGoogleProfile (moved here), ownsDomain, domainName (if yes), businessPhone, businessEmail, jobRequestEmail
export function calculateStep1Completion(state: FormState): number {
  const { formData, hasGoogleProfile } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(formData.companyName));
  fields.push(isFilled(hasGoogleProfile)); // GBP question moved to Step 1
  if (hasGoogleProfile === "yes") {
    fields.push(isFilled(formData.googleBusinessProfileLink));
  }
  fields.push(isFilled(formData.ownsDomain));
  if (formData.ownsDomain === "yes") {
    fields.push(isFilled(formData.domainName));
  }
  fields.push(isFilled(formData.businessPhone));
  fields.push(isFilled(formData.businessEmail));
  fields.push(isFilled(formData.jobRequestEmail));
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 2: Location & Hours
// Required: mainCity, serviceAreas, showAddress, showHours
export function calculateStep2Completion(state: FormState): number {
  const { formData, operatingHours } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(formData.mainCity));
  fields.push(isFilled(formData.serviceAreas));
  fields.push(isFilled(formData.showAddress));
  
  if (formData.showAddress === "yes") {
    fields.push(isFilled(formData.streetAddress));
    fields.push(isFilled(formData.city));
    fields.push(isFilled(formData.stateProvince));
    fields.push(isFilled(formData.postalCode));
  }
  
  fields.push(isFilled(formData.showHours));
  
  if (formData.showHours === "yes") {
    const hasAnyHours = Object.values(operatingHours).some(
      day => day.open && isFilled(day.openTime) && isFilled(day.closeTime)
    );
    fields.push(hasAnyHours);
  }
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 3: Services
// Required: at least 1 service, includeServicePage, showPricing, servicePageType, freeEstimates, customerAction, clientType
export function calculateStep3Completion(state: FormState): number {
  const { formData, services } = state;
  const fields: boolean[] = [];
  
  fields.push(hasServices(services));
  fields.push(isFilled(formData.includeServicePage));
  fields.push(isFilled(formData.showPricing));
  fields.push(isFilled(formData.servicePageType));
  fields.push(isFilled(formData.freeEstimates));
  fields.push(isFilled(formData.customerAction));
  fields.push(isFilled(formData.clientType));
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 4: Operations
// Required: serviceProcess, guarantees, businessUnique
export function calculateStep4Completion(state: FormState): number {
  const { formData } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(formData.serviceProcess));
  fields.push(isFilled(formData.guarantees));
  fields.push(isFilled(formData.businessUnique));
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 5: Trust
// Required: qualityTrust
export function calculateStep5Completion(state: FormState): number {
  const { formData } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(formData.qualityTrust));
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 6: Team & Story (now includes logo + all photos)
// Required: founderMessage, logoFiles (moved here from step 7)
// Optional but tracked: founderPhotos
export function calculateStep6Completion(state: FormState): number {
  const { formData, logoFiles, founderPhotos } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(formData.founderMessage));
  fields.push(logoFiles.length > 0); // Logo moved to step 6
  fields.push(founderPhotos.length > 0); // Founder photos
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 7: Branding Details (now just colors, fonts, brand book - logo moved to step 6)
// All optional - just check if colors or font preference is set
export function calculateStep7Completion(state: FormState): number {
  const { formData, hasSpecificFont, hasBrandBook } = state;
  const fields: boolean[] = [];
  
  // Colors are optional but good to have
  fields.push(isFilled(formData.websiteColors) || true); // Always count as done since optional
  fields.push(isFilled(hasSpecificFont) || true); // Always count as done since optional
  fields.push(isFilled(hasBrandBook) || true); // Always count as done since optional
  
  // Since all are optional, step 7 is always 100%
  return 100;
}

// Step 8: Reviews & Social (GBP moved to step 1)
// All optional now - reviews, social links
export function calculateStep8Completion(state: FormState): number {
  // Since GBP moved to step 1 and everything else is optional
  // Step 8 is always complete
  return 100;
}

// Step 9: Offers
// Required: hasSpecialOffers selection, hasFinancing selection
// If hasSpecialOffers=yes: specialOffersExplanation
// If hasFinancing=yes: financingExplanation
export function calculateStep9Completion(state: FormState): number {
  const { formData, hasSpecialOffers, hasFinancing } = state;
  const fields: boolean[] = [];
  
  fields.push(isFilled(hasSpecialOffers));
  
  if (hasSpecialOffers === "yes") {
    fields.push(isFilled(formData.specialOffersExplanation));
  }
  
  fields.push(isFilled(hasFinancing));
  
  if (hasFinancing === "yes") {
    fields.push(isFilled(formData.financingExplanation));
  }
  
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Step 10: Final - Has 2 optional fields
// competitorWebsites and additionalNotes - both optional
export function calculateStep10Completion(state: FormState): number {
  // Both fields are optional, so step 10 is always complete
  return 100;
}

// Calculate all step completions
export function calculateAllStepCompletions(state: FormState): number[] {
  return [
    calculateStep1Completion(state),
    calculateStep2Completion(state),
    calculateStep3Completion(state),
    calculateStep4Completion(state),
    calculateStep5Completion(state),
    calculateStep6Completion(state),
    calculateStep7Completion(state),
    calculateStep8Completion(state),
    calculateStep9Completion(state),
    calculateStep10Completion(state),
  ];
}

// Get list of incomplete steps for validation message
export function getIncompleteSteps(state: FormState, stepNames: string[]): string[] {
  const completions = calculateAllStepCompletions(state);
  const incomplete: string[] = [];
  
  completions.forEach((completion, index) => {
    if (completion < 100) {
      incomplete.push(`${stepNames[index]} (${completion}%)`);
    }
  });
  
  return incomplete;
}
