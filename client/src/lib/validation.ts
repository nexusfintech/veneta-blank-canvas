import { z } from "zod";

// Italian fiscal code validation
export const fiscalCodeRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

// Italian VAT number validation
export const vatNumberRegex = /^IT[0-9]{11}$/;

export const validateFiscalCode = (code: string): boolean => {
  return fiscalCodeRegex.test(code.toUpperCase());
};

export const validateVatNumber = (vat: string): boolean => {
  return vatNumberRegex.test(vat.toUpperCase());
};

// Legal representative validation schema
const legalRepresentativeFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentAuthority: z.string().optional(),
  documentIssuePlace: z.string().optional(),
  documentIssueDate: z.string().optional(),
  isPoliticallyExposed: z.boolean().default(false),
  benefitsPublicFunds: z.boolean().default(false),
  hasApicalRoles: z.boolean().default(false),
  hasPublicCharges: z.boolean().default(false),
  hasCriminalRecord: z.boolean().default(false),
});

// Beneficial owner validation schema
const beneficialOwnerFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentAuthority: z.string().optional(),
  documentIssuePlace: z.string().optional(),
  documentIssueDate: z.string().optional(),
  isPoliticallyExposed: z.boolean().default(false),
  hasPublicCharges: z.boolean().default(false),
  hasOtherRoles: z.boolean().default(false),
  benefitsPublicFunds: z.boolean().default(false),
  ownershipReason: z.string().optional(),
});

export const clientFormSchema = z.object({
  type: z.enum(["persona_fisica", "azienda"]),
  // Individual fields - Dati anagrafici
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  birthPlace: z.string().optional(),
  citizenship: z.string().optional(),
  
  // Individual fields - Residenza
  residenceLocality: z.string().optional(),
  
  // Individual fields - Documento di identità
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentIssuedBy: z.string().optional(),
  documentIssuePlace: z.string().optional(),
  documentIssueDate: z.string().optional(),
  // Company basic fields
  companyName: z.string().optional(),
  vatNumber: z.string().optional(),
  companyFiscalCode: z.string().optional(),
  
  // Legal representative fields
  repFirstName: z.string().optional(),
  repLastName: z.string().optional(),
  repFiscalCode: z.string().optional(),
  repBirthPlace: z.string().optional(),
  repBirthDate: z.string().optional(),
  repResidenceAddress: z.string().optional(),
  repResidenceZipCode: z.string().optional(),
  repResidenceCity: z.string().optional(),
  repResidenceProvince: z.string().optional(),
  repDocumentType: z.string().optional(),
  repDocumentNumber: z.string().optional(),
  repDocumentAuthority: z.string().optional(),
  repDocumentIssuePlace: z.string().optional(),
  repDocumentIssueDate: z.string().optional(),
  // Company extended fields
  legalAddress: z.string().optional(),
  legalZipCode: z.string().optional(),
  legalCity: z.string().optional(),
  legalProvince: z.string().optional(),
  fax: z.string().optional(),
  pec: z.string().optional(),
  // Legal representative
  legalRepresentative: legalRepresentativeFormSchema.optional(),
  // Beneficial owners
  beneficialOwners: z.array(beneficialOwnerFormSchema).optional(),
  // Geographic area and activity
  mainActivityProvince: z.string().optional(),
  relationshipDestinationProvince: z.string().optional(),
  counterpartyAreaProvince: z.string().optional(),
  professionalActivity: z.string().optional(),
  // Requested product
  requestedProduct: z.string().optional(),
  requestedCapital: z.string().optional(),
  financingDuration: z.string().optional(),
  interestRateType: z.string().optional(),
  // Compensation and fees
  mediatorCompensation: z.string().optional(),
  compensationType: z.enum(["amount", "percentage"]).optional(),
  commission: z.string().optional(),
  commissionType: z.enum(["amount", "percentage"]).optional(),
  instructionFees: z.string().optional(),
  contractDate: z.string().optional(),
  // Common fields
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["attivo", "inattivo"]).default("attivo"),
}).refine((data) => {
  if (data.type === "persona_fisica") {
    return data.firstName && data.lastName && data.fiscalCode;
  } else if (data.type === "azienda") {
    return data.companyName && data.vatNumber;
  }
  return false;
}, {
  message: "Required fields missing based on client type",
}).refine((data) => {
  if (data.fiscalCode && data.fiscalCode.trim()) {
    return validateFiscalCode(data.fiscalCode);
  }
  return true;
}, {
  message: "Invalid fiscal code format",
  path: ["fiscalCode"],
}).refine((data) => {
  if (data.vatNumber && data.vatNumber.trim()) {
    return validateVatNumber(data.vatNumber);
  }
  return true;
}, {
  message: "Invalid VAT number format (should be ITxxxxxxxxxxx)",
  path: ["vatNumber"],
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
