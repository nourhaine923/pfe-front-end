// the attributes for each score type, including metadata for form generation and validation
export const SCORE_1_ATTRIBUTES = [
  // Demographics
  { key: "recipient_age", label: "Recipient Age", type: "numeric", unit: "years", description: "Age of the recipient at transplant", example: "45", validRange: "0-100", guidance: "Enter the recipient's age in years" },
  { key: "donor_age", label: "Donor Age", type: "numeric", unit: "years", description: "Age of the donor at donation", example: "35", validRange: "0-80", guidance: "Enter the donor's age in years" },
  { key: "sex", label: "Sex", type: "categorical", options: ["M", "F"], description: "Patient sex", guidance: "Enter 'M' for Male, 'F' for Female" },
  { key: "foreign_patient", label: "Foreign Patient", type: "boolean", description: "Patient is from abroad", guidance: "True if patient is foreign, False otherwise" },
  
  // Morphology
  { key: "height_cm", label: "Height", type: "numeric", unit: "cm", description: "Patient height", example: "170", validRange: "50-250", guidance: "Enter height in centimeters" },
  { key: "weight_kg", label: "Weight", type: "numeric", unit: "kg", description: "Patient weight", example: "70", validRange: "10-300", guidance: "Enter weight in kilograms" },
  { key: "bmi", label: "BMI", type: "numeric", unit: "kg/m²", description: "Body Mass Index", example: "24.2", guidance: "Automatically calculated from height/weight" },
  
  // Clinical History
  { key: "nephropathy", label: "Primary Nephropathy", type: "categorical", description: "Primary kidney disease", example: "Diabetic, Glomerular, Vascular, NTIC, Hereditary, NI", guidance: "Enter the primary nephropathy type" },
  { key: "dialysis_type", label: "Dialysis Type", type: "categorical", options: ["Hemodialysis", "Peritoneal Dialysis", "None"], description: "Type of dialysis", guidance: "Select the dialysis type" },
  { key: "dialysis_duration", label: "Dialysis Duration", type: "numeric", unit: "months", description: "Duration on dialysis", example: "24", validRange: "0-240", guidance: "Enter number of months on dialysis" },
  { key: "comorbidities", label: "Comorbidities", type: "categorical", description: "Other medical conditions", example: "COPD, CHF, Liver disease", guidance: "Enter comorbidities as text" },
  { key: "transplant_rank", label: "Transplant Rank", type: "numeric", unit: "count", description: "Number of previous transplants", example: "1", guidance: "Enter 1 for first transplant, 2 for second, etc." },
  
  // Pre-transplant Assessment - Boolean
  { key: "diabetes", label: "Diabetes", type: "boolean", description: "Patient has diabetes mellitus", guidance: "True if patient has diabetes, False otherwise" },
  { key: "hypertension", label: "Hypertension", type: "boolean", description: "Patient has hypertension", guidance: "True if patient has hypertension, False otherwise" },
  { key: "acc", label: "ACC", type: "boolean", description: "ACC status", guidance: "True if ACC present, False otherwise" },
  { key: "hbsag", label: "HBsAg", type: "boolean", description: "Hepatitis B surface antigen status", guidance: "True if positive, False if negative" },
  { key: "anti_hcv", label: "Anti-HCV", type: "boolean", description: "Hepatitis C antibody status", guidance: "True if positive, False if negative" },
  { key: "transfusion_history", label: "Transfusion History", type: "boolean", description: "Previous blood transfusions", guidance: "True if patient had transfusions, False otherwise" },
  
  // Pre-transplant Assessment - Categorical/Numeric
  { key: "eer_modality", label: "EER Modality", type: "categorical", options: ["Preemptive", "DP", "HD", "DP_HD"], description: "Dialysis modality", guidance: "Select: Preemptive (no dialysis), DP (Peritoneal), HD (Hemodialysis), DP_HD (both)" },
  { key: "previous_transplants", label: "Previous Transplants", type: "numeric", unit: "count", description: "Number of previous transplantations", example: "0, 1, 2", guidance: "Enter 0 for first transplant, 1 for second, etc." },
  { key: "etiology_irc", label: "Etiology IRC", type: "categorical", description: "Cause of kidney failure", example: "Hypertension, Diabetes, Glomerulonephritis", guidance: "Enter the cause of kidney failure" },
  { key: "transplant_delay", label: "Transplant Delay", type: "numeric", unit: "months", description: "Time on waiting list", example: "18", validRange: "0-120", guidance: "Enter months on waiting list" },
  { key: "serum_creatinine", label: "Serum Creatinine", type: "numeric", unit: "mg/dL", description: "Pre-transplant creatinine level", example: "1.2", validRange: "0.3-15.0", guidance: "Enter creatinine value in mg/dL" },
  
  // Transplant Conditions
  { key: "donor_type", label: "Donor Type", type: "categorical", options: ["Living Related", "Living Unrelated", "Deceased Donor", "Cadaveric"], description: "Type of donor", guidance: "Select the donor type" },
  { key: "cold_ischemia", label: "Cold Ischemia Time", type: "numeric", unit: "hours", description: "Cold ischemia duration", example: "8.5", validRange: "0-48", guidance: "Enter cold ischemia time in hours" },
  { key: "warm_ischemia", label: "Warm Ischemia Time", type: "numeric", unit: "minutes", description: "Warm ischemia duration", example: "35", validRange: "0-120", guidance: "Enter warm ischemia time in minutes" },
  { key: "transplant_location", label: "Transplant Location", type: "categorical", description: "Hospital where transplant was performed", example: "HCN, RABTA, SOUSSE", guidance: "Enter the hospital location" },
  { key: "service_origin", label: "Service Origin", type: "categorical", description: "Referring service", example: "Nephrology_HCN, Pediatrics_HCN", guidance: "Enter the referring service" },
  
  // Immunology - Computed values
  { key: "blood_compatibility", label: "Blood Compatibility", type: "computed", description: "Donor-recipient blood group compatibility", possibleValues: ["Identical", "Compatible", "Incompatible"], guidance: "Automatically computed from donor and recipient blood groups", expectedFormat: "One of: 'Identical', 'Compatible', 'Incompatible'" },
  { key: "hla_matching", label: "HLA Matching", type: "computed", description: "Donor-recipient HLA match level", possibleValues: ["0/6 mismatches", "1-2/6 mismatches", "3-4/6 mismatches", "5-6/6 mismatches"], guidance: "Automatically calculated from HLA typing data", expectedFormat: "Number of mismatches (0, 2, 4, 6)" },
]

export const SCORE_2_ATTRIBUTES = [
  // Follow-up
  { key: "visit_date", label: "Visit Date", type: "date", description: "Date of follow-up visit", example: "2024-01-15", guidance: "Select the visit date" },
  { key: "post_transplant_day", label: "Post-Transplant Day", type: "numeric", unit: "days", description: "Days since transplant", example: "180", validRange: "0-9999", guidance: "Number of days since transplant" },
  { key: "post_transplant_month", label: "Post-Transplant Month", type: "numeric", unit: "months", description: "Months since transplant", example: "6", validRange: "0-360", guidance: "Number of months since transplant" },
  { key: "visit_type", label: "Visit Type", type: "categorical", options: ["Scheduled", "Emergency", "Follow-up"], description: "Type of visit", guidance: "Select the visit type" },
  { key: "clinical_status", label: "Clinical Status", type: "categorical", options: ["Stable", "Improving", "Worsening", "Critical"], description: "Patient's clinical status", guidance: "Select the patient's current clinical status" },
  { key: "nephropathy_recurrence", label: "Nephropathy Recurrence", type: "categorical", options: ["None", "Mild", "Moderate", "Severe"], description: "Recurrence of original disease", guidance: "Select the severity of disease recurrence" },
  { key: "followup_comment", label: "Follow-up Comment", type: "categorical", description: "Additional notes", guidance: "Any additional comments about the follow-up" },
  
  // Biological Measurements
  { key: "creatinine", label: "Serum Creatinine", type: "numeric", unit: "mg/dL", description: "Current creatinine level", example: "1.2", validRange: "0.3-15.0", guidance: "Enter current creatinine in mg/dL (normal: 0.6-1.2)" },
  { key: "urea", label: "Urea", type: "numeric", unit: "mg/dL", description: "Blood urea nitrogen", example: "25", validRange: "5-150", guidance: "Enter blood urea nitrogen in mg/dL (normal: 7-20)" },
  { key: "gfr", label: "eGFR", type: "numeric", unit: "mL/min", description: "Estimated glomerular filtration rate", example: "65", validRange: "0-150", guidance: "Enter eGFR value (normal: >60)" },
  { key: "hemoglobin", label: "Hemoglobin", type: "numeric", unit: "g/dL", description: "Blood hemoglobin level", example: "12.5", validRange: "5-20", guidance: "Enter hemoglobin in g/dL (normal: 12-16)" },
  { key: "crp", label: "CRP", type: "numeric", unit: "mg/L", description: "C-reactive protein", example: "5", validRange: "0-200", guidance: "Enter CRP in mg/L (normal: <5)" },
  { key: "tsh", label: "TSH", type: "numeric", unit: "mIU/L", description: "Thyroid stimulating hormone", example: "2.5", validRange: "0.1-10", guidance: "Enter TSH in mIU/L (normal: 0.4-4.0)" },
  { key: "proteinuria", label: "Proteinuria", type: "numeric", unit: "mg/24h", description: "Urine protein excretion", example: "150", validRange: "0-5000", guidance: "Enter 24h urine protein in mg (normal: <150)" },
  { key: "other_biomarker_1", label: "Other Biomarker 1", type: "numeric", description: "Custom biomarker", example: "100", guidance: "Enter value for custom biomarker 1" },
  { key: "other_biomarker_2", label: "Other Biomarker 2", type: "numeric", description: "Custom biomarker", example: "100", guidance: "Enter value for custom biomarker 2" },
  
  // Adverse Events
  { key: "has_adverse_event", label: "Has Adverse Event", type: "boolean", description: "Any adverse events recorded", guidance: "True if any adverse events exist, False otherwise" },
  { key: "adverse_event_count", label: "Adverse Event Count", type: "numeric", unit: "count", description: "Number of adverse events", example: "0, 1, 2", guidance: "Enter the total number of adverse events" },
  { key: "adverse_event_types", label: "Adverse Event Types", type: "array", description: "Types of adverse events", example: "Infection, Rejection", guidance: "List of adverse event types" },
  { key: "max_severity", label: "Max Severity", type: "numeric", description: "Highest severity score", example: "3", validRange: "0-4", guidance: "Maximum severity of adverse events (0-4)" },
  
  // Immunological Markers
  { key: "immun_marker_types", label: "Immunological Marker Types", type: "array", description: "Types of immunological markers", example: "DSA, PRA", guidance: "List of immunological marker types" },
  { key: "immun_marker_values", label: "Immunological Marker Values", type: "array", description: "Values of immunological markers", example: "5000, 20", guidance: "Corresponding values for markers" },
  
  // Immunosuppression Regimen - Boolean
  { key: "tacrolimus", label: "Tacrolimus", type: "boolean", description: "Patient on tacrolimus", guidance: "True if patient is taking tacrolimus" },
  { key: "ciclosporine", label: "Ciclosporine", type: "boolean", description: "Patient on ciclosporine", guidance: "True if patient is taking ciclosporine" },
  { key: "mmf", label: "MMF", type: "boolean", description: "Patient on mycophenolate mofetil", guidance: "True if patient is taking MMF" },
  { key: "azathioprine", label: "Azathioprine", type: "boolean", description: "Patient on azathioprine", guidance: "True if patient is taking azathioprine" },
  { key: "sirolimus", label: "Sirolimus", type: "boolean", description: "Patient on sirolimus", guidance: "True if patient is taking sirolimus" },
  { key: "corticosteroids", label: "Corticosteroids", type: "boolean", description: "Patient on corticosteroids", guidance: "True if patient is taking corticosteroids" },
  
  // Outcome - Boolean
  { key: "alive_with_graft", label: "Alive with Graft", type: "boolean", description: "Patient alive with functioning graft", guidance: "True if patient is alive with functioning graft" },
  { key: "return_to_dialysis", label: "Return to Dialysis", type: "boolean", description: "Patient returned to dialysis", guidance: "True if patient returned to dialysis" },
  { key: "death_with_graft", label: "Death with Graft", type: "boolean", description: "Patient died with functioning graft", guidance: "True if patient died with functioning graft" },
  { key: "lost_to_followup", label: "Lost to Follow-up", type: "boolean", description: "Patient lost to follow-up", guidance: "True if patient lost to follow-up" },
  { key: "delayed_graft_function", label: "Delayed Graft Function", type: "boolean", description: "Patient experienced DGF", guidance: "True if patient had delayed graft function" },
     // Follow-up Summary
  { key: "followup_count", label: "Follow-up Count", type: "numeric", unit: "count", description: "Total number of follow-ups", example: "5", validRange: "0-100", guidance: "Total number of follow-up visits" },
  { key: "adverse_event_rate", label: "Adverse Event Rate", type: "numeric", unit: "per follow-up", description: "Average adverse events per follow-up", example: "0.5", validRange: "0-10", guidance: "Adverse events divided by number of follow-ups" },
  
  // Biological Trends
  { key: "mean_creatinine", label: "Mean Creatinine", type: "numeric", unit: "mg/dL", description: "Average creatinine over time", example: "1.4", validRange: "0.3-10.0", guidance: "Average of all creatinine measurements" },
  { key: "max_creatinine", label: "Max Creatinine", type: "numeric", unit: "mg/dL", description: "Highest creatinine recorded", example: "2.5", validRange: "0.3-15.0", guidance: "Highest creatinine value ever recorded" },
  { key: "min_gfr", label: "Min eGFR", type: "numeric", unit: "mL/min", description: "Lowest eGFR recorded", example: "35", validRange: "0-150", guidance: "Lowest eGFR value ever recorded" },
  { key: "creatinine_trend", label: "Creatinine Trend", type: "categorical", options: ["improving", "stable", "worsening"], description: "Trend in creatinine levels", guidance: "Select the trend direction" },
  
  // Graft Status
  { key: "graft_loss", label: "Graft Loss", type: "boolean", description: "Patient has lost the graft", guidance: "True if graft failed, False otherwise" },
  { key: "patient_survival", label: "Patient Survival", type: "boolean", description: "Patient is alive", guidance: "True if patient is alive, False if deceased" },
  
  // Vital Signs - Numeric
  { key: "urine_output", label: "Urine Output", type: "numeric", unit: "mL/kg/hr", description: "Hourly urine output", example: "1.2", validRange: "0-10", guidance: "Enter urine output in mL per kg per hour (normal: >0.5)" },
  { key: "temperature", label: "Temperature", type: "numeric", unit: "°C", description: "Body temperature", example: "37.2", validRange: "35-42", guidance: "Enter body temperature in Celsius (normal: 36.5-37.5)" },
  { key: "blood_pressure", label: "Blood Pressure", type: "numeric", unit: "mmHg", description: "Systolic blood pressure", example: "120", validRange: "50-250", guidance: "Enter systolic blood pressure in mmHg" },
  { key: "heart_rate", label: "Heart Rate", type: "numeric", unit: "bpm", description: "Heart rate", example: "75", validRange: "40-200", guidance: "Enter heart rate in beats per minute (normal: 60-100)" },
  { key: "oxygen_saturation", label: "Oxygen Saturation", type: "numeric", unit: "%", description: "SpO2 level", example: "97", validRange: "0-100", guidance: "Enter oxygen saturation percentage (normal: >95)" },
  
  // Vital Signs - Categorical
  { key: "mental_status", label: "Mental Status", type: "categorical", options: ["Alert", "Confused", "Lethargic", "Unresponsive"], description: "Patient's mental state", guidance: "Select the patient's current mental status" },
  { key: "graft_ultrasound", label: "Graft Ultrasound", type: "categorical", options: ["Normal", "Increased RI", "Hydronephrosis", "No flow"], description: "Ultrasound findings", guidance: "Select the ultrasound finding" },
 // Demographics
  { key: "recipient_age", label: "Recipient Age", type: "numeric", unit: "years", description: "Age of the recipient at transplant", example: "45", validRange: "0-100", guidance: "Enter the recipient's age in years" },
  { key: "donor_age", label: "Donor Age", type: "numeric", unit: "years", description: "Age of the donor at donation", example: "35", validRange: "0-80", guidance: "Enter the donor's age in years" },
  { key: "sex", label: "Sex", type: "categorical", options: ["M", "F"], description: "Patient sex", guidance: "Enter 'M' for Male, 'F' for Female" },
  { key: "foreign_patient", label: "Foreign Patient", type: "boolean", description: "Patient is from abroad", guidance: "True if patient is foreign, False otherwise" },
  
  // Morphology
  { key: "height_cm", label: "Height", type: "numeric", unit: "cm", description: "Patient height", example: "170", validRange: "50-250", guidance: "Enter height in centimeters" },
  { key: "weight_kg", label: "Weight", type: "numeric", unit: "kg", description: "Patient weight", example: "70", validRange: "10-300", guidance: "Enter weight in kilograms" },
  { key: "bmi", label: "BMI", type: "numeric", unit: "kg/m²", description: "Body Mass Index", example: "24.2", guidance: "Automatically calculated from height/weight" },
  
  // Clinical History
  { key: "nephropathy", label: "Primary Nephropathy", type: "categorical", description: "Primary kidney disease", example: "Diabetic, Glomerular, Vascular, NTIC, Hereditary, NI", guidance: "Enter the primary nephropathy type" },
  { key: "dialysis_type", label: "Dialysis Type", type: "categorical", options: ["Hemodialysis", "Peritoneal Dialysis", "None"], description: "Type of dialysis", guidance: "Select the dialysis type" },
  { key: "dialysis_duration", label: "Dialysis Duration", type: "numeric", unit: "months", description: "Duration on dialysis", example: "24", validRange: "0-240", guidance: "Enter number of months on dialysis" },
  { key: "comorbidities", label: "Comorbidities", type: "categorical", description: "Other medical conditions", example: "COPD, CHF, Liver disease", guidance: "Enter comorbidities as text" },
  { key: "transplant_rank", label: "Transplant Rank", type: "numeric", unit: "count", description: "Number of previous transplants", example: "1", guidance: "Enter 1 for first transplant, 2 for second, etc." },
  
  // Pre-transplant Assessment - Boolean
  { key: "diabetes", label: "Diabetes", type: "boolean", description: "Patient has diabetes mellitus", guidance: "True if patient has diabetes, False otherwise" },
  { key: "hypertension", label: "Hypertension", type: "boolean", description: "Patient has hypertension", guidance: "True if patient has hypertension, False otherwise" },
  { key: "acc", label: "ACC", type: "boolean", description: "ACC status", guidance: "True if ACC present, False otherwise" },
  { key: "hbsag", label: "HBsAg", type: "boolean", description: "Hepatitis B surface antigen status", guidance: "True if positive, False if negative" },
  { key: "anti_hcv", label: "Anti-HCV", type: "boolean", description: "Hepatitis C antibody status", guidance: "True if positive, False if negative" },
  { key: "transfusion_history", label: "Transfusion History", type: "boolean", description: "Previous blood transfusions", guidance: "True if patient had transfusions, False otherwise" },
  
  // Pre-transplant Assessment - Categorical/Numeric
  { key: "eer_modality", label: "EER Modality", type: "categorical", options: ["Preemptive", "DP", "HD", "DP_HD"], description: "Dialysis modality", guidance: "Select: Preemptive (no dialysis), DP (Peritoneal), HD (Hemodialysis), DP_HD (both)" },
  { key: "previous_transplants", label: "Previous Transplants", type: "numeric", unit: "count", description: "Number of previous transplantations", example: "0, 1, 2", guidance: "Enter 0 for first transplant, 1 for second, etc." },
  { key: "etiology_irc", label: "Etiology IRC", type: "categorical", description: "Cause of kidney failure", example: "Hypertension, Diabetes, Glomerulonephritis", guidance: "Enter the cause of kidney failure" },
  { key: "transplant_delay", label: "Transplant Delay", type: "numeric", unit: "months", description: "Time on waiting list", example: "18", validRange: "0-120", guidance: "Enter months on waiting list" },
  { key: "serum_creatinine", label: "Serum Creatinine", type: "numeric", unit: "mg/dL", description: "Pre-transplant creatinine level", example: "1.2", validRange: "0.3-15.0", guidance: "Enter creatinine value in mg/dL" },
  
  // Transplant Conditions
  { key: "donor_type", label: "Donor Type", type: "categorical", options: ["Living Related", "Living Unrelated", "Deceased Donor", "Cadaveric"], description: "Type of donor", guidance: "Select the donor type" },
  { key: "cold_ischemia", label: "Cold Ischemia Time", type: "numeric", unit: "hours", description: "Cold ischemia duration", example: "8.5", validRange: "0-48", guidance: "Enter cold ischemia time in hours" },
  { key: "warm_ischemia", label: "Warm Ischemia Time", type: "numeric", unit: "minutes", description: "Warm ischemia duration", example: "35", validRange: "0-120", guidance: "Enter warm ischemia time in minutes" },
  { key: "transplant_location", label: "Transplant Location", type: "categorical", description: "Hospital where transplant was performed", example: "HCN, RABTA, SOUSSE", guidance: "Enter the hospital location" },
  { key: "service_origin", label: "Service Origin", type: "categorical", description: "Referring service", example: "Nephrology_HCN, Pediatrics_HCN", guidance: "Enter the referring service" },
  
  // Immunology - Computed values
  { key: "blood_compatibility", label: "Blood Compatibility", type: "computed", description: "Donor-recipient blood group compatibility", possibleValues: ["Identical", "Compatible", "Incompatible"], guidance: "Automatically computed from donor and recipient blood groups", expectedFormat: "One of: 'Identical', 'Compatible', 'Incompatible'" },
  { key: "hla_matching", label: "HLA Matching", type: "computed", description: "Donor-recipient HLA match level", possibleValues: ["0/6 mismatches", "1-2/6 mismatches", "3-4/6 mismatches", "5-6/6 mismatches"], guidance: "Automatically calculated from HLA typing data", expectedFormat: "Number of mismatches (0, 2, 4, 6)" },

]

export const SCORE_3_ATTRIBUTES = [
  // Follow-up Summary
  { key: "followup_count", label: "Follow-up Count", type: "numeric", unit: "count", description: "Total number of follow-ups", example: "5", validRange: "0-100", guidance: "Total number of follow-up visits" },
  { key: "adverse_event_rate", label: "Adverse Event Rate", type: "numeric", unit: "per follow-up", description: "Average adverse events per follow-up", example: "0.5", validRange: "0-10", guidance: "Adverse events divided by number of follow-ups" },
  
  // Biological Trends
  { key: "mean_creatinine", label: "Mean Creatinine", type: "numeric", unit: "mg/dL", description: "Average creatinine over time", example: "1.4", validRange: "0.3-10.0", guidance: "Average of all creatinine measurements" },
  { key: "max_creatinine", label: "Max Creatinine", type: "numeric", unit: "mg/dL", description: "Highest creatinine recorded", example: "2.5", validRange: "0.3-15.0", guidance: "Highest creatinine value ever recorded" },
  { key: "min_gfr", label: "Min eGFR", type: "numeric", unit: "mL/min", description: "Lowest eGFR recorded", example: "35", validRange: "0-150", guidance: "Lowest eGFR value ever recorded" },
  { key: "creatinine_trend", label: "Creatinine Trend", type: "categorical", options: ["improving", "stable", "worsening"], description: "Trend in creatinine levels", guidance: "Select the trend direction" },
  
  // Graft Status
  { key: "graft_loss", label: "Graft Loss", type: "boolean", description: "Patient has lost the graft", guidance: "True if graft failed, False otherwise" },
  { key: "patient_survival", label: "Patient Survival", type: "boolean", description: "Patient is alive", guidance: "True if patient is alive, False if deceased" },
  
  // Vital Signs - Numeric
  { key: "urine_output", label: "Urine Output", type: "numeric", unit: "mL/kg/hr", description: "Hourly urine output", example: "1.2", validRange: "0-10", guidance: "Enter urine output in mL per kg per hour (normal: >0.5)" },
  { key: "temperature", label: "Temperature", type: "numeric", unit: "°C", description: "Body temperature", example: "37.2", validRange: "35-42", guidance: "Enter body temperature in Celsius (normal: 36.5-37.5)" },
  { key: "blood_pressure", label: "Blood Pressure", type: "numeric", unit: "mmHg", description: "Systolic blood pressure", example: "120", validRange: "50-250", guidance: "Enter systolic blood pressure in mmHg" },
  { key: "heart_rate", label: "Heart Rate", type: "numeric", unit: "bpm", description: "Heart rate", example: "75", validRange: "40-200", guidance: "Enter heart rate in beats per minute (normal: 60-100)" },
  { key: "oxygen_saturation", label: "Oxygen Saturation", type: "numeric", unit: "%", description: "SpO2 level", example: "97", validRange: "0-100", guidance: "Enter oxygen saturation percentage (normal: >95)" },
  
  // Vital Signs - Categorical
  { key: "mental_status", label: "Mental Status", type: "categorical", options: ["Alert", "Confused", "Lethargic", "Unresponsive"], description: "Patient's mental state", guidance: "Select the patient's current mental status" },
  { key: "graft_ultrasound", label: "Graft Ultrasound", type: "categorical", options: ["Normal", "Increased RI", "Hydronephrosis", "No flow"], description: "Ultrasound findings", guidance: "Select the ultrasound finding" },
]

// Helper function to get attributes by score type
export const getAttributesByScore = (score: string) => {
  switch (score) {
    case "SCORE_1":
      return SCORE_1_ATTRIBUTES
    case "SCORE_2":
      return SCORE_2_ATTRIBUTES
    case "SCORE_3":
      return SCORE_3_ATTRIBUTES
    default:
      return []
  }
}