'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '../../../components/UI';
import { useUser } from '@clerk/nextjs';
import { Upload, User, Mail, Phone, FileText, Camera } from 'lucide-react';

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setInitialLoading(true);
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
      } else if (response.status === 404) {
        await createInitialProfile();
      } else {
        setFirstName(user?.firstName || '');
        setLastName(user?.lastName || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setFirstName(user?.firstName || '');
      setLastName(user?.lastName || '');
    } finally {
      setInitialLoading(false);
    }
  };

  const createInitialProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          imageUrl: user?.imageUrl || '',
          bio: '',
          phone: '',
        }),
      });

      if (response.ok) {
        const profile = await response.json();
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setProfileImage(profile.imageUrl || '');
        setBio(profile.bio || '');
        setPhone(profile.phone || '');
      }
    } catch (error) {
      console.error('Error creating initial profile:', error);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage('Image size must be less than 1MB');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
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

      await user.update({
        firstName: firstName,
        lastName: lastName,
      });

      setMessage('success:Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('error:Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !user || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Profile Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your account information and preferences.</p>
      </div>

      <div className="relative overflow-hidden p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">

          {/* Notification Message */}
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.includes('success')
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}>
              {message.replace('success:', '').replace('error:', '')}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-12">

            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative group">
                <div className="h-40 w-40 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl ring-2 ring-zinc-100 dark:ring-zinc-800">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : user.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-5xl font-bold text-zinc-400">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                <label className="absolute bottom-1 right-1 p-2.5 rounded-full bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-105 transition-all duration-200 group-hover:block">
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile Photo</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">JPG, GIF or PNG. Max 1MB.</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <User size={16} /> First Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First Name"
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <User size={16} /> Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last Name"
                    className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500 dark:focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </label>
                <div className="relative">
                  <Input
                    value={user.primaryEmailAddress?.emailAddress || 'No email'}
                    disabled
                    className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 cursor-not-allowed pl-10"
                  />
                  <Mail size={16} className="absolute left-3 top-3 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">Managed via Google Account</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-blue-500 dark:focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <FileText size={16} /> Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a bit about yourself..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-zinc-400 dark:placeholder-zinc-600 resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="submit"
              isLoading={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 h-auto rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
