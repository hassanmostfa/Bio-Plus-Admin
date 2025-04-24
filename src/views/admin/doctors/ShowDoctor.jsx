import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetDoctorQuery } from 'api/doctorSlice';


const ShowDoctor = () => {
  const { id } = useParams();
  const { data: doctor, isLoading, error } = useGetDoctorQuery(id);
 
  if (isLoading) return <div className="text-center mt-10">Loading...</div>;
  if (error || !doctor) return <div className="text-center mt-10">Error loading doctor details.</div>;
  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <img
          src={`https://your-s3-bucket-url.com/${doctor?.data.imageKey}`}
          alt={doctor?.data.fullName}
          className="w-32 h-32 object-cover rounded-full shadow-md"
        />
        <div>
          <h2 className="text-2xl font-bold">{doctor?.data.fullName}</h2>
          <p className="text-gray-500">{doctor?.data.title}</p>
          <p className="text-blue-600">{doctor?.data.specialization}</p>
        </div>
      </div>

      {/* About Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">About</h3>
        <p className="text-gray-700">{doctor?.data.about}</p>
      </div>

      {/* Clinics */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Clinics</h3>
        <ul className="list-disc list-inside text-gray-700">
          {doctor?.data.clinics?.map((clinic) => (
            <li key={clinic.id}>{clinic.clinicName}</li>
          ))}
        </ul>
      </div>

      {/* Fees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-600">Clinic Fees:</h4>
          <p className="text-gray-800">{doctor?.data.clinicFees} EGP</p>
        </div>
        <div>
          <h4 className="font-medium text-gray-600">Online Fees:</h4>
          <p className="text-gray-800">{doctor?.data.onlineFees} EGP</p>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Contact</h3>
        <p><strong>Email:</strong> {doctor?.data.email}</p>
        <p><strong>Phone:</strong> {doctor?.data.phones?.[0]?.phoneNumber}</p>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Languages</h3>
        <p>{doctor?.data.languages?.join(', ')}</p>
      </div>

      {/* Certificates */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Certificates</h3>
        <div className="flex gap-4">
          {doctor.certificates?.map((cert) => (
            <img
              key={cert.id}
              src={`${cert.imageKey}`}
              alt="Certificate"
              className="w-28 h-20 object-cover rounded shadow"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowDoctor;
