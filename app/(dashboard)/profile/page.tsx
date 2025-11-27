'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../../components/UI';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { Upload } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    const userData = authService.getUser();
    setUser(userData);
    if (userData?.avatar) setPreviewImage(userData.avatar);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    
    const updatedUser: User = {
      ...user,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      // Use the preview image (Base64) if changed, otherwise fallback to existing
      avatar: previewImage || user.avatar, 
    };

    try {
      await authService.updateProfile(updatedUser);
      setUser(updatedUser);
      setMessage('Profile updated successfully!');
      // Force reload to update header immediately
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setMessage('Failed to update profile.');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings</p>
      </div>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-md group">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                  
                  {/* Hidden file input strictly positioned over the image area */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="text-center">
                    <button type="button" className="relative text-sm text-primary-600 font-medium hover:text-primary-500">
                        <span>Upload new photo</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max 1MB.</p>
                </div>
            </div>
            
            <div className="flex-1 w-full space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input 
                    name="name" 
                    defaultValue={user.name} 
                    required 
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input 
                    name="email" 
                    type="email" 
                    defaultValue={user.email} 
                    required 
                  />
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}