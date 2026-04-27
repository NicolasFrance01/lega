CREATE TABLE IF NOT EXISTS medical_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    result_type VARCHAR(20) NOT NULL CHECK (result_type IN ('pdf', 'image', 'note')),
    content TEXT NOT NULL,
    filename TEXT,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_medical_results_patient ON medical_results(patient_id);
CREATE INDEX idx_medical_results_appointment ON medical_results(appointment_id);
