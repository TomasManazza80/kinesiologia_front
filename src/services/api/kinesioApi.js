import customFetchBase from "./customFetchBase.js";
import { authApi } from "./authApi.js";
import { toast } from "../../components/ui/use-toast";

export const kinesioApi = authApi.injectEndpoints({
    reducerPath: 'kinesioApi',
    baseQuery: customFetchBase,
    endpoints: (build) => ({
        getProfessionals: build.query({
            query: () => ({
                url: '/api/kinesio/professionals',
                method: 'GET',
            }),
            providesTags: ['Professionals'],
        }),
        getSpecialties: build.query({
            query: () => ({
                url: '/api/kinesio/specialties',
                method: 'GET',
            }),
            providesTags: ['Specialties'],
        }),
        createSpecialty: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/specialties',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Specialties']
        }),
        updateSpecialty: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/specialties/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Specialties', 'Professionals']
        }),
        deleteSpecialty: build.mutation({
            query: (id) => ({
                url: `/api/kinesio/specialties/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Specialties', 'Professionals']
        }),
        createProfessional: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/professionals',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Professionals']
        }),
        updateProfessional: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/professionals/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Professionals']
        }),
        deleteProfessional: build.mutation({
            query: ({ id, adminPassword }) => ({
                url: `/api/kinesio/professionals/${id}`,
                method: 'DELETE',
                body: { adminPassword }
            }),
            invalidatesTags: ['Professionals']
        }),
        updateProfile: build.mutation({
            query: (data) => ({
                url: '/user',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Profile']
        }),
        getProfile: build.query({
            query: () => ({
                url: '/user',
                method: 'GET'
            }),
            providesTags: ['Profile']
        }),
        getAppointments: build.query({
            query: ({ professional_id, start_date, end_date, patient_id } = {}) => {
                let url = '/api/kinesio/appointments?';
                if (professional_id) url += `professional_id=${professional_id}&`;
                if (start_date) url += `start_date=${start_date}&`;
                if (end_date) url += `end_date=${end_date}&`;
                if (patient_id) url += `patient_id=${patient_id}&`;
                return { url, method: 'GET' };
            },
            providesTags: (result, error, arg) => [{ type: 'Appointments', id: arg?.professional_id || arg?.patient_id || 'LIST' }],
        }),

        getMyAppointments: build.query({
            query: () => '/api/kinesio/my-appointments',
            providesTags: ['Appointments'],
        }),
        getPatients: build.query({
            query: () => ({ url: '/api/kinesio/patients', method: 'GET' }),
            providesTags: ['Patients'],
        }),
        createAppointment: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/appointments',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Appointments']
        }),
        notifyAppointment: build.mutation({
            query: (id) => ({
                url: `/api/kinesio/appointments/${id}/notify`,
                method: 'POST',
            }),
        }),
        updateAppointment: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/appointments/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Appointments']
        }),
        cancelAppointment: build.mutation({
            query: ({ id, cancel_reason }) => ({
                url: `/api/kinesio/appointments/${id}/cancel`,
                method: 'PUT',
                body: { cancel_reason },
            }),
            invalidatesTags: ['Appointments'],
        }),
        deleteAppointment: build.mutation({
            query: (id) => ({
                url: `/api/kinesio/appointments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Appointments']
        }),
        createPatient: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/patients',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Patients']
        }),
        updatePatient: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/patients/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Patients']
        }),
        deletePatient: build.mutation({
            query: (id) => ({
                url: `/api/kinesio/patients/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Patients'],
        }),
        sharePatient: build.mutation({
            query: ({ id, targetProfessionalIds, message }) => ({
                url: `/api/kinesio/patients/${id}/share`,
                method: 'POST',
                body: { targetProfessionalIds, message }
            }),
            invalidatesTags: ['Patients']
        }),
        getMedicalHistory: build.query({
            query: (patientId) => `/api/kinesio/history/patient/${patientId}`,
            providesTags: ['History'],
        }),
        createMedicalHistory: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/history',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['History']
        }),
        updateMedicalHistory: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/history/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['History']
        }),
        uploadImage: build.mutation({
            query: (formData) => ({
                url: '/api/upload',
                method: 'POST',
                body: formData,
            }),
        }),
        // Availability Endpoints
        getAvailability: build.query({
            query: (professional_id) => ({ 
                url: `/api/kinesio/availability${professional_id ? `?professional_id=${professional_id}` : ''}`, 
                method: 'GET' 
            }),
            providesTags: ['Availability']
        }),
        saveAvailability: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/availability',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Availability']
        }),
        // Balance Endpoints
        getBalance: build.query({
            query: (arg) => {
                let filter = 'Mes';
                let scope = 'personal';
                if (typeof arg === 'string') {
                    filter = arg;
                } else if (typeof arg === 'object' && arg !== null) {
                    filter = arg.filter || 'Mes';
                    scope = arg.scope || 'personal';
                }
                return { url: `/api/kinesio/balance?filter=${filter}&scope=${scope}`, method: 'GET' };
            },
            providesTags: ['Balance']
        }),
        createTransaction: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/transactions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Balance']
        }),
        getTransactionHistory: build.query({
            query: ({ offset = 0, limit = 50, scope = 'personal' } = {}) => ({
                url: `/api/kinesio/transactions/history?offset=${offset}&limit=${limit}&scope=${scope}`,
                method: 'GET'
            }),
            providesTags: ['Balance']
        }),
        updateTransaction: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/transactions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Balance']
        }),
        deleteTransaction: build.mutation({
            query: ({ id, scope = 'personal' }) => ({
                url: `/api/kinesio/transactions/${id}?scope=${scope}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Balance']
        }),
        // Public Endpoints
        getPublicProfessionals: build.query({
            query: () => ({ url: '/api/public/professionals', method: 'GET' }),
        }),
        getAvailableSlots: build.query({
            query: ({ professional_id, date, service }) => {
                let url = `/api/public/available-slots?professional_id=${professional_id}&date=${date}`;
                if (service) url += `&service=${service}`;
                return { url, method: 'GET' };
            }
        }),
        createPublicAppointment: build.mutation({
            query: (data) => ({
                url: '/api/public/appointments',
                method: 'POST',
                body: data,
            })
        }),
        getWhatsappStatus: build.query({
            query: (profId) => `/api/whatsapp/status${profId ? `?prof_id=${profId}` : ''}`,
            providesTags: ['WhatsApp']
        }),
        startWhatsapp: build.mutation({
            query: (profId) => ({
                url: `/api/whatsapp/start`,
                method: 'POST',
                body: { prof_id: profId }
            }),
            invalidatesTags: ['WhatsApp']
        }),
        getWhatsappQr: build.query({
            query: (profId) => `/api/whatsapp/qr${profId ? `?prof_id=${profId}` : ''}`,
            providesTags: ['WhatsApp']
        }),
        disconnectWhatsapp: build.mutation({
            query: (profId) => ({
                url: `/api/whatsapp/disconnect`,
                method: 'POST',
                body: { prof_id: profId }
            }),
            invalidatesTags: ['WhatsApp']
        }),
        saveWhatsappTemplate: build.mutation({
            query: ({ template, profId }) => ({
                url: `/api/whatsapp/template`,
                method: 'PUT',
                body: { template, prof_id: profId }
            }),
            invalidatesTags: ['WhatsApp']
        }),
        // Medical Templates
        getTemplates: build.query({
            query: () => '/api/kinesio/templates',
            providesTags: ['Templates']
        }),
        createTemplate: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/templates',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Templates']
        }),
        updateTemplate: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/templates/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Templates']
        }),
        // Medical Records (Dynamic)
        getMedicalRecords: build.query({
            query: (patientId) => `/api/kinesio/medical-records/patient/${patientId}`,
            providesTags: ['MedicalRecords']
        }),
        createMedicalRecord: build.mutation({
            query: (data) => ({
                url: '/api/kinesio/medical-records',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['MedicalRecords']
        }),
        updateMedicalRecord: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/kinesio/medical-records/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['MedicalRecords']
        })
    }),
    overrideExisting: false,
});

export const {
    useGetProfessionalsQuery,
    useGetSpecialtiesQuery,
    useCreateSpecialtyMutation,
    useUpdateSpecialtyMutation,
    useDeleteSpecialtyMutation,
    useCreateProfessionalMutation,
    useUpdateProfessionalMutation,
    useDeleteProfessionalMutation,
    useUpdateProfileMutation,
    useGetProfileQuery,
    useGetAppointmentsQuery,
    useGetMyAppointmentsQuery,
    useGetPatientsQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useCancelAppointmentMutation,
    useDeleteAppointmentMutation,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
    useSharePatientMutation,
    useGetMedicalHistoryQuery,
    useCreateMedicalHistoryMutation,
    useUpdateMedicalHistoryMutation,
    useUploadImageMutation,
    useGetAvailabilityQuery,
    useSaveAvailabilityMutation,
    useNotifyAppointmentMutation,
    useGetPublicProfessionalsQuery,
    useGetAvailableSlotsQuery,
    useCreatePublicAppointmentMutation,
    useGetBalanceQuery,
    useCreateTransactionMutation,
    useGetTransactionHistoryQuery,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
    useGetWhatsappStatusQuery,
    useStartWhatsappMutation,
    useGetWhatsappQrQuery,
    useDisconnectWhatsappMutation,
    useSaveWhatsappTemplateMutation,
    useGetTemplatesQuery,
    useCreateTemplateMutation,
    useUpdateTemplateMutation,
    useGetMedicalRecordsQuery,
    useCreateMedicalRecordMutation,
    useUpdateMedicalRecordMutation
} = kinesioApi;
