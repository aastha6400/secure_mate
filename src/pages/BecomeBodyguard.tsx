import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { User, Phone, Mail, MapPin, IndianRupee, Clock, Upload, Shield } from 'lucide-react';

const BecomeBodyguard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    experience: '',
    hourlyRate: '',
    location: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'id') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfilePhoto(file);
      } else {
        setIdProof(file);
      }
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${auth.uid()}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('bodyguard-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('bodyguard-files')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: 'bodyguard'
          }
        }
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create account');
        setLoading(false);
        return;
      }

      // Ensure the client is fully authenticated
      await supabase.auth.getSession();

      // Upload files
      let profilePhotoUrl = null;
      let idProofUrl = null;

      if (profilePhoto) {
        profilePhotoUrl = await uploadFile(profilePhoto, 'profiles');
      }

      if (idProof) {
        idProofUrl = await uploadFile(idProof, 'id-proofs');
      }

      // Insert bodyguard profile
      const { error: insertError } = await supabase
        .from('bodyguards')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          profile_photo: profilePhotoUrl,
          experience: parseInt(formData.experience),
          hourly_rate: parseFloat(formData.hourlyRate),
          location: formData.location,
          id_proof: idProofUrl,
          status: 'pending'
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      // Redirect to pending page
      navigate('/bodyguard-pending');
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 pt-20">
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Become a Bodyguard</h1>
            <p className="text-neutral-600">Join our elite team of professional security guards</p>
          </div>

          {/* Form Card */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-neutral-100/50 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/20 rounded-tl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/20 rounded-br-2xl"></div>

            <div className="relative p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Years of Experience *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                          placeholder="5"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Hourly Rate (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                          placeholder="500"
                          min="0"
                          step="50"
                          required
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        City/Location *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                          placeholder="Ahmedabad"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Profile Photo
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'profile')}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                        />
                      </div>
                      {profilePhoto && (
                        <p className="text-xs text-green-600 mt-1">✓ {profilePhoto.name}</p>
                      )}
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        ID Proof (Aadhar/PAN/License)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, 'id')}
                          className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                        />
                      </div>
                      {idProof && (
                        <p className="text-xs text-green-600 mt-1">✓ {idProof.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-neutral-200">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading}
                    className="py-4"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                  
                  <p className="text-xs text-neutral-500 text-center mt-3">
                    By submitting, you agree to our terms and conditions. Your application will be reviewed within 24-48 hours.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeBodyguard;