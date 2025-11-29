'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../../components/UI';
import { useUser } from '@clerk/nextjs';
import { Upload } from 'lucide-react';

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      // Load profile from database
      loadProfile();
      
      // Fallback to Clerk data if no DB profile
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const profile = await response.json();
        if (profile) {
          setFirstName(profile.firstName || '');
          setLastName(profile.lastName || '');
          setProfileImage(profile.imageUrl || '');
          setBio(profile.bio || '');
          setPhone(profile.phone || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 1MB)
      if (file.size > 1024 * 1024) {
        setMessage('Image size must be less than 1MB');
        return;
      }

      // Create a compressed version
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize to max 300x300 to reduce size
        const maxSize = 300;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setProfileImage(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage('');

    try {
      // Save to database
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          imageUrl: profileImage,
          bio,
          phone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Also update Clerk for consistency (optional)
      await user.update({
        firstName: firstName,
        lastName: lastName,
      });
      
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : user.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-400">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                  )}
                  
                  {/* Overlay for hover effect */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                  
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                
                <div className="text-center">
                    <button type="button" className="relative text-sm text-primary-600 font-medium hover:text-primary-500">
                        <span>Change Profile Picture</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </button>
                    <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max 1MB.</p>
                    <p className="text-xs text-gray-400 mt-1">Default: Gmail profile picture</p>
                </div>
            </div>
            
            <div className="flex-1 w-full space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <Input 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required 
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <Input 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required 
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input 
                    value={user.primaryEmailAddress?.emailAddress || 'No email'}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed here. Manage it in your Google account.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
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
