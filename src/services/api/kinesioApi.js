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
            query: ({ professional_id, start_date, end_date } = {}) => {
                let url = '/api/kinesio/appointments?';
                if (professional_id) url += `professional_id=${professional_id}&`;
                if (start_date) url += `start_date=${start_date}&`;
                if (end_date) url += `end_date=${end_date}`;
                return { url, method: 'GET' };
            },
            providesTags: (result, error, arg) => [{ type: 'Appointments', id: arg?.professional_id || 'LIST' }],
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
        getMedicalHistory: build.query({
            query: (patientId) => `/api/kinesio/history/patient/${patientId}`,
            providesTags: ['History'],
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
            query: (filter) => ({ url: `/api/kinesio/balance?filter=${filter}`, method: 'GET' }),
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
            query: ({ offset = 0, limit = 50 }) => ({
                url: `/api/kinesio/transactions/history?offset=${offset}&limit=${limit}`,
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
    }),
    overrideExisting: false,
});

export const {
    useGetProfessionalsQuery,
    useCreateProfessionalMutation,
    useUpdateProfessionalMutation,
    useUpdateProfileMutation,
    useGetProfileQuery,
    useGetAppointmentsQuery,
    useGetMyAppointmentsQuery,
    useGetPatientsQuery,
    useCreateAppointmentMutation,
    useCreatePatientMutation,
    useUpdatePatientMutation,
    useDeletePatientMutation,
    useGetMedicalHistoryQuery,
    useGetAvailabilityQuery,
    useSaveAvailabilityMutation,
    useGetPublicProfessionalsQuery,
    useGetAvailableSlotsQuery,
    useCreatePublicAppointmentMutation,
    useGetBalanceQuery,
    useCreateTransactionMutation,
    useGetTransactionHistoryQuery,
    useUpdateTransactionMutation,
} = kinesioApi;
